import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import FunctionsIcon from '@mui/icons-material/Functions';
import BlockIcon from '@mui/icons-material/Block';
import TimelineIcon from '@mui/icons-material/Timeline';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import PercentIcon from '@mui/icons-material/Percent';
import TextIcon from '@mui/icons-material/TextFields';
import NumberIcon from '@mui/icons-material/Numbers';
import DateIcon from '@mui/icons-material/CalendarToday';
import TimeIcon from '@mui/icons-material/AccessTime';
import { ArrowDownward, ArrowUpward, PlaylistAddCheck, StackedLineChart } from '@mui/icons-material';

const BUILD_VERSION = "1.7.0";
const BUILD_DATE = "June, 2023";
const MIN_VERSION = "2.36";
const MAX_VERSION = "2.40";

const PCA_METADATA_VERSION = "1.1.1";
const H2_METADATA_VERSION = "1.1.2";

const PCA_ATTRIBUTES = ["yB5tFAAN7bI", "haUflNqP85K"];
const PCA_OPTION_SETS = ["TOcCuCN2CLm"];
const PCA_OPTIONS = ["Ip3IqzzqgLN", "Jz4YKD15lnK", "QR0HHcQri91", "v9XPATv6G3N"];
const PCA_USER_ROLES = ["QbYqOgwk5fJ", "JDmJ4ADTaDq"];

// *HNQIS2 Attributes
const COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe";
const GLOBAL_SCORE_ATTRIBUTE = "NQdpdST0Gcx";
const ASSESSMENT_DATE_ATTRIBUTE = "UlUYUyZJ6o9";
const HEALTH_AREA_ATTRIBUTE = "Xe5hUu6KkUT";
const ORGANISATION_UNIT_ATTRIBUTE = "nHg1hGgtJwm";

// *H2 Data Elements
const COMPETENCY_CLASS = "NAaHST5ZDTE";
const CRITICAL_STEPS = "VqBfZjZhKkU";
const NON_CRITICAL_STEPS = "pzWDtDUorBt";
const ACTION_PLAN_ACTION = "F0Qcr8ANr7t";
const ACTION_PLAN_DUE_DATE = "DIoqtxbSJIL";
const ACTION_PLAN_RESPONSIBLE = "nswci5V4j0d";

// *H2 Tracked Entity Type
const ASSESSMENT_TET = "oNwpeWkfoWc";

// *H2 Option Sets
const OPTION_SET_COMPETENCY = "NDfZ129owtz";
const OPTION_SET_HEALTH_AREAS = "y752HEwvCGi";

// *H2 Legend Sets
const LEGEND_YES_NO = "RXxPYFwtgf4";
const LEGEND_YES_PARTIAL_NO = "kqQjtHIc7II";
const VISUALIZATIONS_LEGEND = "nvVrBnbud3L";

// *H1 Control Data Elements
const H1_OVERALL_SCORE = "Y8Nmpp7RhXw";
const H1_COMPETENCY_CLASS = "KesgQ5NHkQW";

const H1_ACTION1 = "wRaxfSNz5Xb";
const H1_RESPONSIBLE1 = "hUXusK1q7qX";
const H1_DUE_DATE1 = "zAWljfTXSnZ";
const H1_COMPLETION_DATE1 = "bu0dDZmEqb6";

const H1_ACTION2 = "uv22UMpXUA2";
const H1_RESPONSIBLE2 = "Qor2Meb1sNf";
const H1_DUE_DATE2 = "BtReGP2EMKA";
const H1_COMPLETION_DATE2 = "ClN8h6d1C9o";

const H1_ACTION3 = "OJRW4LPDsdU";
const H1_RESPONSIBLE3 = "z9bskG067HE";
const H1_DUE_DATE3 = "bVPpgPm1hj0";
const H1_COMPLETION_DATE3 = "LPFqIi0Ml4a";

const H1_ACTION_PLAN_OLD = "Im5C86I2ObV";   // ?Interpreted as Action 1
const H1_ACTION1_OLD = "ibpjjNJLn44";       // ?Interpreted as Action 2
const H1_ACTION2_OLD = "bwwyHVzxnTZ";       // ?Interpreted as Action 3

