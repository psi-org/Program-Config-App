
export const ProgramIndicatorTemplate = {
    "id": "<indicatorId>",
    "name": "<Short Name> - Competency - C",
    "shortName": "<Short Name> - C",
    "description": "_H2Analytics",
    "aggregationType": "COUNT",
    "expression": "V{enrollment_count}",
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "filter": "A{ulU9KKgSLYe} == \"competent\"",
    "analyticsType": "ENROLLMENT",
    "program": { "id": "<programId>" },
    "analyticsPeriodBoundaries": [
        {
            "externalAccess": false,
            "analyticsPeriodBoundaryType": "AFTER_START_OF_REPORTING_PERIOD",
            "boundaryTarget": "ENROLLMENT_DATE",
            "sharing": {
                "owner": "id",
                "external": false,
                "users": {},
                "userGroups": {},
                "public": "--------"
            },
            "favorite": false
        },
        {
            "externalAccess": false,
            "analyticsPeriodBoundaryType": "BEFORE_END_OF_REPORTING_PERIOD",
            "boundaryTarget": "ENROLLMENT_DATE",
            "sharing": {
                "owner": "id",
                "external": false,
                "users": {},
                "userGroups": {},
                "public": "--------"
            },
            "favorite": false
        }
    ]
}

export const compLastSixMonthsByOUTable = {
    "id": "<compLastSixMOUId>",
    "name": "<Short Name> - Competency Classes - (Last 6 months by Org Units)",
    "code": "<programId>_Scripted1",
    "legend": { "hidden": false },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "PIVOT_TABLE",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DARK",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": false,
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": false,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": true,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "filterDimensions": ["pe"],
    "columns": [
        { "id": "dx" }
    ],
    "rowDimensions": ["ou"],
    "series": [],
    "columnDimensions": ["dx"],
    "dataDimensionItems": [],
    "organisationUnits": [],
    "filters": [
        { "id": "pe" }
    ],
    "rows": [
        { "id": "ou" }
    ]
}

export const compLastSixMonthsPie = {
    "id": "<compLastSixMPieId>",
    "name": "<Short Name> - Competency Classes - (Last 6 months)",
    "code": "<programId>_Scripted2",
    "legend": { "hidden": false },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "PIE",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DEFAULT",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": false,
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": false,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": true,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "filterDimensions": [
        "pe",
        "ou"
    ],
    "columns": [
        { "id": "dx" }
    ],
    "rowDimensions": [],
    "series": [],
    "columnDimensions": ["dx"],
    "dataDimensionItems": [],
    "organisationUnits": [],
    "filters": [
        { "id": "pe" },
        { "id": "ou" }
    ]
}

export const compLastSixMonthsTable = {
    "id": "<compLastSixMId>",
    "name": "<Short Name> - Competency Classes - (Last 6 months)",
    "code": "<programId>_Scripted3",
    "legend": { "hidden": false },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "PIVOT_TABLE",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DARK",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": false,
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": false,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": true,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "filterDimensions": ["ou"],
    "columns": [
        { "id": "pe" }
    ],
    "rowDimensions": ["dx"],
    "series": [],
    "columnDimensions": ["pe"],
    "dataDimensionItems": [],
    "organisationUnits": [],
    "filters": [
        { "id": "ou" }
    ],
    "rows": [
        { "id": "dx" }
    ]
}

export const ProgramIndicatorTemplateNoA = {
    "id": "<indicatorId>",
    "name": " <Short Name> - Number of Assessments",
    "shortName": " <Short Name> - NoA",
    "description": "_H2Analytics",
    "aggregationType": "COUNT",
    "expression": "V{enrollment_count}",
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "analyticsType": "ENROLLMENT",
    "program": { "id": "<Program Id>" },
    "analyticsPeriodBoundaries": [
        {
            "externalAccess": false,
            "analyticsPeriodBoundaryType": "AFTER_START_OF_REPORTING_PERIOD",
            "boundaryTarget": "ENROLLMENT_DATE",
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
            "favorite": false
        },
        {
            "externalAccess": false,
            "analyticsPeriodBoundaryType": "BEFORE_END_OF_REPORTING_PERIOD",
            "boundaryTarget": "ENROLLMENT_DATE",
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
            "favorite": false
        }
    ]

}

