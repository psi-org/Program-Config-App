import { ArrowDownward, ArrowUpward, PlaylistAddCheck, StackedLineChart } from '@mui/icons-material';
import TimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import BlockIcon from '@mui/icons-material/Block';
import DateIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DataArrayIcon from '@mui/icons-material/DataArray';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EmailIcon from '@mui/icons-material/Email';
import FunctionsIcon from '@mui/icons-material/Functions';
import HttpIcon from '@mui/icons-material/Http';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NumberIcon from '@mui/icons-material/Numbers';
import PercentIcon from '@mui/icons-material/Percent';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import RemoveIcon from '@mui/icons-material/Remove';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import TextIcon from '@mui/icons-material/TextFields';
import TimelineIcon from '@mui/icons-material/Timeline';
import React from 'react';

const BUILD_VERSION = "2.0.5"
const BUILD_DATE = "Jun 28, 2024"
const MIN_VERSION = "2.36.x"
const MAX_VERSION = "2.40.x"

const PCA_METADATA_VERSION = "1.2.0";
const H2_METADATA_VERSION = "1.1.4";

const REQUIRED_H2_PROGRAM_BUILD_VERSION = "2.0.5";

const DHIS2_PRIMARY_COLOR = "#2c6693";
const LIGHT_BLUE_COLOR = "#66aee5";

//* PCA Metadata Package
const PCA_ATTRIBUTES = ["yB5tFAAN7bI", "haUflNqP85K"];
const PCA_OPTION_SETS = [];
const PCA_OPTIONS = [];
const PCA_USER_ROLES = ["QbYqOgwk5fJ", "JDmJ4ADTaDq"];

//* HNQIS2 Tracked Entity Attributes
const COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe";
const GLOBAL_SCORE_ATTRIBUTE = "NQdpdST0Gcx";
const ASSESSMENT_DATE_ATTRIBUTE = "UlUYUyZJ6o9";
const HEALTH_AREA_ATTRIBUTE = "Xe5hUu6KkUT";
const ORGANISATION_UNIT_ATTRIBUTE = "nHg1hGgtJwm";

//* HNQIS2 Attributes
const FEEDBACK_ORDER = "LP171jpctBm";
const FEEDBACK_TEXT = "yhKEe6BLEer";

//* H2 Data Elements
const COMPETENCY_CLASS = "NAaHST5ZDTE";
const CRITICAL_STEPS = "VqBfZjZhKkU";
const NON_CRITICAL_STEPS = "pzWDtDUorBt";
const ACTION_PLAN_ACTION = "F0Qcr8ANr7t";
const ACTION_PLAN_DUE_DATE = "DIoqtxbSJIL";
const ACTION_PLAN_RESPONSIBLE = "nswci5V4j0d";

//* H2 Tracked Entity Type
const ASSESSMENT_TET = "oNwpeWkfoWc";

//* H2 Option Sets
const OPTION_SET_COMPETENCY = "NDfZ129owtz";
const OPTION_SET_HEALTH_AREAS = "y752HEwvCGi";

//* H2 Legend Sets
const LEGEND_YES_NO = "RXxPYFwtgf4";
const LEGEND_YES_PARTIAL_NO = "kqQjtHIc7II";
const VISUALIZATIONS_LEGEND = "nvVrBnbud3L";

//* H1 Control Data Elements
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

const H1_QUESTION_HIDE_TYPE = "mvGz6QTxEQq";
const H1_QUESTION_HIDE_GROUP = "LsjVjwl69sP";

//* HNQIS2 Metadata Package
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
        "jHAilN60gsN"
    ],
    trackedEntityTypes: [ASSESSMENT_TET],
    trackedEntityAttributes: [
        HEALTH_AREA_ATTRIBUTE,
        GLOBAL_SCORE_ATTRIBUTE,
        ORGANISATION_UNIT_ATTRIBUTE,
        ASSESSMENT_DATE_ATTRIBUTE,
        COMPETENCY_ATTRIBUTE,
    ],
    attributes: [FEEDBACK_ORDER, FEEDBACK_TEXT],
    legendSets: [LEGEND_YES_NO, LEGEND_YES_PARTIAL_NO, VISUALIZATIONS_LEGEND],
};