const H2_REQUIRED = {
    dataElements: [
        COMPETENCY_CLASS,
        CRITICAL_STEPS,
        NON_CRITICAL_STEPS,
        ACTION_PLAN_ACTION,
        ACTION_PLAN_DUE_DATE,
        ACTION_PLAN_RESPONSIBLE,
    ],
    optionSets: [OPTION_SET_COMPETENCY, OPTION_SET_HEALTH_AREAS],
    options: [
        "BNjofUBvlJ8",
        "Ox6VQNmvuS3",
        "SzQKvyTKPEw",
        "NPw1hV4degm",
        "lztu61LKSII",
        "McXRLIwjDh7",
        "xTJOcijWyaD",
        "UgcqvJVJ9f0",
        "aYWZXNhvXQw",
        "C9L7MCPeHr5",
        "c8qOHzSbhWM",
        "imVa2DiLgrJ",
        "r8UqKmXwXqa",
        "RHreLvo1UWn",
        "hX7DJdCN9Ou",
        "xaBeYsM2hFH",
        "jdVVvtwuJ7Y",
        "e10afvAkkPR",
        "OqRNLt5Nbub",
        "MstdLcCaYZW",
        "Jhn703YNPa1",
    ],
    trackedEntityTypes: [ASSESSMENT_TET],
    trackedEntityAttributes: [
        HEALTH_AREA_ATTRIBUTE,
        GLOBAL_SCORE_ATTRIBUTE,
        ORGANISATION_UNIT_ATTRIBUTE,
        ASSESSMENT_DATE_ATTRIBUTE,
        COMPETENCY_ATTRIBUTE,
    ],
    attributes: ["LP171jpctBm", "yhKEe6BLEer"],
    legendSets: [LEGEND_YES_NO, LEGEND_YES_PARTIAL_NO, VISUALIZATIONS_LEGEND],
};

const DATE_FORMAT_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };

const NAMESPACE = "programconfigapp";
const BACKUPS_NAMESPACE = `${NAMESPACE}_backups`;
const TRANSFERRED_EVENTS_NAMESPACE = `${NAMESPACE}_transferred`;
const DATASTORE_PCA_METADATA = "PCAMetadata";
const DATASTORE_H2_METADATA = "H2Metadata";

const PERIOD_TYPES = [
    { label: "Daily", value: "Daily" },
    { label: "Weekly", value: "Weekly" },
    { label: "Weekly starting Wednesday", value: "WeeklyWednesday" },
    { label: "Weekly starting Thursday", value: "WeeklyThursday" },
    { label: "Weekly starting Saturday", value: "WeeklySaturday" },
    { label: "Weekly starting Sunday", value: "WeeklySunday" },
    { label: "Bi-Weekly", value: "BiWeekly" },
    { label: "Monthly", value: "Monthly" },
    { label: "Bi-Monthly", value: "BiMonthly" },
    { label: "Quarterly", value: "Quarterly" },
    { label: "Six-Monthly", value: "SixMonthly" },
    { label: "Six-Monthly starting April", value: "SixMonthlyApril" },
    { label: "Six-Monthly starting November", value: "SixMonthlyNov" },
    { label: "Yearly", value: "Yearly" },
    { label: "Financial year starting April", value: "FinancialApril" },
    { label: "Financial year starting July", value: "FinancialJuly" },
    { label: "Financial year starting October", value: "FinancialOct" },
    { label: "Financial year starting November", value: "FinancialNov" }
];

const FEATURE_TYPES = [
    { label: 'None', value: 'NONE' },
    { label: 'Point', value: 'POINT' },
    { label: 'Polygon', value: 'POLYGON' }
];

const REPORT_DATE_TO_USE = [
    { label: 'Incident Date', value: 'incidentDate' },
    { label: 'Enrollment Date', value: 'enrollmentDate' }
];

const METADATA = "haUflNqP85K";

