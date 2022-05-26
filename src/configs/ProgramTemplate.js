const Program = {
    "id": "programId",
    "name": "programName",
    "shortName": "programShortName",
    "programType": "WITH_REGISTRATION",
    "skipOffline": false,
    "publicAccess": "--------",
    "enrollmentDateLabel": "Enrollment date",
    "registration": true,
    "displayFrontPageList": true,
    "style": {
        "color": "#3949ab",
        "icon": "child_program_outline"
    },
    "programStages": []
}

const PS_AssessmentStage = {
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true,
        "data": {
            "read": true,
            "write": true
        }
    },
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
    "publicAccess": "--------",
    "remindCompleted": true,
    "repeatable": false,
    "reportDateToUse": "enrollmentDate",
    "sortOrder": 1,
    "style": {
        "color": "#ffff00",
        "icon": "clinical_fe_outline"
    },
    "userGroupAccesses": [
        {
            "access": "rwrw----",
            "id": "TOLEUuY7woR"
        },
        {
            "access": "r-rw----",
            "id": "QiJXeqMmXXQ"
        }
    ]
}

const PS_ActionPlanStage = {
    "autoGenerateEvent": false,
    "generatedByEnrollmentDate": false,
    "hideDueDate": false,
    "id": "actionPlanId",
    "minDaysFromStart": 0,
    "name": "ActionPlan",
    "openAfterEnrollment": false,
    "program": {"id": "programId"},
    "programStageDataElements": [
        {
            "sortOrder": 1,
            "compulsory": "true",
            "programStage": {"id": "ajALrNAeyhF"},
            "dataElement": {"id": "F0Qcr8ANr7t"}
        },
        {
            "sortOrder": 2,
            "compulsory": "true",
            "programStage": {"id": "ajALrNAeyhF"},
            "dataElement": {"id": "nswci5V4j0d"}
        },
        {
            "sortOrder": 3,
            "compulsory": "true",
            "allowFutureDate": "true",
            "programStage": {"id": "ajALrNAeyhF"},
            "dataElement": {"id": "DIoqtxbSJIL"}
        }
    ],
    "programStageSections": [],
    "publicAccess": "--------",
    "remindCompleted": false,
    "repeatable": true,
    "sortOrder": 2,
    "style": {"color": "#00b0ff"},
    "userGroupAccesses": [
        {
            "access": "rwrw----",
            "id": "TOLEUuY7woR"
        },
        {
            "access": "r-rw----",
            "id": "QiJXeqMmXXQ"
        }
    ]
}

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
    "publicAccess": "rw------",
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

module.exports = {
    Program,
    PS_Generic,
    PS_AssessmentStage,
    PS_ActionPlanStage,
    PSS_Default,
    PSS_CriticalSteps,
    PSS_Scores
}