export const ProgramTemplate = {
    "programs": [
        {
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
            "trackedEntityType": {"id": "oNwpeWkfoWc"},
            "attributeValues": [
                {
                    "attribute": {"id": "haUflNqP85K"},
                    "value": "{\"buildVersion\":\"1.0\",\"useCompetencyClass\":\"Yes\",\"dePrefix\":\"programDEPrefix\"}"
                },
                {
                    "value": "HNQIS2",
                    "attribute": {"id": "yB5tFAAN7bI"}
                }
            ],
            "programTrackedEntityAttributes": [
                {
                    "trackedEntityAttribute": {"id": "Xe5hUu6KkUT"},
                    "mandatory": false,
                    "valueType": "TEXT",
                    "searchable": false,
                    "displayInList": true,
                    "sortOrder": 1
                },
                {
                    "trackedEntityAttribute": {"id": "nHg1hGgtJwm"},
                    "mandatory": false,
                    "valueType": "TEXT",
                    "searchable": false,
                    "displayInList": true,
                    "sortOrder": 2
                },
                {
                    "trackedEntityAttribute": {"id": "UlUYUyZJ6o9"},
                    "mandatory": false,
                    "valueType": "DATE",
                    "searchable": true,
                    "displayInList": true,
                    "sortOrder": 3
                },
                {
                    "trackedEntityAttribute": {"id": "NQdpdST0Gcx"},
                    "mandatory": false,
                    "valueType": "TEXT",
                    "searchable": false,
                    "displayInList": true,
                    "sortOrder": 4
                },
                {
                    "trackedEntityAttribute": {"id": "ulU9KKgSLYe"},
                    "mandatory": false,
                    "valueType": "TEXT",
                    "searchable": false,
                    "displayInList": false,
                    "sortOrder": 5
                }
            ],
            "userGroupAccesses": [
                {
                    "access": "rwrw----",
                    "id": "TOLEUuY7woR"
                },
                {
                    "access": "r-rw----",
                    "id": "QiJXeqMmXXQ"
                }
            ],
            "programStages": [
                {"id": "assessmentId"},
                {"id": "actionPlanId"}
            ]
        }
    ],
    "programStages": [
        {
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
            "programStageSections": [
                {"id": "stepsSectionId"},
                {"id": "scoresSectionId"}
            ],
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
        },
        {
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
    ],
    "programStageSections": [
        {
            "sortOrder": 10,
            "name": "Critical Steps Calculations",
            "programStage": {"id": "assessmentId"},
            "dataElements": [
                {"id": "VqBfZjZhKkU"},
                {"id": "pzWDtDUorBt"},
                {"id": "NAaHST5ZDTE"}
            ],
            "id": "stepsSectionId"
        },
        {
            "sortOrder": 20,
            "name": "Scores",
            "programStage": {"id": "assessmentId"},
            "dataElements": [],
            "id": "scoresSectionId"
        }
    ]
}