const QUESTION_TYPE_ATTRIBUTE = "RkNBKHl7FcO";
const DE_TYPE_ATTRIBUTE = "IMVz39TtAHM";
const HEADER_ATTRIBUTE = "olcVXnDPG1U";
const QUESTION_PARENT_ATTRIBUTE = "jeZmx9zUd5p";
const QUESTION_PARENT_OPTIONS_ATTRIBUTE = "zszUcUt6cH0";
const COMPOSITIVE_SCORE_ATTRIBUTE = "k738RpAYLmz";
const SCORE_NUM_ATTRIBUTE = "Zyr7rlDOJy8";
const SCORE_DEN_ATTRIBUTE = "l7WdLDhE3xW";
const QUESTION_ORDER_ATTRIBUTE = "xf9iDHNFLgx";

const FEEDBACK_ORDER = "LP171jpctBm";
const FEEDBACK_TEXT = "yhKEe6BLEer";

const MAX_PREFIX_LENGTH = 25;
const MAX_PROGRAM_NAME_LENGTH = 230;
const MAX_STAGE_NAME_LENGTH = 230;
const MAX_SECTION_NAME_LENGTH = 230;
const MAX_DATA_ELEMENT_NAME_LENGTH = 200;

const MIN_NAME_LENGTH = 2;
const MIN_DESCRIPTION_LENGTH = 2;
const MIN_DATA_ELEMENT_NAME_LENGTH = 2;

const MAX_SHORT_NAME_LENGTH = 50;

const RENDER_TYPES = [
    'DEFAULT',
    'DROPDOWN',
    'VERTICAL_RADIOBUTTONS',
    'HORIZONTAL_RADIOBUTTONS',
    'VERTICAL_CHECKBOXES',
    'HORIZONTAL_CHECKBOXES',
    'VALUE'
];

const ELEM_TYPES = [{ label: 'Question', value: 'question' }, { label: 'Label', value: 'label' }];

const VALUE_TYPES = [
    { label: 'Number', value: 'NUMBER', icon: <NumberIcon /> },
    { label: 'Integer', value: 'INTEGER', icon: <NumberIcon /> },
    { label: 'Positive Integer', value: 'INTEGER_POSITIVE', icon: <NumberIcon /> },
    { label: 'Zero or Positive Integer', value: 'INTEGER_ZERO_OR_POSITIVE', icon: <NumberIcon /> },
    { label: 'Text', value: 'TEXT', icon: <TextIcon /> },
    { label: 'Long Text', value: 'LONG_TEXT', icon: <TextIcon /> },
    { label: 'Percentage', value: 'PERCENTAGE', icon: <PercentIcon /> },
    { label: 'Date', value: 'DATE', icon: <DateIcon /> },
    { label: 'Time', value: 'TIME', icon: <TimeIcon /> },
];

const AGG_TYPES = [
    { value: 'NONE', label: 'None', icon: <BlockIcon /> },
    { value: 'SUM', label: 'Sum', icon: <FunctionsIcon /> },
    { value: 'AVERAGE', label: 'Average', icon: <TimelineIcon /> },
    { value: 'AVERAGE_SUM_ORG_UNIT', label: 'Average (Sum in Org Unit Hierarchy)', icon: <TimelineIcon /> },
    { value: 'COUNT', label: 'Count', icon: <NumberIcon /> },
    { value: 'STDDEV', label: 'Standard deviation', icon: <SsidChartIcon /> },
    { value: 'VARIANCE', label: 'Variance', icon: <SsidChartIcon /> },
    { value: 'MIN', label: 'Min', icon: <RemoveIcon /> },
    { value: 'MAX', label: 'Max', icon: <AddIcon /> }
];

const AGG_TYPES_H2_PI = [
    { label: 'Average', value: 'AVERAGE', icon: <TimelineIcon /> },
    { label: 'Average (Sum in Org Unit Hierarchy)', value: 'AVERAGE_SUM_ORG_UNIT', icon: <TimelineIcon /> },
    { label: 'Last (Sum in Org Unit Hierarchy)', value: 'LAST', icon: <PlaylistAddCheck /> },
    { label: 'Last (Average in Org Unit Hierarchy)', value: 'LAST_AVERAGE_ORG_UNIT', icon: <PlaylistAddCheck /> },
    { label: 'Last value in period (Sum in Org Unit Hierarchy)', value: 'LAST_IN_PERIOD', icon: <PlaylistAddCheck /> },
    { label: 'Last value in period (Average in Org Unit Hierarchy)', value: 'LAST_IN_PERIOD_AVERAGE_ORG_UNIT', icon: <PlaylistAddCheck /> },
    { label: 'Standard Deviation', value: 'STDDEV', icon: <StackedLineChart /> },
    { label: 'Variance', value: 'VARIANCE', icon: <StackedLineChart /> },
    { label: 'Min', value: 'MIN', icon: <ArrowDownward /> },
    { label: 'Max', value: 'MAX', icon: <ArrowUpward /> },
];

