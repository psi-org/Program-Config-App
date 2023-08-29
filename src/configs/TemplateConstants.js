import { MAX_DATA_ELEMENT_NAME_LENGTH, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH, MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH, MIN_DATA_ELEMENT_NAME_LENGTH } from "./Constants";

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
    programTea: 'Program TEA Id',
    prompts: 'Errors/Warnings/Info'
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
    TRACKER_TEA_MAP.programTea,
    TRACKER_TEA_MAP.prompts
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
    parentQuestion: 'Parent Data Element',
    parentValue: 'Answer Value',
    prompts: 'Errors/Warnings/Info',
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
    TRACKER_TEMPLATE_MAP.prompts,
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

export const TRACKER_TEA_CONDITIONAL_FORMAT_VALIDATIONS = {
    structureNotSelected: {
        formula: 'AND(ISBLANK($A3),NOT(ISBLANK($C3)))',
        dynamicFormula: 'AND(ISBLANK($A_ROWNUM_),NOT(ISBLANK($C_ROWNUM_)))',
        prompt: 'Structure not defined.'
    },
    duplicatedTEA: {
        formula: 'AND($B3<>"",COUNTIF($B$3:$B$102,B3)>1)',
        dynamicFormula: 'AND($B_ROWNUM_<>"",COUNTIF($B$3:$B$102,B_ROWNUM_)>1)',
        prompt: 'Duplicated TEA.'
    },
    nameNotDefined: {
        formula: 'AND(ISBLANK($C3),NOT(ISBLANK($A3)))',
        dynamicFormula: 'AND(ISBLANK($C_ROWNUM_),NOT(ISBLANK($A_ROWNUM_)))',
        prompt: 'Name not defined.'
    },
    teaNotFound: {
        formula: 'OR(ISBLANK($B3), $B3 = "Not Found", ISBLANK($D3), $D3 = "Not Found", ISBLANK($E3), $E3 = "Not Found", ISBLANK($F3), $F3 = "Not Found")',
        prompt: 'The specified TEA is not available.'
    },
    disabledFutureDate: {
        formula: 'AND($A3 = "TEA", NOT(ISBLANK($C3)), OR(ISBLANK($E3), AND($E3 <> "DATE", $E3 <> "DATETIME")))',
        dynamicFormula: 'AND($A_ROWNUM_ = "TEA", NOT(ISBLANK($C_ROWNUM_)), OR(ISBLANK($E_ROWNUM_), AND($E_ROWNUM_ <> "DATE", $E_ROWNUM_ <> "DATETIME")))',
        prompt: 'Future Date not available for the selected TEA.'
    }
}

