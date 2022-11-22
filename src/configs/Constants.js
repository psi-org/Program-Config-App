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

const BUILD_VERSION = "1.6.1"
const BUILD_DATE = "December 14th, 2022"
const MIN_VERSION = "2.36"
const MAX_VERSION = "2.38.1.1"

const PCA_METADATA_VERSION = "1.1.0"
const H2_METADATA_VERSION = "1.1.1"

const PCA_ATTRIBUTES = ["yB5tFAAN7bI","haUflNqP85K"]
const PCA_OPTION_SETS = ["TOcCuCN2CLm"]
const PCA_OPTIONS = ["Ip3IqzzqgLN","Jz4YKD15lnK","QR0HHcQri91","v9XPATv6G3N"]
const PCA_USER_ROLES = ["QbYqOgwk5fJ", "JDmJ4ADTaDq"]

// *HNQIS2 Attributes
const COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe"
const GLOBAL_SCORE_ATTRIBUTE = "NQdpdST0Gcx"
const ASSESSMENT_DATE_ATTRIBUTE = "UlUYUyZJ6o9"
const HEALTH_AREA_ATTRIBUTE = "Xe5hUu6KkUT"
const ORGANISATION_UNIT_ATTRIBUTE = "nHg1hGgtJwm"

// *H2 Data Elements
const COMPETENCY_CLASS = "NAaHST5ZDTE"
const CRITICAL_STEPS = "VqBfZjZhKkU"
const NON_CRITICAL_STEPS = "pzWDtDUorBt"
const ACTION_PLAN_ACTION = "F0Qcr8ANr7t"
const ACTION_PLAN_DUE_DATE = "DIoqtxbSJIL"
const ACTION_PLAN_RESPONSIBLE = "nswci5V4j0d"

// *H2 Tracked Entity Type
const ASSESSMENT_TET = "oNwpeWkfoWc"

// *H2 Option Sets
const OPTION_SET_COMPETENCY = "NDfZ129owtz"
const OPTION_SET_HEALTH_AREAS = "y752HEwvCGi"

// *H2 Legend Sets
const LEGEND_YES_NO = "RXxPYFwtgf4"
const LEGEND_YES_PARTIAL_NO = "kqQjtHIc7II"
const VISUALIZATIONS_LEGEND = "nvVrBnbud3L"

// *H1 Control Data Elements
const H1_OVERALL_SCORE = "Y8Nmpp7RhXw"
const H1_COMPETENCY_CLASS = "KesgQ5NHkQW"

const H1_ACTION1 = "wRaxfSNz5Xb"
const H1_RESPONSIBLE1 = "hUXusK1q7qX"
const H1_DUE_DATE1 = "zAWljfTXSnZ"
const H1_COMPLETION_DATE1 = "bu0dDZmEqb6"

const H1_ACTION2 = "uv22UMpXUA2"
const H1_RESPONSIBLE2 = "Qor2Meb1sNf"
const H1_DUE_DATE2 = "BtReGP2EMKA"
const H1_COMPLETION_DATE2 = "ClN8h6d1C9o"

const H1_ACTION3 = "OJRW4LPDsdU"
const H1_RESPONSIBLE3 = "z9bskG067HE"
const H1_DUE_DATE3 = "bVPpgPm1hj0"
const H1_COMPLETION_DATE3 = "LPFqIi0Ml4a"

const H1_ACTION_PLAN_OLD = "Im5C86I2ObV"    // ?Interpreted as Action 1
const H1_ACTION1_OLD = "ibpjjNJLn44"        // ?Interpreted as Action 2
const H1_ACTION2_OLD = "bwwyHVzxnTZ"        // ?Interpreted as Action 3

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

const DATE_FORMAT_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric',minute:'numeric',second:'numeric',hour12:false }

const NAMESPACE = "programconfigapp"
const BACKUPS_NAMESPACE = `${NAMESPACE}_backups`
const TRANSFERRED_EVENTS_NAMESPACE = `${NAMESPACE}_transferred`;
const DATASTORE_PCA_METADATA = "PCAMetadata"
const DATASTORE_H2_METADATA = "H2Metadata"

const PERIOD_TYPES = [
    {label: "Daily", value: "Daily"},
    {label: "Weekly", value: "Weekly"},
    {label: "Weekly starting Wednesday", value: "WeeklyWednesday"},
    {label: "Weekly starting Thursday", value: "WeeklyThursday"},
    {label: "Weekly starting Saturday", value: "WeeklySaturday"},
    {label: "Weekly starting Sunday", value: "WeeklySunday"},
    {label: "Bi-Weekly", value: "BiWeekly"},
    {label: "Monthly", value: "Monthly"},
    {label: "Bi-Monthly", value: "BiMonthly"},
    {label: "Quarterly", value: "Quarterly"},
    {label: "Six-Monthly", value: "SixMonthly"},
    {label: "Six-Monthly starting April", value: "SixMonthlyApril"},
    {label: "Six-Monthly starting November", value: "SixMonthlyNov"},
    {label: "Yearly", value: "Yearly"},
    {label: "Financial year starting April", value: "FinancialApril"},
    {label: "Financial year starting July", value: "FinancialJuly"},
    {label: "Financial year starting October", value: "FinancialOct"},
    {label: "Financial year starting November", value: "FinancialNov"}
]

const FEATURE_TYPES = [
    {label: 'None', value: 'NONE'},
    {label: 'Point', value: 'POINT'},
    {label: 'Polygon', value: 'POLYGON'}
]

const REPORT_DATE_TO_USE = [
    {label: 'Incident Date', value: 'incidentDate'},
    {label: 'Enrollment Date', value: 'enrollmentDate'}
]