export const MWIProgramIndicatorTemplate = {
    "id": "<indicatorId>",
    "name": " <Short Name> - Indicator",
    "shortName": " <Short Name> - Indicator",
    "description": "_H2Analytics",
    "aggregationType": "AVERAGE",
    "expression": "expr",
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "filter": "true",
    "program": { "id": "<Program Id>" },
    "decimals": 2,
    "displayInForm": true,
    "analyticsType": "EVENT",
    "analyticsPeriodBoundaries": [
        {
            "boundaryTarget": "EVENT_DATE",
            "analyticsPeriodBoundaryType": "AFTER_START_OF_REPORTING_PERIOD",
            "favorite": false,
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
        },
        {
            "boundaryTarget": "EVENT_DATE",
            "analyticsPeriodBoundaryType": "BEFORE_END_OF_REPORTING_PERIOD",
            "favorite": false,
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
        }
    ]
}

export const ProgramIndicatorTemplateGS = {
    "id": "<indicatorId>",
    "name": "Global Score <Program Id>",
    "shortName": "Global Score <Program Id>",
    "aggregationType": "AVERAGE",
    "displayInForm": true,
    "description": "_H2Analytics",
    "expression": "#{AssessmentID.CriticalStepsID}",
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "decimals": 2,
    "filter": "true",
    "analyticsType": "EVENT",
    "favorite": false,
    "dimensionItemType": "PROGRAM_INDICATOR",
    "program": { "id": "<Program Id>" },
    "analyticsPeriodBoundaries": [
        {
            "externalAccess": false,
            "offsetPeriodType": "Monthly",
            "analyticsPeriodBoundaryType": "AFTER_START_OF_REPORTING_PERIOD",
            "boundaryTarget": "EVENT_DATE",
            "favorite": false,
            "offsetPeriods": 0,
            "sharing": {
                "userGroups": {},
                "external": false,
                "users": {}
            }
        },
        {
            "externalAccess": false,
            "offsetPeriodType": "Monthly",
            "analyticsPeriodBoundaryType": "BEFORE_END_OF_REPORTING_PERIOD",
            "boundaryTarget": "EVENT_DATE",
            "favorite": false,
            "sharing": {
                "userGroups": {},
                "external": false,
                "users": {}
            }
        }
    ]
}

export const AverageScoreByDistrictByPivotTable = {
    "id": "idPivotTable",
    "name": "programId - Average Score by District from last 12 months",
    "code": "programId_Scripted4",
    "legend": {
        "hidden": false
    },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "PIVOT_TABLE",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": false,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DEFAULT",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": true,
    "parentGraphMap": {},
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "description": "Average Score by district (last 12 months) for the lists available in the country",
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "fontStyle": {},
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": true,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": false,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "legendSet": {
        "id": "id"
    },
    "columns": [{ "id": "dx" }, { "id": "pe" }],
    "rowDimensions": ["ou"],
    "series": [],
    "columnDimensions": ["dx", "pe"],
    "dataDimensionItems": [],
    "organisationUnitLevels": [],
    "organisationUnits": [
        {
            "id": "id"
        }],
    "rows": [{ "id": "ou" }]
}

export const NumberOfAssessmentByPivotTable = {
    "id": "<NumberOfAssessmentId>",
    "name": "<Short Name> -  Number of Assessments by checklist (last 12 months)",
    "code": "<ProgramId>_Scripted5",
    "legend": { "hidden": false },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "PIVOT_TABLE",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": true,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DEFAULT",
    "skipRounding": false,
    "showData": false,
    "numberType": "VALUE",
    "hideEmptyRows": true,
    "parentGraphMap": {
        "axgrdwgToKo": {}
    },
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": true,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "description": "Number of Assessments by checklist (last 12 months) for all the lists available in the country",
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": true,
    "rowTotals": true,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "fontStyle": {},
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": true,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": false,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "filterDimensions": ["ou"],
    "columns": [{ "id": "dx" }],
    "rowDimensions": ["pe"],
    "series": [],
    "columnDimensions": ["dx"],
    "dataDimensionItems": [],
    "filters": [{ "id": "ou" }],
    "rows": [{ "id": "pe" }],
    "organisationUnitLevels": [],
    "organisationUnits": [{ "id": "id" }]
}