export const TRACKER_STAGE_CONDITIONAL_FORMAT_VALIDATIONS = {
    correlativeNotDefined: {
        formula: 'AND(ISBLANK($B3),$A3="Data Element")',
        dynamicFormula: 'AND(ISBLANK($B_ROWNUM_),$A_ROWNUM_="Data Element")',
        prompt: 'Correlative not defined.'
    },
    formNameNotDefined: {
        formula: 'AND(ISBLANK($D3),NOT(ISBLANK($A3)))',
        dynamicFormula: 'AND(ISBLANK($D_ROWNUM_),NOT(ISBLANK($A_ROWNUM_)))',
        prompt: 'Form Name not defined.'
    },
    nameNotDefined: {
        formula: 'AND(ISBLANK($E3),$A3 = "Data Element",$C3 = "No")',
        dynamicFormula: 'AND(ISBLANK($E_ROWNUM_),$A_ROWNUM_ = "Data Element",$C_ROWNUM_ = "No")',
        prompt: 'Name not defined.'
    },
    shotNameNotDefined: {
        formula: 'AND(ISBLANK($F3),$A3 = "Data Element",$C3 = "No")',
        dynamicFormula: 'AND(ISBLANK($F_ROWNUM_),$A_ROWNUM_ = "Data Element",$C_ROWNUM_ = "No")',
        prompt: 'Short Name not defined.'
    },
    structureNotDefined: {
        formula: 'AND(ISBLANK($A3),NOT(ISBLANK($D3)))',
        dynamicFormula: 'AND(ISBLANK($A_ROWNUM_),NOT(ISBLANK($D_ROWNUM_)))',
        prompt: 'Structure not defined.'
    },
    formNameOutOfRange: {
        formula: `AND(NOT(ISBLANK($A3)),OR(LEN($D3)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($D3)>${MAX_FORM_NAME_LENGTH}))`,
        dynamicFormula: `AND(NOT(ISBLANK($A_ROWNUM_)),OR(LEN($D_ROWNUM_)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($D_ROWNUM_)>${MAX_FORM_NAME_LENGTH}))`,
        prompt: `Form Name out of range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_FORM_NAME_LENGTH} characters).`
    },
    nameOutOfRange: {
        formula: `AND($A3 = "Data Element",$C3 = "No",OR(LEN($E3)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($E3)>${MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH}))`,
        dynamicFormula: `AND($A_ROWNUM_ = "Data Element",$C_ROWNUM_ = "No",OR(LEN($E_ROWNUM_)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($E_ROWNUM_)>${MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH}))`,
        prompt: `Name out of range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH} characters).`
    },
    shortNameOutOfRange: {
        formula: `AND($A3 = "Data Element",$C3 = "No",LEN($F3)>${MAX_SHORT_NAME_LENGTH})`,
        dynamicFormula: `AND($A_ROWNUM_ = "Data Element",$C_ROWNUM_ = "No",LEN($F_ROWNUM_)>${MAX_SHORT_NAME_LENGTH})`,
        prompt: `Short Name out of range (Max ${MAX_SHORT_NAME_LENGTH} characters).`
    },
    codeOutOfRange: {
        formula: `AND($A3 = "Data Element",$C3 = "No",LEN($G3)>${MAX_SHORT_NAME_LENGTH})`,
        dynamicFormula: `AND($A_ROWNUM_ = "Data Element",$C_ROWNUM_ = "No",LEN($G_ROWNUM_)>${MAX_SHORT_NAME_LENGTH})`,
        prompt: `Code out of range (Max ${MAX_SHORT_NAME_LENGTH} characters).`
    },
    autoNamingDisableFields: {
        formula: 'AND($A3 = "Data Element",$C3 <> "No")',
        dynamicFormula: 'AND($A_ROWNUM_ = "Data Element",$C_ROWNUM_ <> "No")',
        prompt: 'Name, Short Name and Code are auto generated.'
    },
    valueTypeDisable: {
        formula: 'AND($A3 = "Data Element",NOT(ISBLANK($L3)))',
        dynamicFormula: 'AND($A_ROWNUM_ = "Data Element",NOT(ISBLANK($L_ROWNUM_)))',
        prompt: 'Value Type inherited from Option Set.'
    },
    valueTypeNotDefined: {
        formula: 'AND(ISBLANK($J3),$A3 = "Data Element")',
        dynamicFormula: 'AND(ISBLANK($J_ROWNUM_),$A_ROWNUM_ = "Data Element")',
        prompt: 'Value Type not defined.'
    },
    incompleteParentLogic: {
        formula: 'OR(AND($O3<>"", $P3=""), AND($O3="", $P3<>""))',
        dynamicFormula: 'OR(AND($O_ROWNUM_<>"", $P_ROWNUM_=""), AND($O_ROWNUM_="", $P_ROWNUM_<>""))',
        prompt: 'Incomplete Parent Logic.'
    },
    selfParent: {
        formula: 'AND($B3<>"",$B3=$O3)',
        dynamicFormula: 'AND($B_ROWNUM_<>"",$B_ROWNUM_=$O_ROWNUM_)',
        prompt: 'The element is parent of itself.'
    }
}

