import {
  ACTION_PLAN_ACTION,
  ACTION_PLAN_DUE_DATE,
  ACTION_PLAN_RESPONSIBLE,
  ASSESSMENT_DATE_ATTRIBUTE,
  ASSESSMENT_TET,
  COMPETENCY_CLASS,
  CRITICAL_STEPS,
  HEALTH_AREA_ATTRIBUTE,
  H1_ACTION1,
  H1_ACTION1_OLD,
  H1_ACTION2,
  H1_ACTION2_OLD,
  H1_ACTION3,
  H1_ACTION_PLAN_OLD,
  H1_COMPETENCY_CLASS,
  H1_COMPLETION_DATE1,
  H1_COMPLETION_DATE2,
  H1_COMPLETION_DATE3,
  H1_DUE_DATE1,
  H1_DUE_DATE2,
  H1_DUE_DATE3,
  H1_RESPONSIBLE1,
  H1_RESPONSIBLE2,
  H1_RESPONSIBLE3,
  NON_CRITICAL_STEPS,
  ORGANISATION_UNIT_ATTRIBUTE,
} from '../../../configs/Constants';
import type { TrackerErrorReport, TrackerImportResponse } from '../../../types';
import { DeepCopy } from '../../../utils/Utils';
import type {
  BuildActionPlanArgs,
  BuildHnqisTEIArgs,
  HnqisTrackedEntity,
  TrackerEvent,
} from './h2Transfer.types';

type TrackerImportEnvelope = TrackerImportResponse & {
  response?: TrackerImportResponse;
};

// DHIS2 wraps the real import report under `response` when the request
// fails with a non-2xx status (the standard WebMessage envelope); a 2xx
// response has the report at the top level.
const unwrapTrackerReport = (
  payload: unknown
): TrackerImportResponse | undefined => {
  const report = payload as TrackerImportEnvelope | undefined;
  return report?.response ?? report;
};

export const extractTrackerErrors = (
  payload: unknown
): TrackerErrorReport[] => {
  const errorPayload = payload as { details?: unknown } | undefined;
  const report = unwrapTrackerReport(errorPayload?.details ?? payload);
  return report?.validationReport?.errorReports ?? [];
};

export const buildActionPlan = ({
  eventTemplate,
  apStage,
  action,
  responsible,
  dueDate,
  completionDate,
}: BuildActionPlanArgs): TrackerEvent | undefined => {
  if (!action) {
    return undefined;
  }

  eventTemplate.occurredAt = completionDate || eventTemplate.occurredAt;
  eventTemplate.programStage = apStage;

  eventTemplate.dataValues.push({
    dataElement: ACTION_PLAN_ACTION,
    value: action,
  });

  eventTemplate.dataValues.push({
    dataElement: ACTION_PLAN_RESPONSIBLE,
    value: responsible || '-',
  });

  eventTemplate.dataValues.push({
    dataElement: ACTION_PLAN_DUE_DATE,
    value: dueDate || '-',
  });

  return eventTemplate;
};