const DHIS2_KEY_MAP = {
    "accesses": "Access",
    "analyticsPeriodBoundaries": "Analytics Period Boundary",
    "analyticsTableHooks": "Analytics Table Hook",
    "apiToken": "Api Token",
    "attributes": "Attribute",
    "attributeValues": "Attribute Value",
    "categories": "Category",
    "categoryCombos": "Category Combo",
    "categoryDimensions": "Category Dimension",
    "categoryOptionCombos": "Category Option Combo",
    "categoryOptionGroups": "Category Option Group",
    "categoryOptionGroupSetDimensions": "Category Option Group Set Dimension",
    "categoryOptionGroupSets": "Category Option Group Set",
    "categoryOptions": "Category Option",
    "constants": "Constant",
    "dashboardItems": "Dashboard Item",
    "dashboards": "Dashboard",
    "dataApprovalLevels": "Data Approval Level",
    "dataApprovalWorkflows": "Data Approval Workflow",
    "dataElementDimensions": "Tracked Entity Program Indicator Dimension",
    "dataElementGroups": "Data Element Group",
    "dataElementGroupSetDimensions": "Data Element Group Set Dimension",
    "dataElementGroupSets": "Data Element Group Set",
    "dataElementOperands": "Data Element Operand",
    "dataElements": "Data Element",
    "dataEntryForms": "Data Entry Form",
    "dataInputPeriods": "Data Input Period",
    "dataSetElements": "Data Set Element",
    "dataSetNotificationTemplates": "Data Set Notification Template",
    "dataSets": "Data Set",
    "dataStores": "Datastore Entry",
    "date": "Date",
    "documents": "Document",
    "eventCharts": "Event Chart",
    "eventFilters": "Program Stage Instance Filter",
    "eventReports": "Event Report",
    "eventVisualizations": "Event Visualization",
    "expressions": "Expression",
    "externalFileResources": "External File Resource",
    "externalMapLayers": "External Map Layer",
    "fileResources": "File Resource",
    "icons": "Icon",
    "indicatorGroups": "Indicator Group",
    "indicatorGroupSets": "Indicator Group Set",
    "indicators": "Indicator",
    "indicatorTypes": "Indicator Type",
    "interpretationComments": "Interpretation Comment",
    "interpretations": "Interpretation",
    "jobConfigurations": "Job Configuration",
    "legends": "Legend",
    "legendSets": "Legend Set",
    "maps": "Map",
    "mapViews": "Map View",
    "messageConversations": "Message Conversation",
    "metadataVersions": "Metadata Version",
    "minMaxDataElements": "Min Max Data Element",
    "oAuth2Clients": "O Auth2 Client",
    "objectStyles": "Object Style",
    "optionGroups": "Option Group",
    "optionGroupSets": "Option Group Set",
    "options": "Option",
    "optionSets": "Option Set",
    "organisationUnitGroups": "Organisation Unit Group",
    "organisationUnitGroupSetDimensions": "Organisation Unit Group Set Dimension",
    "organisationUnitGroupSets": "Organisation Unit Group Set",
    "organisationUnitLevels": "Organisation Unit Level",
    "organisationUnits": "Organisation Unit",
    "predictorGroups": "Predictor Group",
    "predictors": "Predictor",
    "programDataElements": "Program Data Element Dimension Item",
    "programIndicatorGroups": "Program Indicator Group",
    "programIndicators": "Program Indicator",
    "programInstances": "Program Instance",
    "programNotificationTemplates": "Program Notification Template",
    "programRuleActions": "Program Rule Action",
    "programRules": "Program Rule",
    "programRuleVariables": "Program Rule Variable",
    "programs": "Program",
    "programSections": "Program Section",
    "programStageDataElements": "Program Stage Data Element",
    "programStageInstances": "Program Stage Instance",
    "programStages": "Program Stage",
    "programStageSections": "Program Stage Section",
    "programTrackedEntityAttributeDimensionItems": "Program Tracked Entity Attribute Dimension Item",
    "programTrackedEntityAttributeGroups": "Program Tracked Entity Attribute Group",
    "programTrackedEntityAttributes": "Program Tracked Entity Attribute",
    "proposals": "Metadata Proposal",
    "pushAnalysis": "Push Analysis",
    "relationshipConstraints": "Relationship Constraint",
    "relationshipItems": "Relationship Item",
    "relationships": "Relationship",
    "relationshipTypes": "Relationship Type",
    "reportingRates": "Reporting Rate",
    "reports": "Report",
    "sections": "Section",
    "smsCommands": "S M S Command",
    "sqlViews": "Sql View",
    "trackedEntityAttributes": "Tracked Entity Attribute",
    "trackedEntityAttributeValues": "Tracked Entity Attribute Value",
    "trackedEntityDataElementDimensions": "Tracked Entity Data Element Dimension",
    "trackedEntityInstanceFilters": "Tracked Entity Instance Filter",
    "trackedEntityInstances": "Tracked Entity Instance",
    "trackedEntityTypeAttributes": "Tracked Entity Type Attribute",
    "trackedEntityTypes": "Tracked Entity Type",
    "userAccesses": "User Access",
    "userCredentials": "User Credentials Dto",
    "userGroupAccesses": "User Group Access",
    "userGroups": "User Group",
    "userRoles": "User Role",
    "users": "User",
    "validationNotificationTemplates": "Validation Notification Template",
    "validationResults": "Validation Result",
    "validationRuleGroups": "Validation Rule Group",
    "validationRules": "Validation Rule",
    "visualizations": "Visualization",
};

