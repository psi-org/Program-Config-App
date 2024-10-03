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
            "attribute": { "id": "haUflNqP85K" },
            "value": "{\"buildVersion\":\"1.1\",\"useCompetencyClass\":\"Yes\",\"dePrefix\":\"programDEPrefix\"}"
        }
    ],
    "programTrackedEntityAttributes": [
        {
            "trackedEntityAttribute": { "id": "Xe5hUu6KkUT" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 1
        },
        {
            "trackedEntityAttribute": { "id": "nHg1hGgtJwm" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 2
        },
        {
            "trackedEntityAttribute": { "id": "UlUYUyZJ6o9" },
            "mandatory": false,
            "valueType": "DATE",
            "searchable": true,
            "displayInList": true,
            "sortOrder": 3
        }
    ],
    "userGroupAccesses": []
}

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

const PSDE_HNQISMWI_ActionPlan = [
    {
        "sortOrder": 2,
        "compulsory": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "OTJPb8MCSaS" }
    },
    {
        "sortOrder": 3,
        "compulsory": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "PGtk17z7FFq" }
    },
    {
        "sortOrder": 4,
        "compulsory": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "eiUtIypcrX0" }
    },
    {
        "sortOrder": 5,
        "compulsory": "true",
        "allowFutureDate": "true",
        "programStage": { "id": "apProgramStageId" },
        "dataElement": { "id": "X6TmRobUdbV" }
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

module.exports = {
    COMPETENCY_TEA,
    EventStage,
    HnqisProgramConfigs,
    OS_HNQISMWI_Criterion,
    Program,
    PS_ActionPlanStage,
    PS_AssessmentStage,
    PS_Generic,
    PSDE_HNQIS_ActionPlan,
    PSDE_HNQISMWI_ActionPlan,
    PSS_CriticalSteps,
    PSS_Default,
    PSS_Scores,
};