export const AverageGlobalScoreByColumn = {
    "id": "wTjsiGbmHpf",
    "name": "CD IM H2 -  Average Global Score by checklist from last 12 months - LAB OTSS",
    "legend": {
        "hidden": false
    },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "COLUMN",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": false,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "PATTERNS",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": true,
    "parentGraphMap": {
        "axgrdwgToKo": {}
    },
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "description": "Average Global Score by checklist (last 12 months) for the all the lists available in the country",
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "fontStyle": {},
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": true,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": false,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "axes": [
        {
            "index": 0,
            "type": "RANGE",
            "maxValue": 100,
            "targetLine": {
                "value": 80,
                "title": {
                    "text": "Target",
                    "fontStyle": {
                        "textColor": "#59759b",
                        "textAlign": "RIGHT"
                    }
                }
            }
        }
    ],
    "filterDimensions": [
        "ou"
    ],
    "columns": [
        {
            "id": "dx"
        }
    ],
    "rowDimensions": [
        "pe"
    ],
    "series": [],
    "columnDimensions": [
        "dx"
    ],
    "dataDimensionItems": [],
    "filters": [
        {
            "id": "ou"
        }
    ],
    "rows": [
        {
            "id": "pe"
        }
    ],
    "organisationUnitLevels": [],
    "organisationUnits": [{ "id": "id" }]
}

export const AssessmentByCompetencyByColumn = {
    "id": "<AssessmentByCompetencyId>",
    "name": "<AssessmentByCompetencyColumn> - Number and Percentage of Assessment by Competency Class (last 4 quarters)",
    "code": "<ProgramId>_Scripted7",
    "legend": { "hidden": false },
    "publicAccess": "--------",
    "userOrganisationUnitChildren": false,
    "legendDisplayStyle": "FILL",
    "type": "STACKED_COLUMN",
    "hideEmptyColumns": false,
    "subscribed": false,
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "cumulativeValues": false,
    "showDimensionLabels": false,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "userOrganisationUnitGrandChildren": false,
    "percentStackedValues": true,
    "noSpaceBetweenColumns": false,
    "showHierarchy": false,
    "hideTitle": false,
    "colorSet": "DEFAULT",
    "skipRounding": false,
    "showData": true,
    "numberType": "VALUE",
    "hideEmptyRows": true,
    "parentGraphMap": {
        "axgrdwgToKo": {}
    },
    "displayDensity": "NORMAL",
    "regressionType": "NONE",
    "completedOnly": false,
    "colTotals": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "description": "Number and Percentage of Assessment by Competency Class (last 4 quarters) for the Lab OTSS list",
    "hideLegend": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "fontStyle": {},
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "reportingParams": {
        "parentOrganisationUnit": false,
        "reportingPeriod": false,
        "organisationUnit": false,
        "grandParentOrganisationUnit": false
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": false,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": false,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": true
    },
    "dataElementGroupSetDimensions": [],
    "axes": [
        {
            "index": 0,
            "type": "RANGE",
            "title": {
                "text": "Percentage"
            }
        }
    ],
    "filterDimensions": ["ou"],
    "columns": [{ "id": "dx" }],
    "rowDimensions": ["pe"],
    "series": [],
    "columnDimensions": ["dx"],
    "dataDimensionItems": [],
    "filters": [{ "id": "ou" }],
    "rows": [{ "id": "pe" }],
    "organisationUnitLevels": [],
    "organisationUnits": [{ "id": "id" }]
}