const PROGRAM_TYPE_OPTIONS = [
    {
        "code": "HNQIS",
        "name": "HNQIS",
        "id": "Ip3IqzzqgLN",
        "sortOrder": 1,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
    },
    {
        "code": "HNQIS2",
        "name": "HNQIS 2.0",
        "id": "Jz4YKD15lnK",
        "sortOrder": 2,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
    },
    {
        "code": "RDQA",
        "name": "RDQA",
        "id": "QR0HHcQri91",
        "sortOrder": 3,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
    },
    {
        "code": "EDS",
        "name": "EDS",
        "id": "v9XPATv6G3N",
        "sortOrder": 4,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
    }
];

const PROGRAM_TYPE_OPTION_SET = {
    "name": "DB - Program Type",
    "id": "TOcCuCN2CLm",
    "version": 7,
    "valueType": "TEXT",
    "attributeValues": [],
    "translations": [],
    "options": [
        { "id": "Ip3IqzzqgLN" },
        { "id": "Jz4YKD15lnK" },
        { "id": "QR0HHcQri91" },
        { "id": "v9XPATv6G3N" }
    ]
};

const DHIS2_PRIMARY_COLOR = "#2c6693";

const EXPORT_PRESETS = [
    { value: 'local', label: 'Local Import' },
    { value: 'external', label: 'External Import' },
    { value: 'h2External', label: 'HNQIS2 to HNQIS2-Enabled Server' }
];

const EXTERNAL_IMPORT_REMOVE_KEYS = ['date', 'categories', 'categoryCombos', 'categoryOptionCombos', 'categoryOptions'];

const H2_ATTRIBUTES_TO_KEEP = ['haUflNqP85K', 'LP171jpctBm', 'yB5tFAAN7bI', 'DVzuBdj9kli', 'yhKEe6BLEer'];

const JSON_ATTRIBUTE_SETTINGS = [
    { key: 'sharings', label: 'Remove Sharing Settings', selected: false, affects: ['sharing'] },
    { key: 'ous', label: 'Remove Organisation Units', selected: false, affects: ['organisationUnits'] },
    { key: 'redates', label: 'Remove all "Date", "Last Updated" and "Created" fields', selected: false, affects: ['date', 'lastUpdated', 'created'] },
    { key: 'reuser', label: 'Remove all "Created By" and "Last Updated By" fields', selected: false, affects: ['createdBy', 'lastUpdatedBy'] },
    { key: 'recats', label: 'Remove every field related to "Categories"', selected: false, affects: ['category', 'categoryCombo', 'categoryOptionCombo', 'categoryOption', 'categories', 'categoryCombos', 'categoryOptionCombos', 'categoryOptions'] },
    { key: 'relegends', label: 'Remove Legend Sets', selected: false, affects: ['legends', 'legendSets', 'legend', 'legendSet'] },
];