const DATE_FORMAT_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, localeMatcher: 'best fit', };
const ABOUT_DATE_FORMAT_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, localeMatcher: 'best fit', };
const SHORT_DATE_FORMAT_OPTIONS = { localeMatcher: 'best fit', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }

const NAMESPACE = "programconfigapp";
const BACKUPS_NAMESPACE = `${NAMESPACE}_backups`;
const TRANSFERRED_EVENTS_NAMESPACE = `${NAMESPACE}_transferred`;
const GENERATED_OBJECTS_NAMESPACE = `${NAMESPACE}_generatedObjects`;
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

//* PCA Metadata Attribute ID
const METADATA = "haUflNqP85K";

//* HNQIS 1.X Attributes
const QUESTION_TYPE_ATTRIBUTE = "RkNBKHl7FcO";
const DE_TYPE_ATTRIBUTE = "IMVz39TtAHM";
const HEADER_ATTRIBUTE = "olcVXnDPG1U";
const QUESTION_PARENT_ATTRIBUTE = "jeZmx9zUd5p";
const QUESTION_PARENT_OPTIONS_ATTRIBUTE = "zszUcUt6cH0";
const COMPOSITIVE_SCORE_ATTRIBUTE = "k738RpAYLmz";
const SCORE_NUM_ATTRIBUTE = "Zyr7rlDOJy8";
const SCORE_DEN_ATTRIBUTE = "l7WdLDhE3xW";
const QUESTION_ORDER_ATTRIBUTE = "xf9iDHNFLgx";

//* Field Lengths
const MAX_PREFIX_LENGTH = 25;
const MAX_PROGRAM_NAME_LENGTH = 230;
const MAX_STAGE_NAME_LENGTH = 230;
const MAX_SECTION_NAME_LENGTH = 230;
const MAX_DATA_ELEMENT_NAME_LENGTH = 200;
const MAX_FORM_NAME_LENGTH = 230;
const MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH = 230;

const MIN_NAME_LENGTH = 2;
const MIN_DESCRIPTION_LENGTH = 2;
const MIN_DATA_ELEMENT_NAME_LENGTH = 2;

const MAX_SHORT_NAME_LENGTH = 50;

//* DHIS2 Render Types

const RENDER_TYPES = [
    'DEFAULT',
    'DROPDOWN',
    'VERTICAL_RADIOBUTTONS',
    'HORIZONTAL_RADIOBUTTONS',
    'VERTICAL_CHECKBOXES',
    'HORIZONTAL_CHECKBOXES',
    'VALUE'
];

//* HNQIS2 Elem Types
const ELEM_TYPES = [{ label: 'Question', value: 'question' }, { label: 'Label', value: 'label' }];