export const GlobalScoreByMap = {
    "id": "id_Map",
    "name": "CD IM H2 - test",
    "code": "IdProgram_Scripted8",
    "publicAccess": "--------",
    "basemap": "osmLight",
    "externalAccess": false,
    "subscribed": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "favorite": false,
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "mapViews": [
        {
            "userOrganisationUnitChildren": false,
            "subscribed": false,
            "userOrganisationUnit": false,
            "renderingStrategy": "SINGLE",
            "sortOrder": 0,
            "favorite": false,
            "topLimit": 0,
            "userOrganisationUnitGrandChildren": false,
            "layer": "boundary",
            "hideTitle": false,
            "eventClustering": false,
            "opacity": 1.0,
            "parentLevel": 0,
            "parentGraphMap": {},
            "completedOnly": false,
            "eventPointRadius": 0,
            "sharing": {},
            "hideSubtitle": false,
            "externalAccess": false,
            "digitGroupSeparator": "SPACE",
            "access": {
                "read": true,
                "update": true,
                "externalize": true,
                "delete": true,
                "write": true,
                "manage": true
            },
            "organisationUnitLevels": [],
            "organisationUnits": [{
                "id": "id"
            }],
            "rows": [{ "id": "ou" }]
        },
        {
            "userOrganisationUnitChildren": false,
            "subscribed": false,
            "userOrganisationUnit": false,
            "method": 1,
            "renderingStrategy": "TIMELINE",
            "sortOrder": 0,
            "favorite": false,
            "topLimit": 0,
            "userOrganisationUnitGrandChildren": false,
            "layer": "thematic",
            "hideTitle": false,
            "eventClustering": false,
            "opacity": 1.0,
            "parentLevel": 0,
            "parentGraphMap": {},
            "completedOnly": false,
            "eventPointRadius": 0,
            "sharing": {},
            "aggregationType": "AVERAGE",
            "hideSubtitle": false,
            "externalAccess": false,
            "digitGroupSeparator": "SPACE",
            "program": {
                "id": "idPorgram"
            },
            "access": {
                "read": true,
                "update": true,
                "externalize": true,
                "delete": true,
                "write": true,
                "manage": true
            },
            "relativePeriods": {
                "thisYear": false,
                "quartersLastYear": false,
                "last30Days": false,
                "last52Weeks": false,
                "thisWeek": false,
                "last90Days": false,
                "last60Days": false,
                "lastMonth": false,
                "last14Days": false,
                "biMonthsThisYear": false,
                "monthsThisYear": false,
                "last2SixMonths": false,
                "yesterday": false,
                "thisQuarter": false,
                "last12Months": true,
                "last5FinancialYears": false,
                "thisSixMonth": false,
                "lastQuarter": false,
                "thisFinancialYear": false,
                "last4Weeks": false,
                "last3Months": false,
                "thisDay": false,
                "thisMonth": false,
                "last5Years": false,
                "last6BiMonths": false,
                "last4BiWeeks": false,
                "lastFinancialYear": false,
                "lastBiWeek": false,
                "weeksThisYear": false,
                "last6Months": false,
                "last3Days": false,
                "quartersThisYear": false,
                "monthsLastYear": false,
                "lastWeek": false,
                "last7Days": false,
                "last180Days": false,
                "thisBimonth": false,
                "lastBimonth": false,
                "lastSixMonth": false,
                "thisBiWeek": false,
                "lastYear": false,
                "last12Weeks": false,
                "last4Quarters": false
            },
            "legendSet": {
                "id": "id"
            },
            "filterDimensions": [
                "pe"
            ],
            "columns": [{
                "id": "dx"
            }],
            "columnDimensions": ["dx"],
            "dataDimensionItems": [],
            "organisationUnitLevels": [],
            "organisationUnits": [{
                "id": "id"
            }],
            "filters": [{ "id": "pe" }],
            "rows": [{ "id": "ou" }]
        }
    ]
}

export const dashboardsTemplate = {
    "id": "<dashboardId>",
    "name": "<programName>",
    "code": "<ProgramId>",
    "publicAccess": "--------",
    "restrictFilters": false,
    "externalAccess": false,
    "itemConfig": { "insertPosition": "END" },
    "sharing": {
        "owner": "id",
        "external": false,
        "users": "",
        "userGroups": "",
        "public": "--------"
    },
    "itemCount": 0,
    "layout": { "columns": [] },
    "dashboardItems": []
}

export const dashVisualization = {
    "id": "<dashbboarTABLEdId>",
    "type": "<REPORT_TABLE/CHART>",
    "externalAccess": false,
    "contentCount": [],
    //"height": 29,
    "interpretationCount": 0,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    //"width": "<28 or 32>",
    //"x": "<28 or 0>",
    //"y": 33,
    "interpretationLikeCount": 0,
    "favorite": false,
    "visualization": {
        "id": "<visualizationId>"
    },
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    }
}