export {
    ACTION_PLAN_ACTION,
    ACTION_PLAN_DUE_DATE,
    ACTION_PLAN_RESPONSIBLE,
    AGG_TYPES_H2_PI,
    AGG_TYPES,
    ASSESSMENT_DATE_ATTRIBUTE,
    ASSESSMENT_TET,
    BACKUPS_NAMESPACE,
    BUILD_DATE,
    BUILD_VERSION,
    COMPETENCY_ATTRIBUTE,
    COMPETENCY_CLASS,
    COMPOSITIVE_SCORE_ATTRIBUTE,
    CRITICAL_STEPS,
    DATASTORE_H2_METADATA,
    DATASTORE_PCA_METADATA,
    DATE_FORMAT_OPTIONS,
    DE_TYPE_ATTRIBUTE,
    DHIS2_KEY_MAP,
    DHIS2_PRIMARY_COLOR,
    ELEM_TYPES,
    EXPORT_PRESETS,
    EXTERNAL_IMPORT_REMOVE_KEYS,
    FEATURE_TYPES,
    FEEDBACK_ORDER,
    FEEDBACK_TEXT,
    GLOBAL_SCORE_ATTRIBUTE,
    H1_ACTION_PLAN_OLD,
    H1_ACTION1_OLD,
    H1_ACTION1,
    H1_ACTION2_OLD,
    H1_ACTION2,
    H1_ACTION3,
    H1_COMPETENCY_CLASS,
    H1_COMPLETION_DATE1,
    H1_COMPLETION_DATE2,
    H1_COMPLETION_DATE3,
    H1_DUE_DATE1,
    H1_DUE_DATE2,
    H1_DUE_DATE3,
    H1_OVERALL_SCORE,
    H1_RESPONSIBLE1,
    H1_RESPONSIBLE2,
    H1_RESPONSIBLE3,
    H2_ATTRIBUTES_TO_KEEP,
    H2_METADATA_VERSION,
    H2_REQUIRED,
    HEADER_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    JSON_ATTRIBUTE_SETTINGS,
    LEGEND_YES_NO,
    LEGEND_YES_PARTIAL_NO,
    MAX_DATA_ELEMENT_NAME_LENGTH,
    MAX_PREFIX_LENGTH,
    MAX_PROGRAM_NAME_LENGTH,
    MAX_SECTION_NAME_LENGTH,
    MAX_SHORT_NAME_LENGTH,
    MAX_STAGE_NAME_LENGTH,
    MAX_VERSION,
    METADATA,
    MIN_DATA_ELEMENT_NAME_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MIN_NAME_LENGTH,
    MIN_VERSION,
    NAMESPACE,
    NON_CRITICAL_STEPS,
    OPTION_SET_COMPETENCY,
    OPTION_SET_HEALTH_AREAS,
    ORGANISATION_UNIT_ATTRIBUTE,
    PCA_ATTRIBUTES,
    PCA_METADATA_VERSION,
    PCA_OPTION_SETS,
    PCA_OPTIONS,
    PCA_USER_ROLES,
    PERIOD_TYPES,
    PROGRAM_TYPE_OPTION_SET,
    PROGRAM_TYPE_OPTIONS,
    QUESTION_ORDER_ATTRIBUTE,
    QUESTION_PARENT_ATTRIBUTE,
    QUESTION_PARENT_OPTIONS_ATTRIBUTE,
    QUESTION_TYPE_ATTRIBUTE,
    REPORT_DATE_TO_USE,
    SCORE_DEN_ATTRIBUTE,
    SCORE_NUM_ATTRIBUTE,
    TRANSFERRED_EVENTS_NAMESPACE,
    VALUE_TYPES,
    VISUALIZATIONS_LEGEND
};
