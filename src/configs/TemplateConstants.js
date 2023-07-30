export const thinBorder = {
    top: {
        style: "thin"
    },
    left: {
        style: "thin"
    },
    bottom: {
        style: "thin"
    },
    right: {
        style: "thin"
    }
};

export const middleCenter = {
    wrapText: true,
    vertical: 'middle',
    horizontal: 'center'
};
export const verticalMiddle = {
    wrapText: true,
    vertical: 'middle'
};
export const horizontalCenter = {
    wrapText: true,
    horizontal: 'center'
};

export const conditionalError = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'dc3545' } } };
export const sectionHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'f8c291' } } };
export const questionHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'ffffff' } } };
export const labelHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'c6e0b4' } } };
export const otherHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: '99dcff' } } };
export const disabledHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'b2bec3' } } };

export const validWorksheets = ['Instructions', 'Template', 'Release Notes', 'Mapping'];

export const structureValidator = ['"Section,label,question,score"'];
export const teaStructureValidator = ['"Section,TEA"'];
export const trackerStructureValidator = ['"Section,Data Element"'];
export const yesNoValidator = ['"Yes,No"'];

export const TEMPLATE_PASSWORD = "TOyNrNrH8fNT8W%Au&4A";

export const HNQIS2_TEMPLATE_MAP = {
    parentName: "Parent Name",
    structure: "Structure",
    formName: "Form Name",
    isCritical: "Critical Step",
    isCompulsory: "Compulsory",
    valueType: "Value Type",
    optionSet: "Option Set",
    legend: "Legend",
    scoreNum: "Score Numerator",
    scoreDen: "Score Denominator",
    feedbackOrder: "Compositive Indicator (Feedback Order)",
    parentQuestion: "Parent Question",
    parentValue: "Answer Value",
    feedbackText: "Feedback Text",
    description: "Description",
    programStage: "Program Stage Id",
    programSection: "Program Section Id",
    dataElementId: "Data Element Id",
};

export const HNQIS2_TEMPLATE_HEADERS = [
    HNQIS2_TEMPLATE_MAP.parentName,
    HNQIS2_TEMPLATE_MAP.structure,
    HNQIS2_TEMPLATE_MAP.formName,
    HNQIS2_TEMPLATE_MAP.isCritical,
    HNQIS2_TEMPLATE_MAP.isCompulsory,
    HNQIS2_TEMPLATE_MAP.valueType,
    HNQIS2_TEMPLATE_MAP.optionSet,
    HNQIS2_TEMPLATE_MAP.legend,
    HNQIS2_TEMPLATE_MAP.scoreNum,
    HNQIS2_TEMPLATE_MAP.scoreDen,
    HNQIS2_TEMPLATE_MAP.feedbackOrder,
    HNQIS2_TEMPLATE_MAP.parentQuestion,
    HNQIS2_TEMPLATE_MAP.parentValue,
    HNQIS2_TEMPLATE_MAP.feedbackText,
    HNQIS2_TEMPLATE_MAP.description,
    HNQIS2_TEMPLATE_MAP.programStage,
    HNQIS2_TEMPLATE_MAP.programSection,
    HNQIS2_TEMPLATE_MAP.dataElementId
];

export const HNQIS2_TEMPLATE_VERSION_CELL = "D13";
export const HQNIS2_PROGRAM_TYPE_CELL = "D14";
export const HNQIS2_ORIGIN_SERVER_CELL = "D20";

export const TRACKER_TEA_MAP = {
    structure: 'Structure',
    uid: 'UID',
    name: 'Name',
    shortName: 'Short Name',
    valueType: 'Value Type',
    aggType: 'Aggregation Type',
    mandatory: 'Mandatory',
    searchable: 'Searchable',
    displayInList: 'Display in List',
    allowFutureDate: 'Allow Future Date',
    programSection: 'Program Section Id',
    programTea: 'Program TEA Id'
};

export const TRACKER_TEA_HEADERS = [
    TRACKER_TEA_MAP.structure,
    TRACKER_TEA_MAP.uid,
    TRACKER_TEA_MAP.name,
    TRACKER_TEA_MAP.shortName,
    TRACKER_TEA_MAP.valueType,
    TRACKER_TEA_MAP.aggType,
    TRACKER_TEA_MAP.mandatory,
    TRACKER_TEA_MAP.searchable,
    TRACKER_TEA_MAP.displayInList,
    TRACKER_TEA_MAP.allowFutureDate,
    TRACKER_TEA_MAP.programSection,
    TRACKER_TEA_MAP.programTea
];

export const TRACKER_TEMPLATE_MAP = {
    structure: 'Structure',
    correlative: 'Correlative',
    autoNaming: 'Use Auto Naming',
    formName: 'Form Name',
    name: 'Full Name',
    shortName: 'Short Name',
    code: 'Code',
    description: 'Description',
    isCompulsory: 'Compulsory',
    valueType: 'Value Type',
    aggOperator: 'Agg Operator',
    optionSet: 'Option Set',
    optionSetDetails: 'Option Set Details',
    legend: 'Legend Set',
    parentQuestion: 'Parent Question',
    parentValue: 'Answer Value',
    stageId: 'Stage ID',
    stageName: 'Stage Name',
    programStage: 'Program Stage Id',
    programSection: 'Program Section Id',
    dataElementId: 'Data Element Id'
};

export const TRACKER_TEMPLATE_HEADERS = [
    TRACKER_TEMPLATE_MAP.structure,
    TRACKER_TEMPLATE_MAP.correlative,
    TRACKER_TEMPLATE_MAP.autoNaming,
    TRACKER_TEMPLATE_MAP.formName,
    TRACKER_TEMPLATE_MAP.name,
    TRACKER_TEMPLATE_MAP.shortName,
    TRACKER_TEMPLATE_MAP.code,
    TRACKER_TEMPLATE_MAP.description,
    TRACKER_TEMPLATE_MAP.isCompulsory,
    TRACKER_TEMPLATE_MAP.valueType,
    TRACKER_TEMPLATE_MAP.aggOperator,
    TRACKER_TEMPLATE_MAP.optionSet,
    TRACKER_TEMPLATE_MAP.optionSetDetails,
    TRACKER_TEMPLATE_MAP.legend,
    TRACKER_TEMPLATE_MAP.parentQuestion,
    TRACKER_TEMPLATE_MAP.parentValue,
    TRACKER_TEMPLATE_MAP.stageId,
    TRACKER_TEMPLATE_MAP.stageName,
    TRACKER_TEMPLATE_MAP.programStage,
    TRACKER_TEMPLATE_MAP.programSection,
    TRACKER_TEMPLATE_MAP.dataElementId
];

export const TRACKER_TEMPLATE_VERSION_CELL = "L2";
export const TRACKER_ORIGIN_SERVER_CELL = "D17";
export const TRACKER_PROGRAM_TYPE_CELL = "J23";

export const HNQIS2_VALUE_TYPES = ['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'INTEGER_ZERO_OR_POSITIVE', 'TEXT', 'LONG_TEXT', 'PERCENTAGE', 'DATE', 'TIME'];
export const HNQIS2_AGG_OPERATORS = ['NONE', 'SUM', 'AVERAGE', 'COUNT'];

export const RENDER_TYPES = ['DEFAULT', 'DROPDOWN', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS', 'VERTICAL_CHECKBOXES', 'HORIZONTAL_CHECKBOXES', 'VALUE'];

export const TEMPLATE_PROGRAM_TYPES = {
    hnqis2: 'HNQIS2',
    tracker: 'Tracker Program',
    event: 'Event Program'
}