const METADATA = "haUflNqP85K"

const QUESTION_TYPE_ATTRIBUTE = "RkNBKHl7FcO"
const DE_TYPE_ATTRIBUTE = "IMVz39TtAHM"
const HEADER_ATTRIBUTE = "olcVXnDPG1U"
const QUESTION_PARENT_ATTRIBUTE = "jeZmx9zUd5p"
const QUESTION_PARENT_OPTIONS_ATTRIBUTE = "zszUcUt6cH0"
const COMPOSITIVE_SCORE_ATTRIBUTE = "k738RpAYLmz"
const SCORE_NUM_ATTRIBUTE = "Zyr7rlDOJy8"
const SCORE_DEN_ATTRIBUTE = "l7WdLDhE3xW"
const QUESTION_ORDER_ATTRIBUTE = "xf9iDHNFLgx"

const FEEDBACK_ORDER = "LP171jpctBm"
const FEEDBACK_TEXT = "yhKEe6BLEer"

const MAX_PREFIX_LENGTH = 25
const MAX_PROGRAM_NAME_LENGTH = 230
const MAX_STAGE_NAME_LENGTH = 230
const MAX_SECTION_NAME_LENGTH = 230
const MAX_DATA_ELEMENT_NAME_LENGTH = 200;

const MIN_NAME_LENGTH = 2
const MIN_DESCRIPTION_LENGTH = 2
const MIN_DATA_ELEMENT_NAME_LENGTH = 2;

const MAX_SHORT_NAME_LENGTH = 50

const ELEM_TYPES = [{ label: 'Question', value: 'question' }, { label: 'Label', value: 'label' }]
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
]
const AGG_TYPES = [
    { value: 'NONE', label: 'None', icon: <BlockIcon /> },
    { value: 'SUM', label: 'Sum', icon: <FunctionsIcon /> },
    { value: 'AVERAGE', label: 'Average', icon: <TimelineIcon /> },
    { value: 'AVERAGE_SUM_ORG_UNIT', label: 'Average/Sum in org unit hierarchy', icon: <TimelineIcon /> },
    { value: 'COUNT', label: 'Count', icon: <NumberIcon /> },
    { value: 'STDDEV', label: 'Standard deviation', icon: <SsidChartIcon /> },
    { value: 'VARIANCE', label: 'Variance', icon: <SsidChartIcon /> },
    { value: 'MIN', label: 'Min', icon: <RemoveIcon /> },
    { value: 'MAX', label: 'Max', icon: <AddIcon /> }
]

export {
    PERIOD_TYPES,
    FEATURE_TYPES,
    REPORT_DATE_TO_USE,
    METADATA,
    NAMESPACE,
    BACKUPS_NAMESPACE,
    TRANSFERRED_EVENTS_NAMESPACE,
    DATASTORE_PCA_METADATA,
    DATASTORE_H2_METADATA,
    PCA_METADATA_VERSION,
    PCA_ATTRIBUTES,
    PCA_OPTION_SETS,
    PCA_OPTIONS,
    PCA_USER_ROLES,
    H2_METADATA_VERSION,
    COMPETENCY_ATTRIBUTE,
    GLOBAL_SCORE_ATTRIBUTE,
    COMPETENCY_CLASS,
    FEEDBACK_ORDER,
    FEEDBACK_TEXT,
    BUILD_VERSION,
    BUILD_DATE,
    MIN_VERSION,
    MAX_VERSION,
    MAX_PREFIX_LENGTH,
    MAX_PROGRAM_NAME_LENGTH,
    MAX_STAGE_NAME_LENGTH,
    MAX_SECTION_NAME_LENGTH,
    MAX_DATA_ELEMENT_NAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MIN_DATA_ELEMENT_NAME_LENGTH,
    MAX_SHORT_NAME_LENGTH,
    ELEM_TYPES,
    VALUE_TYPES,
    AGG_TYPES,
    DATE_FORMAT_OPTIONS,
    H2_REQUIRED,
    QUESTION_TYPE_ATTRIBUTE,
    DE_TYPE_ATTRIBUTE,
    HEADER_ATTRIBUTE,
    QUESTION_PARENT_ATTRIBUTE,
    QUESTION_PARENT_OPTIONS_ATTRIBUTE,
    COMPOSITIVE_SCORE_ATTRIBUTE,
    SCORE_NUM_ATTRIBUTE,
    SCORE_DEN_ATTRIBUTE,
    QUESTION_ORDER_ATTRIBUTE,
    ASSESSMENT_DATE_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    ORGANISATION_UNIT_ATTRIBUTE,
    CRITICAL_STEPS,
    NON_CRITICAL_STEPS,
    ACTION_PLAN_ACTION,
    ACTION_PLAN_DUE_DATE,
    ACTION_PLAN_RESPONSIBLE,
    ASSESSMENT_TET,
    H1_OVERALL_SCORE,
    H1_COMPETENCY_CLASS,
    H1_ACTION1,
    H1_RESPONSIBLE1,
    H1_DUE_DATE1,
    H1_COMPLETION_DATE1,
    H1_ACTION2,
    H1_RESPONSIBLE2,
    H1_DUE_DATE2,
    H1_COMPLETION_DATE2,
    H1_ACTION3,
    H1_RESPONSIBLE3,
    H1_DUE_DATE3,
    H1_COMPLETION_DATE3,
    H1_ACTION_PLAN_OLD,
    H1_ACTION1_OLD,
    H1_ACTION2_OLD, 
    VISUALIZATIONS_LEGEND,
    LEGEND_YES_NO,
    LEGEND_YES_PARTIAL_NO,
    OPTION_SET_COMPETENCY,
    OPTION_SET_HEALTH_AREAS
};