//* PCA Dropdowns
const VALUE_TYPES_H2 = [
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

const VALUE_TYPES_TRACKER = [
    { label: 'Text', value: 'TEXT', icon: <TextIcon /> },
    { label: 'Long Text', value: 'LONG_TEXT', icon: <TextIcon /> },
    { label: 'Letter', value: 'LETTER', icon: <TextIcon /> },
    { label: 'Phone Number', value: 'PHONE_NUMBER', icon: <PhoneIcon />},
    { label: 'Email', value: 'EMAIL', icon: <EmailIcon />},
    { label: 'Yes/No', value: 'BOOLEAN', icon: <ArrowDropDownIcon /> },
    { label: 'Yes only', value: 'TRUE_ONLY', icon: <CheckBoxIcon /> },
    { label: 'Date', value: 'DATE', icon: <DateIcon /> },
    { label: 'Date & Time', value: 'DATETIME', icon: <DateIcon /> },
    { label: 'Time', value: 'TIME', icon: <TimeIcon /> },
    { label: 'Number', value: 'NUMBER', icon: <NumberIcon /> },
    { label: 'Unit Interval', value: 'UNIT_INTERVAL', icon: <DataArrayIcon />},
    { label: 'Percentage', value: 'PERCENTAGE', icon: <PercentIcon /> },
    { label: 'Integer', value: 'INTEGER', icon: <NumberIcon /> },
    { label: 'Positive Integer', value: 'INTEGER_POSITIVE', icon: <NumberIcon /> },
    { label: 'Negative Integer', value: 'INTEGER_NEGATIVE', icon: <NumberIcon /> },
    { label: 'Positive or Zero Integer', value: 'INTEGER_ZERO_OR_POSITIVE', icon: <NumberIcon /> },
    { label: 'Coordinate', value: 'COORDINATE', icon: <PlaceIcon />},
    { label: 'Organisation Unit', value: 'ORGANISATION_UNIT', icon: <ApartmentIcon />},
    { label: 'Reference', value: 'REFERENCE', icon: <ArrowRightAltIcon />},
    { label: 'Age', value: 'AGE', icon: <NumberIcon /> },
    { label: 'URL', value: 'URL', icon: <HttpIcon />},
    { label: 'File', value: 'FILE_RESOURCE', icon: <InsertDriveFileIcon />},
    { label: 'Image', value: 'IMAGE', icon: <ImageIcon />},
    { label: 'GeoJSON', value: 'GEOJSON', icon: <DataObjectIcon />},
    { label: 'Username', value: 'USERNAME', icon: <TextIcon /> },
    { label: 'Tracker Associate', value: 'TRACKER_ASSOCIATE', icon: <QuestionMarkIcon />}
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

//* Mappings for JSON Metadata Export
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
    "system": "System",
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

//* JSON Metadata Export related

const EXPORT_PRESETS = [
    { value: 'local', label: 'Current Server'},
    { value: 'external', label: 'Another Server' }
]

const EXPORT_HNQIS_PRESETS = [
    { value: 'h2External', label: 'HNQIS2-Enabled Server'}
]

const H2_ENABLED_IMPORT_REMOVE_KEYS = ['date', 'categories', 'categoryCombos', 'categoryOptionCombos', 'categoryOptions','trackedEntityTypes','trackedEntityAttributes','system'];

const H2_ATTRIBUTES_TO_KEEP = ['haUflNqP85K', 'LP171jpctBm', 'yB5tFAAN7bI', 'DVzuBdj9kli', 'yhKEe6BLEer'];

const JSON_ATTRIBUTE_SETTINGS = [
    { key: 'sharings', label: 'Remove Sharing Settings', selected: false, affects: ['sharing'] },
    { key: 'ous', label: 'Remove Organisation Units', selected: false, affects: ['organisationUnits'] },
    { key: 'redates', label: 'Remove all "Date", "Last Updated" and "Created" fields', selected: false, affects: ['date', 'lastUpdated', 'created'] },
    { key: 'reuser', label: 'Remove all "Created By" and "Last Updated By" fields', selected: false, affects: ['createdBy', 'lastUpdatedBy'] },
    { key: 'recats', label: 'Remove every field related to "Categories"', selected: false, affects: ['category', 'categoryCombo', 'categoryOptionCombo', 'categoryOption', 'categories', 'categoryCombos', 'categoryOptionCombos', 'categoryOptions'] },
    { key: 'relegends', label: 'Remove Legend Sets', selected: false, affects: ['legends', 'legendSets', 'legend', 'legendSet'] },
];

//* DHIS2 Value Types
const DHIS2_VALUE_TYPES_MAP = {
    "TEXT": "Text",
    "LONG_TEXT": "Long Text",
    "LETTER": "Letter",
    "PHONE_NUMBER": "Phone Number",
    "EMAIL": "Email",
    "BOOLEAN": "Yes/No",
    "TRUE_ONLY": "Yes only",
    "DATE": "Date",
    "DATETIME": "Date & Time",
    "TIME": "Time",
    "NUMBER": "Number",
    "UNIT_INTERVAL": "Unit Interval",
    "PERCENTAGE": "Percentage",
    "INTEGER": "Integer",
    "INTEGER_POSITIVE": "Positive Integer",
    "INTEGER_NEGATIVE": "Negative Integer",
    "INTEGER_ZERO_OR_POSITIVE": "Positive or Zero Integer",
    "COORDINATE": "Coordinate",
    "ORGANISATION_UNIT": "Organisation Unit",
    "REFERENCE": "Reference",
    "AGE": "Age",
    "URL": "URL",
    "FILE_RESOURCE": "File",
    "IMAGE": "Image",
    "GEOJSON": "GeoJSON",
    "USERNAME": "Username",
    "TRACKER_ASSOCIATE": "Tracker Associate"
};

//* DHIS2 Aggregation Types
const DHIS2_AGG_OPERATORS_MAP = {
    "SUM": "Sum", 
    "AVERAGE": "Average", 
    "AVERAGE_SUM_ORG_UNIT": "Average (Sum in Org Unit hierarchy)", 
    "LAST": "Last value (Sum in Org Unit hierarchy)", 
    "LAST_AVERAGE_ORG_UNIT": "Last value (Average in Org Unit hierarchy)", 
    "LAST_LAST_ORG_UNIT": "** last_last_org_unit **", 
    "LAST_IN_PERIOD": "Last value in period (Sum in Org Unit hierarchy)", 
    "LAST_IN_PERIOD_AVERAGE_ORG_UNIT": "Last value in period (Average in Org Unit hierarchy)", 
    "FIRST": "First value (Sum in Org Unit hierarchy)", 
    "FIRST_AVERAGE_ORG_UNIT": "First value (Average in Org Unit hierarchy)", 
    "FIRST_FIRST_ORG_UNIT": "** first_first_org_unit ", 
    "COUNT": "Count", 
    "STDDEV": "Standard Deviation", 
    "VARIANCE": "Variance", 
    "MIN": "Min", 
    "MAX": "Max", 
    "NONE": "None", 
    "CUSTOM": "Custom", 
    "DEFAULT": "Default"
}

//* PCA Tag Styles
const tagStyle = { minWidth: '11em', maxWidth: '10em', display: 'flex', justifyContent: 'center' };
const newTagStyle = { minWidth: '6em', maxWidth: '6em', display: 'flex', justifyContent: 'center' };
const updatedTagStyle = { minWidth: '8em', maxWidth: '8em', display: 'flex', justifyContent: 'center' };

export {
    ABOUT_DATE_FORMAT_OPTIONS,
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
    DHIS2_AGG_OPERATORS_MAP,
    DHIS2_KEY_MAP,
    DHIS2_PRIMARY_COLOR,
    DHIS2_VALUE_TYPES_MAP,
    ELEM_TYPES,
    EXPORT_HNQIS_PRESETS,
    EXPORT_PRESETS,
    FEATURE_TYPES,
    FEEDBACK_ORDER,
    FEEDBACK_TEXT,
    GENERATED_OBJECTS_NAMESPACE,
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
    H1_QUESTION_HIDE_GROUP,
    H1_QUESTION_HIDE_TYPE,
    H1_RESPONSIBLE1,
    H1_RESPONSIBLE2,
    H1_RESPONSIBLE3,
    H2_ATTRIBUTES_TO_KEEP,
    H2_ENABLED_IMPORT_REMOVE_KEYS,
    H2_METADATA_VERSION,
    H2_REQUIRED,
    HEADER_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    JSON_ATTRIBUTE_SETTINGS,
    LEGEND_YES_NO,
    LEGEND_YES_PARTIAL_NO,
    LIGHT_BLUE_COLOR,
    MAX_DATA_ELEMENT_NAME_LENGTH,
    MAX_FORM_NAME_LENGTH,
    MAX_PREFIX_LENGTH,
    MAX_PROGRAM_NAME_LENGTH,
    MAX_SECTION_NAME_LENGTH,
    MAX_SHORT_NAME_LENGTH,
    MAX_STAGE_NAME_LENGTH,
    MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH,
    MAX_VERSION,
    METADATA,
    MIN_DATA_ELEMENT_NAME_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MIN_NAME_LENGTH,
    MIN_VERSION,
    NAMESPACE,
    newTagStyle,
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
    QUESTION_ORDER_ATTRIBUTE,
    QUESTION_PARENT_ATTRIBUTE,
    QUESTION_PARENT_OPTIONS_ATTRIBUTE,
    QUESTION_TYPE_ATTRIBUTE,
    RENDER_TYPES,
    REPORT_DATE_TO_USE,
    REQUIRED_H2_PROGRAM_BUILD_VERSION,
    SCORE_DEN_ATTRIBUTE,
    SCORE_NUM_ATTRIBUTE,
    SHORT_DATE_FORMAT_OPTIONS,
    tagStyle,
    TRANSFERRED_EVENTS_NAMESPACE,
    updatedTagStyle,
    VALUE_TYPES_H2,
    VALUE_TYPES_TRACKER,
    VISUALIZATIONS_LEGEND
};