export const HNQIS2_CONDITIONAL_FORMAT_VALIDATIONS = {
    parentNameNotDefined: {
        formula: 'AND(ISBLANK($A3),OR($B3="question",$B3="label"))',
        dynamicFormula: 'AND(ISBLANK($A_ROWNUM_),OR($B_ROWNUM_="question",$B_ROWNUM_="label"))',
        prompt: 'Parent Name not defined.'
    },
    formNameNotDefined: {
        formula: 'AND(ISBLANK($C3),NOT(ISBLANK($B3)))',
        dynamicFormula: 'AND(ISBLANK($C_ROWNUM_),NOT(ISBLANK($B_ROWNUM_)))',
        prompt: 'Form Name not defined.'
    },
    formNameOutOfRange: {
        formula: `AND(NOT(ISBLANK($B3)),OR(LEN($C3)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($C3)>${MAX_DATA_ELEMENT_NAME_LENGTH}))`,
        dynamicFormula: `AND(NOT(ISBLANK($B_ROWNUM_)),OR(LEN($C_ROWNUM_)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($C_ROWNUM_)>${MAX_DATA_ELEMENT_NAME_LENGTH}))`,
        prompt: `Form Name out of range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).`
    },
    valueTypeDisable: {
        formula: 'AND($B3 = "question",NOT(ISBLANK($G3)))',
        dynamicFormula: 'AND($B_ROWNUM_ = "question",NOT(ISBLANK($G_ROWNUM_)))',
        prompt: 'Value Type inherited from Option Set.'
    },
    scoreDisable: {
        formula: '$B3="score"',
        dynamicFormula: '$B_ROWNUM_="score"',
        prompt: 'Data Element configured as Score.'
    },
    labelDisable: {
        formula: '$B3="label"',
        dynamicFormula: '$B_ROWNUM_="label"',
        prompt: 'Data Element configured as Label.'
    },
    feedbackOrderNotDefined: {
        formula: 'OR(AND(OR(NOT(ISBLANK($I3)),NOT(ISBLANK($J3))), ISBLANK($K3)), AND($B3="score", ISBLANK($K3)))',
        dynamicFormula: 'OR(AND(OR(NOT(ISBLANK($I_ROWNUM_)),NOT(ISBLANK($J_ROWNUM_))), ISBLANK($K_ROWNUM_)), AND($B_ROWNUM_="score", ISBLANK($K_ROWNUM_)))',
        prompt: 'Feedback Order not defined.'
    },
    incompleteScoring: {
        formula: 'OR(AND($I3<>"",$J3=""), AND($I3="",$J3<>""))',
        dynamicFormula: 'OR(AND($I_ROWNUM_<>"",$J_ROWNUM_=""), AND($I_ROWNUM_="",$J_ROWNUM_<>""))',
        prompt: 'Incomplete Numerator or Denominator.'
    },
    incompleteParentLogic: {
        formula: 'OR(AND($L3<>"", $M3=""), AND($L3="", $M3<>""))',
        dynamicFormula: 'OR(AND($L_ROWNUM_<>"", $M_ROWNUM_=""), AND($L_ROWNUM_="", $M_ROWNUM_<>""))',
        prompt: 'Incomplete Parent Logic.'
    },
    selfParent: {
        formula: 'AND($A3<>"",$A3=$L3)',
        dynamicFormula: 'AND($A_ROWNUM_<>"",$A_ROWNUM_=$L_ROWNUM_)',
        prompt: 'The element is parent of itself.'
    }
}

export const getPromptsFormula = (validationsList, rowNumber) => {
    let formula = "CONCATENATE(";

    formula = formula + Object.keys(validationsList).map(teaValidation => {
        if (validationsList[teaValidation].dynamicFormula)
            return `IF(${validationsList[teaValidation].dynamicFormula
                .replaceAll('_ROWNUM_', rowNumber)}, "${validationsList[teaValidation].prompt} ", "")`
    }).join(',');

    formula = formula + ',"")';
    return formula;
}