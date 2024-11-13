const {
    ASSIGNED_TO_ATTRIBUTE,
    PERIOD_START_ATTRIBUTE,
    PERIOD_END_ATTRIBUTE,
    ASSESSMENT_PERIOD_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    ORGANISATION_UNIT_ATTRIBUTE,
    ASSESSMENT_DATE_ATTRIBUTE,
    METADATA
} = require("./Constants.js")

const Program = {
    "id": "programId",
    "name": "programName",
    "shortName": "programShortName",
    "programType": "WITH_REGISTRATION",
    "skipOffline": false,
    "enrollmentDateLabel": "Enrollment date",
    "registration": true,
    "displayFrontPageList": true,
    "programStages": []
}

const EventStage = {
    "id": "Stage Id",
    "name": "Program Name",
    "validationStrategy": "ValidationStrat",
    "programStageDataElements": [],
    "notificationTemplates": [],
    "programStageSections": []
}

const HnqisProgramConfigs = {
    "trackedEntityType": { "id": "oNwpeWkfoWc" },
    "attributeValues": [
        {
            "attribute": { "id": METADATA },
            "value": "{\"buildVersion\":\"1.1\",\"useCompetencyClass\":\"Yes\",\"dePrefix\":\"programDEPrefix\"}"
        }
    ],
    "programTrackedEntityAttributes": [
        {
            "trackedEntityAttribute": { "id": HEALTH_AREA_ATTRIBUTE },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 1
        },
        {
            "trackedEntityAttribute": { "id": ORGANISATION_UNIT_ATTRIBUTE },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 2
        },
        {
            "trackedEntityAttribute": { "id": ASSESSMENT_DATE_ATTRIBUTE },
            "mandatory": false,
            "valueType": "DATE",
            "searchable": true,
            "displayInList": true,
            "sortOrder": 3
        }
    ],
    "userGroupAccesses": []
}

const HNQISMWI_Attributes = [
    {
        "trackedEntityAttribute": { "id": ASSIGNED_TO_ATTRIBUTE },
        "mandatory": true,
        "valueType": "TEXT",
        "searchable": true,
        "displayInList": true,
        "sortOrder": 4
    },
    {
        "trackedEntityAttribute": { "id": PERIOD_START_ATTRIBUTE },
        "mandatory": true,
        "valueType": "DATE",
        "searchable": true,
        "allowFutureDate": true,
        "displayInList": false,
        "sortOrder": 5
    },
    {
        "trackedEntityAttribute": { "id": PERIOD_END_ATTRIBUTE },
        "mandatory": true,
        "valueType": "DATE",
        "searchable": true,
        "allowFutureDate": true,
        "displayInList": false,
        "sortOrder": 6
    },
    {
        "trackedEntityAttribute": { "id": ASSESSMENT_PERIOD_ATTRIBUTE },
        "mandatory": true,
        "valueType": "TEXT",
        "searchable": true,
        "displayInList": true,
        "sortOrder": 7
    }
]

const COMPETENCY_TEA = {
    "trackedEntityAttribute": { "id": "ulU9KKgSLYe" },
    "mandatory": false,
    "valueType": "TEXT",
    "searchable": false,
    "displayInList": false,
    "sortOrder": 5
}

const PS_AssessmentStage = {
    "autoGenerateEvent": true,
    "executionDateLabel": "Assessment date",
    "generatedByEnrollmentDate": true,
    "hideDueDate": true,
    "id": "assessmentId",
    "minDaysFromStart": 0,
    "name": "Assessment",
    "openAfterEnrollment": true,
    "program": {"id": "programId"},
    "programStageDataElements": [],
    "programStageSections": [],
    "remindCompleted": true,
    "repeatable": false,
    "displayGenerateEventBox": false, 
    "allowGenerateNextVisit": false,
    "reportDateToUse": "enrollmentDate",
    "sortOrder": 1,
    "style": {
        "color": "#ffff00",
        "icon": "clinical_fe_outline"
    },
    "userGroupAccesses": []
}

const PS_ActionPlanStage = {
    "autoGenerateEvent": false,
    "generatedByEnrollmentDate": false,
    "hideDueDate": false,
    "id": "actionPlanId",
    "minDaysFromStart": 0,
    "name": "Action Plan",
    "openAfterEnrollment": false,
    "program": {"id": "programId"},
    "programStageDataElements": [],
    "programStageSections": [],
    "remindCompleted": false,
    "repeatable": true,
    "sortOrder": 2,
    "style": {"color": "#00b0ff"},
    "userGroupAccesses": []
}