export const dashMap = {
    "id": "<dashboardMAPId>",
    "type": "MAP",
    "externalAccess": false,
    "contentCount": 1,
    "height": 30,
    "interpretationCount": 0,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "width": 60,
    "x": 0,
    "y": 62,
    "interpretationLikeCount": 0,
    "favorite": false,
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "map": {
        "id": "<map Id>"
    }
}

export const LineListGlobalScore = {
    "name": "Test action_plan",
    "publicAccess": "--------",
    "type": "LINE_LIST",
    "code": "<ProgramId>_Scripted9",
    "userOrganisationUnitChildren": false,
    "subscribed": false,
    "hideEmptyRows": false,
    "parentGraphMap": {
        "DLBRREc72M8": ""
    },
    "userOrganisationUnit": true,
    "rowSubTotals": false,
    "hideNaData": false,
    "displayDensity": "NORMAL",
    "dataType": "EVENTS",
    "completedOnly": false,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "colTotals": true,
    "showDimensionLabels": true,
    "sortOrder": 0,
    "fontSize": "NORMAL",
    "favorite": false,
    "topLimit": 0,
    "collapseDataDimensions": false,
    "userOrganisationUnitGrandChildren": false,
    "hideSubtitle": false,
    "outputType": "ENROLLMENT",
    "externalAccess": false,
    "colSubTotals": true,
    "showHierarchy": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "hideTitle": false,
    "program": {
        "id": "<program id>"
    },
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "relativePeriods": {
        "thisYear": false,
        "quartersLastYear": false,
        "last10Years": false,
        "last30Days": false,
        "last52Weeks": false,
        "thisWeek": false,
        "last90Days": false,
        "last60Days": false,
        "lastMonth": false,
        "last14Days": false,
        "biMonthsThisYear": false,
        "monthsThisYear": false,
        "last2SixMonths": false,
        "yesterday": false,
        "thisQuarter": false,
        "last12Months": true,
        "last5FinancialYears": false,
        "thisSixMonth": false,
        "lastQuarter": false,
        "thisFinancialYear": false,
        "last4Weeks": false,
        "last3Months": false,
        "thisDay": false,
        "thisMonth": false,
        "last5Years": false,
        "last6BiMonths": false,
        "last10FinancialYears": false,
        "last4BiWeeks": false,
        "lastFinancialYear": false,
        "lastBiWeek": false,
        "weeksThisYear": false,
        "last6Months": false,
        "last3Days": false,
        "quartersThisYear": false,
        "monthsLastYear": false,
        "lastWeek": false,
        "last7Days": false,
        "last180Days": false,
        "thisBimonth": false,
        "lastBimonth": false,
        "lastSixMonth": false,
        "thisBiWeek": false,
        "lastYear": false,
        "last12Weeks": false,
        "last4Quarters": false
    },
    "programStage": {
        "id": "<stage id>"
    },
    "dataElementGroupSetDimensions": [],
    "programIndicatorDimensions": [
        {
            "programIndicator": {
                "id": "<Global Score Indicator ID>"
            }
        }
    ],
    "columnDimensions": [
        "pe",
        "ou",
        "",
        "F0Qcr8ANr7t"
    ],
    "columns": [],
    "organisationUnitGroupSetDimensions": [],
    "dataElementDimensions": [
        {
            "programStage": {
                "id": "<program id>"
            },
            "dataElement": {
                "id": "<DE id>"
            }
        }
    ],
    "periods": [],
    "organisationUnitLevels": [],
    "organisationUnits": [{ "id": "id" }],
    "categoryDimensions": [],
    "filters": [],
    "rows": [],
    "rowDimensions": []
}

export const dashEventReport = {
    "type": "EVENT_REPORT",
    "externalAccess": false,
    "contentCount": 1,
    "height": 14,
    "interpretationCount": 0,
    "sharing": {
        "owner": "id",
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "width": 60,
    "x": 0,
    "y": 92,
    "interpretationLikeCount": 0,
    "favorite": false,
    "access": {
        "read": true,
        "update": true,
        "externalize": true,
        "delete": true,
        "write": true,
        "manage": true
    },
    "eventReport": {
        "id": "<eventReport id>"
    }
}