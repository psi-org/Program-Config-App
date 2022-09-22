export const ProgramIndicatorTemplate = {
    "id": "<indicatorId>",
    "name": "<Short Name> - Competency - C",
    "shortName": "<Short Name> - C",
    "description": "_H2Analytics",
    "aggregationType": "COUNT",
    "expression": "V{enrollment_count}",
    "sharing": {
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "rw------"
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

export const compLastSixMonthsByOUTable = {
    "id": "<compLastSixMOUId>",
    "name": "<Short Name> - Competency Classes - (Last 6 months by Org Units)",
    "code": "<programId>_Scripted1",
    "legend": { "hidden": false },
    "publicAccess": "rw------",
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
    "publicAccess": "rw------",
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
    "publicAccess": "rw------",
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
    "name": " <Short Name> - Number of Assessment",
    "shortName": " <Short Name> - NoA",
    "description": "_H2Analytics",
    "aggregationType": "COUNT",
    "expression": "V{enrollment_count}",
    "sharing": {
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "rw------"
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

export const ProgramIndicatorTemplateGS = {
    "id": "<indicatorId>",
    "name": "<Short Name> - Global Score",
    "shortName": "<Short Name> - GS",
    "description": "_H2Analytics",
    "aggregationType": "AVERAGE",
    "expression": "A{NQdpdST0Gcx}",
    "sharing": {
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "rw------"
    },
    "filter": "d2:hasValue(A{NQdpdST0Gcx})",
    "decimals": 0,
    "analyticsType": "ENROLLMENT",
    "program": { "id": "<Program Id>" },
    "analyticsPeriodBoundaries": [
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
        },
        {
            "externalAccess": false,
            "offsetPeriodType": "Monthly",
            "analyticsPeriodBoundaryType": "AFTER_START_OF_REPORTING_PERIOD",
            "boundaryTarget": "ENROLLMENT_DATE",
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
            "favorite": false,
            "offsetPeriods": "-12"

        }
    ]
}

export const AverageScoreByDistrictByPivotTable = {
    "id": "<AverageScoreByDistrictId>",
    "name": "<Short Name> - Average Score by District from last 12 months",
    "code": "<ProgramId>_Scripted4",
    "legend": {
        "showKey": false,
        "style": "FILL",
        "set": {
            "name": "Red - Yellow - Green (<80%, 80-89%, >89%)",
            "externalAccess": false,
            "publicAccess": "rw------",
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {},
                "public": "rw------"
            },
            "legends": [
                {
                    "name": "80 - 89",
                    "externalAccess": false,
                    "sharing": {
                        "external": false,
                        "users": {},
                        "userGroups": {}
                    },
                    "startValue": 79.0,
                    "endValue": 89.0,
                    "color": "#FAF74C",
                    "displayName": "80 - 89",
                    "favorite": false,
                    "id": "PW1oDBZJrkr"
                },
                {
                    "name": "< 80",
                    "externalAccess": false,
                    "sharing": {
                        "external": false,
                        "users": {},
                        "userGroups": {}
                    },
                    "startValue": 0.0,
                    "endValue": 79.0,
                    "color": "#EE4747",
                    "displayName": "< 80",
                    "favorite": false,
                    "id": "flSEdJ5rBlt"
                },
                {
                    "name": "> 89",
                    "externalAccess": false,
                    "sharing": {
                        "external": false,
                        "users": {},
                        "userGroups": {}
                    },
                    "startValue": 89.0,
                    "endValue": 1000.0,
                    "color": "#39A62D",
                    "displayName": "> 89",
                    "favorite": false,
                    "id": "FjbcPEMJOXE"
                }
            ],
            "favorite": false,
            "id": "XH05Y73UXln"
        },
        "strategy": "FIXED"
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
    "seriesKey": {
        "hidden": false
    },
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
    "fixColumnHeaders": false,
    "externalAccess": false,
    "legendDisplayStrategy": "FIXED",
    "colSubTotals": false,
    "rowTotals": false,
    "digitGroupSeparator": "SPACE",
    "regression": false,
    "fontStyle": {},
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
    "filterDimensions": [],
    "columns": [{ "id": "dx" }, { "id": "pe" }],
    "rowDimensions": ["ou"],
    "series": [{ "axis": 0 }, { "axis": 0 }],
    "columnDimensions": ["dx", "pe"],
    "dataDimensionItems": [],
    "organisationUnits": [],
    "filters": [],
    "rows": [{ "id": "ou" }],
    "organisationUnitLevels": [],
    "organisationUnitLevels": [
        4
      ],
      "organisationUnits": [
        {
          "id": "Wgo93BIG20V"
        }
    ]
}

export const NumberOfAssessmentByPivotTable = {
    "id": "<NumberOfAssessmentId>",
    "name": "<Short Name> -  Number of Assessment by checklist (last 12 months)",
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
        "external": false,
        "users": {},
        "userGroups": {},
        "public": "--------"
    },
    "hideEmptyRowItems": "NONE",
    "aggregationType": "DEFAULT",
    "hideSubtitle": false,
    "description": "Number of Assessment by checklist (last 12 months) for the all the lists available in the country",
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
    "organisationUnits": [],
    "filters": [{ "id": "ou" }],
    "rows": [{ "id": "pe" }],
    "organisationUnitLevels": [],
    "organisationUnits": []
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
    "organisationUnits": [ ]
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
    "organisationUnits": [],
    "filters": [{ "id": "ou" }],
    "rows": [{ "id": "pe" }],
    "organisationUnitLevels": [],
    "organisationUnits": [ ]
}

export const GlobalScoreByMap = {
    "id": "lb4w7bWTmwT",
    "name": "test",
    "code": "<ProgramId>_Scripted8",
    "publicAccess": "rw------",
    "basemap": "osmLight",
    "externalAccess": false,
    "subscribed": false,
    "sharing": {
        "external": false,
        "public": "rw------"
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
            "name": "YjvYH7sFn7a",
            "userOrganisationUnitChildren": false,
            "subscribed": false,
            "userOrganisationUnit": false,
            "renderingStrategy": "SINGLE",
            "sortOrder": 0,
            "favorite": false,
            "topLimit": 0,
            "userOrganisationUnitGrandChildren": false,
            "displayName": "YjvYH7sFn7a",
            "layer": "orgUnit",
            "hideTitle": false,
            "eventClustering": false,
            "opacity": 1.0,
            "parentLevel": 0,
            "parentGraphMap": {
                "Wgo93BIG20V": {}
            },
            "completedOnly": false,
            "eventPointRadius": 0,
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
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
            "organisationUnitLevels": [
                4
              ],
              "organisationUnits": [
                {
                  "id": "Wgo93BIG20V"
                }
              ],
            "filters": [],
            "rows": [
                {
                    "id": "ou"
                }
            ]
        },
        {
            "name": "SL HNQIS Hypertension - Global Score",
            "userOrganisationUnitChildren": false,
            "subscribed": false,
            "userOrganisationUnit": false,
            "method": 1,
            "renderingStrategy": "SINGLE",
            "sortOrder": 0,
            "favorite": false,
            "topLimit": 0,
            "userOrganisationUnitGrandChildren": false,
            "displayName": "SL HNQIS Hypertension - Global Score",
            "layer": "thematic",
            "hideTitle": false,
            "eventClustering": false,
            "opacity": 0.9,
            "parentLevel": 0,
            "parentGraphMap": {
                "DLBRREc72M8": "",
                "Wgo93BIG20V": ""
            },
            "completedOnly": false,
            "eventPointRadius": 0,
            "sharing": {
                "external": false,
                "users": {},
                "userGroups": {}
            },
            "hideSubtitle": false,
            "externalAccess": false,
            "digitGroupSeparator": "SPACE",
            "program": {
                "id": "wBOuislY5ki"
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
            "legendSet": {
                "id": "XH05Y73UXln"
            },
            "filterDimensions": [
                "pe"
            ],
            "columns": [
                {
                    "id": "dx"
                }
            ],
            "columnDimensions": [
                "dx"
            ],
            "dataDimensionItems": [
                {
                    "dataDimensionItemType": "PROGRAM_INDICATOR",
                    "programIndicator": {
                        "id": "xcdClk4RKin"
                    }
                }
            ],
            "organisationUnitLevels": [
                4
              ],
              "organisationUnits": [
                {
                  "id": "Wgo93BIG20V"
                }
              ],
            "filters": [
                {
                    "id": "pe"
                }
            ],
            "rows": [
                {
                    "id": "ou"
                }
            ]
        }
    ]
}

export const dashboardsTemplate = {
    "id": "<dashboardId>",
    "name": "<programName>",
    "code": "<ProgramId>",
    "publicAccess": "--------",
    "description": "<programId>",
    "restrictFilters": false,
    "externalAccess": false,
    "itemConfig": { "insertPosition": "END" },
    "sharing": {
        "external": false,
        "users": {},
        "userGroups": {},
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
    "sharing": { "external": false },
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

/*export const dashVisualizationChart = {
    "id": "<dashbboarCHARTdId>",
    "type": "CHART",
    "externalAccess": false,
    "contentCount": 2,
    //"height": 29,
    "interpretationCount": 0,
    "sharing": { "external": false },
    //"width": 28,
    //"x": 0,
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
}*/

export const dashMap = {
    "id": "<dashboardMAPId>",
    "type": "MAP",
    "externalAccess": false,
    "contentCount": 1,
    "height": 30,
    "interpretationCount": 0,
    "sharing": {
        "external": false,
        "users": {},
        "userGroups": {}
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
    "publicAccess": "rw------",
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
      "external": false,
      "public": "rw------"
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
    "outputType": "EVENT",
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
    "dataElementGroupSetDimensions": [  ],
    "attributeDimensions": [
      {
        "attribute": {
          "id": "<attribute DE id"
        }
      }
    ],
    "columnDimensions": [
        "pe",
        "ou",
        "NQdpdST0Gcx",
        "F0Qcr8ANr7t"
      ],
    "columns": [ ],
    "organisationUnitGroupSetDimensions": [  ],
    "organisationUnitLevels": [  ],
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
    "periods": [  ],
    "organisationUnits": [ ],
    "categoryDimensions": [  ],
    "filters": [  ],
    "rows": [  ],
    "rowDimensions": [  ]
}

export const  dashEventReport = {
    "type": "EVENT_REPORT",
    "externalAccess": false,
    "contentCount": 1,
    "height": 14,
    "interpretationCount": 0,
    "sharing": {
      "external": false
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