const PSDE_HNQIS_ActionPlan = [
    {
        "sortOrder": 1,
        "compulsory": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "F0Qcr8ANr7t" }
    },
    {
        "sortOrder": 2,
        "compulsory": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "nswci5V4j0d" }
    },
    {
        "sortOrder": 3,
        "compulsory": "true",
        "allowFutureDate": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "DIoqtxbSJIL" }
    }
];

const PSS_Default = {
    "sortOrder": 10,
    "name": "Default",
    "programStage": {"id": "assessmentId"},
    "dataElements": [],
    "id": "defaultSectionId"
}

const PSS_CriticalSteps = {
    "sortOrder": 20,
    "name": "Critical Steps Calculations",
    "programStage": {"id": "assessmentId"},
    "dataElements": [
        {"id": "VqBfZjZhKkU"},
        {"id": "pzWDtDUorBt"},
        {"id": "NAaHST5ZDTE"}
    ],
    "id": "stepsSectionId"
}

const PSS_Scores = {
    "sortOrder": 30,
    "name": "Scores",
    "programStage": {"id": "assessmentId"},
    "dataElements": [],
    "id": "scoresSectionId"
}

const PS_Generic = {
    "id": "stageID",
    "name": "Stage",
    "displayGenerateEventBox": true,
    "autoGenerateEvent": true,
    "program": {
        "id": "programID"
    },
    "programStageDataElements": [],
    "notificationTemplates": [],
    "attributeValues": [],
    "programStageSections": []
}

const OS_HNQISMWI_Criterion = {
    "name": "optionSet Name",
    "id": "optionSetId",
    "valueType": "TEXT",
    "favorite": false,
    "favorites": [],
    "userGroupAccesses": [],
    "attributeValues": [],
    "translations": [],
    "userAccesses": [],
    "options": []
}

const HNQISMWI_ActionPlanElements = [
    {
        "name": "Criterion Status",
        "code": "MWI_AP_DE1",
        "translations": [],
        "shortName": "Criterion Status",
        "formName": "Criterion Status",
        "legendSets": [{ "id": "F9G1wtBjiOY" }],
        "aggregationType": "NONE",
        "valueType": "TEXT",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "optionSet": { "id": "eKFCHvlnXxm" },
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    },
    {
        "name": "Criterion Score",
        "code": "MWI_AP_DE2",
        "translations": [],
        "shortName": "Criterion Score",
        "formName": "Criterion Score",
        "legendSets": [],
        "aggregationType": "NONE",
        "valueType": "NUMBER",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    },
    {
        "name": "Comment",
        "code": "MWI_AP_DE3",
        "translations": [],
        "shortName": "Comment",
        "formName": "Comment",
        "legendSets": [],
        "aggregationType": "NONE",
        "valueType": "TEXT",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    },
    {
        "name": "Action Point",
        "code": "MWI_AP_DE4",
        "translations": [],
        "shortName": "Action Point",
        "formName": "Action Point",
        "legendSets": [],
        "aggregationType": "NONE",
        "valueType": "TEXT",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    },
    {
        "name": "Responsible Person",
        "code": "MWI_AP_DE5",
        "translations": [],
        "shortName": "Responsible Person",
        "formName": "Responsible Person",
        "legendSets": [],
        "aggregationType": "NONE",
        "valueType": "TEXT",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    },
    {
        "name": "Due Date",
        "code": "MWI_AP_DE6",
        "translations": [],
        "shortName": "Due Date",
        "formName": "Due Date",
        "legendSets": [],
        "aggregationType": "NONE",
        "valueType": "DATE",
        "domainType": "TRACKER",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"generated\",\"isCompulsory\":\"No\"}"
        }]
    }
];

const HNQISMWI_SectionDataElements = [
    {
        "name": "Section 1",
        "code": "Section 1",
        "translations": [],
        "shortName": "Section 1",
        "formName": "Section 1",
        "aggregationType": "NONE",
        "valueType": "TEXT",
        "aggregationLevels": [],
        "zeroIsSignificant": false,
        "domainType": "TRACKER",
        "attributeValues": [{
            "attribute": { "id": METADATA },
            "value": "{\"elemType\":\"holder\",\"isCompulsory\":\"No\",\"labelFormName\":\"-\"}"
        }]
    }
];

module.exports = {
    COMPETENCY_TEA,
    EventStage,
    HNQISMWI_ActionPlanElements,
    HNQISMWI_Attributes,
    HNQISMWI_SectionDataElements,
    HnqisProgramConfigs,
    OS_HNQISMWI_Criterion,
    Program,
    PS_ActionPlanStage,
    PS_AssessmentStage,
    PS_Generic,
    PSDE_HNQIS_ActionPlan,
    PSS_CriticalSteps,
    PSS_Default,
    PSS_Scores
};