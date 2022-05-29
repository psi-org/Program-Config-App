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

const BUILD_VERSION = "1.4.0"
const SHARINGS_LIMIT_VERSION = "2.36"

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
    COMPETENCY_ATTRIBUTE,
    COMPETENCY_CLASS,
    FEEDBACK_ORDER,
    FEEDBACK_TEXT,
    BUILD_VERSION,
    SHARINGS_LIMIT_VERSION,
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
    AGG_TYPES
}