export const buildHnqisTEI = ({
  event,
  metadataH2,
  mapDataElements,
  competencyMap,
  actionPlanControlDEs,
  assessmentStageId,
  actionPlanStageId,
  assessmentStageDataElements,
  h2ProgramId,
}: BuildHnqisTEIArgs): HnqisTrackedEntity => {
  const h2Events: TrackerEvent[] = [];

  const parsedEventDate = event.occurredAt.split('T')[0];

  // *Events Creation (One event for the assessment and up to three action plans)
  const eventTemplate: TrackerEvent = {
    event: null,
    dataValues: [], //* Format -> {dataElement: 'id', value: 'value'}
    occurredAt: parsedEventDate,
    orgUnit: event.orgUnit,
    program: h2ProgramId,
    programStage: '',
    storedBy: event.storedBy,
    completedAt: event.completedAt,
    status: event.status,
  };

  const actionPlanDataValues = event.dataValues.reduce<Record<string, string>>(
    (acu, de) => {
      const mapVal = actionPlanControlDEs.find((cde) => cde === de.dataElement);
      if (mapVal) {
        acu[mapVal] = de.value;
      }
      return acu;
    },
    {}
  );

  const assessmentDataValues = event.dataValues.reduce<Record<string, string>>(
    (acu, de) => {
      if (!actionPlanControlDEs.includes(de.dataElement)) {
        acu[de.dataElement] = de.value;
      }
      return acu;
    },
    {}
  );

  // *Action Plan Events
  const actionPlan1 = buildActionPlan({
    eventTemplate: DeepCopy(eventTemplate),
    apStage: actionPlanStageId,
    action:
      actionPlanDataValues[H1_ACTION1] ||
      actionPlanDataValues[H1_ACTION_PLAN_OLD],
    responsible: actionPlanDataValues[H1_RESPONSIBLE1],
    dueDate: actionPlanDataValues[H1_DUE_DATE1],
    completionDate: actionPlanDataValues[H1_COMPLETION_DATE1],
  });

  if (actionPlan1) {
    h2Events.push(actionPlan1);
  }

  const actionPlan2 = buildActionPlan({
    eventTemplate: DeepCopy(eventTemplate),
    apStage: actionPlanStageId,
    action:
      actionPlanDataValues[H1_ACTION2] || actionPlanDataValues[H1_ACTION1_OLD],
    responsible: actionPlanDataValues[H1_RESPONSIBLE2],
    dueDate: actionPlanDataValues[H1_DUE_DATE2],
    completionDate: actionPlanDataValues[H1_COMPLETION_DATE2],
  });

  if (actionPlan2) {
    h2Events.push(actionPlan2);
  }

  const actionPlan3 = buildActionPlan({
    eventTemplate: DeepCopy(eventTemplate),
    apStage: actionPlanStageId,
    action:
      actionPlanDataValues[H1_ACTION3] || actionPlanDataValues[H1_ACTION2_OLD],
    responsible: actionPlanDataValues[H1_RESPONSIBLE3],
    dueDate: actionPlanDataValues[H1_DUE_DATE3],
    completionDate: actionPlanDataValues[H1_COMPLETION_DATE3],
  });

  if (actionPlan3) {
    h2Events.push(actionPlan3);
  }

  // *TEI Configuration
  const hnqisTEI: HnqisTrackedEntity = {
    orgUnit: event.orgUnit,
    trackedEntityType: ASSESSMENT_TET,
    attributes: [
      {
        attribute: ASSESSMENT_DATE_ATTRIBUTE,
        value: parsedEventDate,
      },
      {
        attribute: HEALTH_AREA_ATTRIBUTE,
        value: metadataH2.healthArea ?? '',
      },
      { attribute: ORGANISATION_UNIT_ATTRIBUTE, value: '' }, //! Stores the Org Unit Code (not present in every OU)
    ],
    enrollments: [],
  };

  // *Assessment Event
  const assessmentEvent: TrackerEvent = DeepCopy(eventTemplate);
  assessmentEvent.programStage = assessmentStageId;
  let criticalNum = 0;
  let criticalDen = 0;
  let nonCriticalNum = 0;
  let nonCriticalDen = 0;

  assessmentStageDataElements.forEach((psde) => {
    const deID = psde.dataElement.id;
    const deValue = assessmentDataValues[deID];

    if (
      deValue &&
      ![COMPETENCY_CLASS, CRITICAL_STEPS, NON_CRITICAL_STEPS].includes(deID)
    ) {
      const mappedDe = mapDataElements[deID];
      const num = mappedDe?.metadata.scoreNum;
      const den = mappedDe?.metadata.scoreDen;

      if (num && den) {
        if (mappedDe.critical) {
          criticalNum += num * parseFloat(deValue || '0');
          criticalDen += den;
        } else {
          nonCriticalNum += num * parseFloat(deValue || '0');
          nonCriticalDen += den;
        }
      }
      assessmentEvent.dataValues.push({
        dataElement: deID,
        value: deValue,
      });
    }
  });

  assessmentEvent.dataValues.push({
    dataElement: CRITICAL_STEPS,
    value: criticalDen > 0 ? (criticalNum / criticalDen) * 100 + '' : '',
  });

  assessmentEvent.dataValues.push({
    dataElement: NON_CRITICAL_STEPS,
    value:
      nonCriticalDen > 0 ? (nonCriticalNum / nonCriticalDen) * 100 + '' : '',
  });

  // *Competency Assignment
  if (metadataH2.useCompetencyClass === 'Yes') {
    const eventCompetency =
      competencyMap[
        event.dataValues.find((dv) => dv.dataElement === H1_COMPETENCY_CLASS)
          ?.value ?? ''
      ];

    if (eventCompetency) {
      assessmentEvent.dataValues.push({
        dataElement: COMPETENCY_CLASS,
        value: eventCompetency,
      });
    }
  }

  h2Events.push(assessmentEvent);

  // *Enrollment Configuration
  hnqisTEI.enrollments = [
    {
      orgUnit: event.orgUnit,
      program: h2ProgramId,
      enrolledAt: parsedEventDate,
      occurredAt: parsedEventDate,
      events: h2Events,
    },
  ];

  return hnqisTEI;
};
