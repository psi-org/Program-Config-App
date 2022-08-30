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

const BUILD_VERSION = "1.5.0"
const BUILD_DATE = "July 28th, 2022"
const MIN_VERSION = "2.36"
const MAX_VERSION = "2.38.2"

const PCA_METADATA_VERSION = "1.0.1"
const H2_METADATA_VERSION = "1.0.1"

const PCA_ATTRIBUTES = ["yB5tFAAN7bI","haUflNqP85K"]
const PCA_OPTION_SETS = ["TOcCuCN2CLm"]
const PCA_OPTIONS = ["Ip3IqzzqgLN","Jz4YKD15lnK","QR0HHcQri91","v9XPATv6G3N"]
const PCA_USER_ROLES = ["QbYqOgwk5fJ", "JDmJ4ADTaDq"]

const H2_REQUIRED = {
    dataElements : ["NAaHST5ZDTE","VqBfZjZhKkU","pzWDtDUorBt","F0Qcr8ANr7t","DIoqtxbSJIL","nswci5V4j0d"],
    optionSets : ["NDfZ129owtz","y752HEwvCGi"],
    options : ["BNjofUBvlJ8","Ox6VQNmvuS3","SzQKvyTKPEw","NPw1hV4degm","lztu61LKSII","McXRLIwjDh7","xTJOcijWyaD","UgcqvJVJ9f0","aYWZXNhvXQw","C9L7MCPeHr5","c8qOHzSbhWM","imVa2DiLgrJ","r8UqKmXwXqa","RHreLvo1UWn","hX7DJdCN9Ou","xaBeYsM2hFH","jdVVvtwuJ7Y","e10afvAkkPR","OqRNLt5Nbub","MstdLcCaYZW","Jhn703YNPa1"],
    trackedEntityTypes : ["oNwpeWkfoWc"],
    trackedEntityAttributes: ["Xe5hUu6KkUT","NQdpdST0Gcx","nHg1hGgtJwm","UlUYUyZJ6o9","ulU9KKgSLYe"],
    attributes : ["LP171jpctBm","yhKEe6BLEer"],
    legendSets: ["RXxPYFwtgf4"]
}

const DATE_FORMAT_OPTIONS = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric',minute:'numeric',second:'numeric',hour12:false }

const NAMESPACE = "programconfigapp"
const BACKUPS_NAMESPACE = `${NAMESPACE}_backups`
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

const COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe"
const GLOBAL_SCORE_ATTRIBUTE = "NQdpdST0Gcx"

const COMPETENCY_CLASS = "NAaHST5ZDTE"

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
    H2_REQUIRED
}