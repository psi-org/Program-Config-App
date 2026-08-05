import type { TrackerErrorReport } from '../../../types';
import type {
  AttributeValue,
  DataElement,
  ProgramStageDataElement,
} from '../H2Convert/h2Convert.types';
import type { NotificationPayload } from '../ProgramNew/programNew.types';

export interface ProgramConfigSummary {
  id: string;
  name: string;
  attributeValues: AttributeValue[];
}

export interface H2TransferProps {
  programConfig: ProgramConfigSummary;
  setTransferH2Program: (value: ProgramConfigSummary | undefined) => void;
  setNotification: (value: NotificationPayload) => void;
  doSearch: (value: string) => void;
}

export interface H2ProgramStage {
  id: string;
  name: string;
  programStageDataElements: ProgramStageDataElement[];
}

export interface H2ProgramMetadata {
  id: string;
  name: string;
  attributeValues: AttributeValue[];
  programStages: H2ProgramStage[];
  organisationUnits: Array<{ id: string }>;
}

export interface TrackerEventDataValue {
  dataElement: string;
  value: string;
}

export interface TrackerEvent {
  event: string | null;
  program?: string;
  orgUnit: string;
  occurredAt: string;
  programStage: string;
  status?: string;
  completedAt?: string;
  storedBy?: string;
  dataValues: TrackerEventDataValue[];
  notes?: unknown[];
}

export interface EventListItem {
  event: string;
  orgUnit: string;
}

export interface TransferredEventRecord {
  transferDate: string;
  trackedEntityInstance?: string;
  enrollment?: string;
  originEvent: string;
}

export type TransferredEventsStore = Record<string, TransferredEventRecord>;

export interface FailedTransferRecord {
  event: string;
  reason: string;
  errors: TrackerErrorReport[];
}

export interface MapDataElementEntry {
  metadata: { scoreNum?: number; scoreDen?: number; isCritical?: string };
  critical: boolean;
}

export interface HnqisTrackedEntity {
  orgUnit: string;
  trackedEntityType: string;
  attributes: Array<{ attribute: string; value: string }>;
  enrollments: Array<{
    orgUnit: string;
    program: string;
    enrolledAt: string;
    occurredAt: string;
    events: TrackerEvent[];
  }>;
}

export interface BuildActionPlanArgs {
  eventTemplate: TrackerEvent;
  apStage: string;
  action?: string;
  responsible?: string;
  dueDate?: string;
  completionDate?: string;
}

export interface BuildHnqisTEIArgs {
  event: TrackerEvent;
  metadataH2: Record<string, unknown> & {
    healthArea?: string;
    useCompetencyClass?: string;
  };
  mapDataElements: Record<string, MapDataElementEntry>;
  competencyMap: Record<string, string>;
  actionPlanControlDEs: string[];
  assessmentStageId: string;
  actionPlanStageId: string;
  assessmentStageDataElements: ProgramStageDataElement[];
  h2ProgramId: string;
}

export type { AttributeValue, DataElement, ProgramStageDataElement };
