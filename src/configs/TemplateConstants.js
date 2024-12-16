import { MAX_DATA_ELEMENT_NAME_LENGTH, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH, MAX_TRACKER_DATA_ELEMENT_NAME_LENGTH, MIN_DATA_ELEMENT_NAME_LENGTH } from "./Constants.js";

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

export const conditionalRowError = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'dc3545' } } , font: { bold: true,  italic: true, color: { argb: 'FFFFFF' } }};
export const conditionalError = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'dc3545' } } };
export const sectionHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'faa557' } } };
export const standardHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'f8c291' } } };
export const criterionHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'ffd8b5' } } };
export const questionHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'ffffff' } } };
export const labelHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'c6e0b4' } } };
export const otherHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: '99dcff' } } };
export const disabledHighlighting = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'b2bec3' } } };

export const validWorksheets = ['Instructions', 'Template', 'Release Notes', 'Mapping'];

export const structureValidator = ['"Section,label,question,score"'];
export const structureValidatorMWI = ['"Section,Standard,Std Overview,Criterion,question,label"'];
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
    feedbackOrder: "Feedback Order",
    parentQuestion: "Parent Question",
    parentValue: "Answer Value",
    feedbackText: "Feedback Text",
    description: "Description",
    programStage: "Program Stage Id",
    programSection: "Program Section Id",
    dataElementId: "Data Element Id",
    prompts: "Errors/Warnings/Info"
};

export const HNQIS2_HEADER_INSTRUCTIONS = {
    parent_name: `Indentifier to use as reference in the "Parent Question" column`,
    structure: `Defines what is being configured in the row`,
    form_name: `Text that will be displayed in the form during Data Entry`,
    isCritical: "A critical step will count for the Critical Score\n[Default is 'No']",
    isCompulsory: "A compulsory Question must be answered to complete an assessment\n[Default is 'No']",
    value_type: `Determines the type of input if there's no Option Set selected`,
    optionSet: `Select the Option Set that provides the available answers for this Question (forces Value Type)`,
    legend: "Select the Legend that will be applied to the Question",
    score_numerator: "Numerator for scores calculation",
    score_denominator: "Denominator for scores calculation",
    compositive_indicator: "This number will generate the feedback tree in the app, accepted values are:1, 1.1, 1.1.1, 1.1.2, 1.1..., 1.2, etc.",
    parent_question: "Select the Parent Name of the Question that will act as parent",
    answer_value: `Specify the value that will trigger the "show" rule of the Question`,
    feedback_text: `Text that will be displayed in the Feedback app for each Question`,
    description: `Enter the help text that will be displayed to the supervisor during data entry`,
    program_stage_id: "",
    program_section_id: "",
    data_element_id: "",
    prompts: "Details regarding the cell highlighting on each row."
};

//TODO: Remove unused columns in a future release
export const HNQISMWI_TEMPLATE_MAP = {
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
    feedbackOrder: "Feedback Order",
    parentQuestion: "Parent Question",
    parentValue: "Answer Value",
    feedbackText: "Feedback Text",
    description: "Description",
    programStage: "Program Stage Id",
    programSection: "Program Section Id",
    dataElementId: "Data Element Id",
    prompts: "Errors/Warnings/Info"
};

export const HNQISMWI_HEADER_INSTRUCTIONS = {
    parent_name: `Indentifier to use as reference in the "Parent Question" column`,
    structure: `Defines what is being configured in the row`,
    form_name: `Text that will be displayed in the form during Data Entry`,
    isCritical: "A critical step will count for the Critical Criteria\n[Default is 'No']",
    isCompulsory: "A compulsory Question must be answered to complete an assessment\n[Default is 'Yes']",
    value_type: `X`,
    optionSet: `Select the Option Set that provides the available answers for this Question (forces Value Type)`,
    legend: "Select the Legend that will be applied to the Question",
    score_numerator: "X",
    score_denominator: "X",
    compositive_indicator: "X",
    parent_question: "Select the Parent Name of the Question that will act as parent",
    answer_value: `Specify the value that will trigger the "show" rule of the Question`,
    feedback_text: `Text that will be displayed in the Feedback app for each Question`,
    description: `Enter the help text that will be displayed to the supervisor during data entry`,
    program_stage_id: "",
    program_section_id: "",
    data_element_id: "",
    prompts: "Details regarding the cell highlighting on each row."
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
    HNQIS2_TEMPLATE_MAP.dataElementId,
    HNQIS2_TEMPLATE_MAP.prompts
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
    hnqismwi: 'HNQISMWI',
    tracker: 'Tracker Program',
    event: 'Event Program'
};

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
};

export const TRACKER_STAGE_CONDITIONAL_FORMAT_VALIDATIONS = {
    correlativeNotDefined: {
        formula: 'AND(ISBLANK($B3),$A3="Data Element")',
        dynamicFormula: 'AND(ISBLANK($B_ROWNUM_),$A_ROWNUM_="Data Element")',
        prompt: 'Correlative not defined.'
    },
    formNameNotDefined: {
        formula: 'AND(ISBLANK($D3),NOT(ISBLANK($A3)),$C3="Yes")',
        dynamicFormula: 'AND(ISBLANK($D_ROWNUM_),NOT(ISBLANK($A_ROWNUM_)),$C_ROWNUM_="Yes")',
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
        formula: `AND(NOT(ISBLANK($A3)),NOT(ISBLANK($D3)),OR(LEN($D3)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($D3)>${MAX_FORM_NAME_LENGTH}))`,
        dynamicFormula: `AND(NOT(ISBLANK($A_ROWNUM_)),NOT(ISBLANK($D_ROWNUM_)),OR(LEN($D_ROWNUM_)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($D_ROWNUM_)>${MAX_FORM_NAME_LENGTH}))`,
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
        formula: 'AND(ISBLANK($J3),$A3 = "Data Element",ISBLANK($L3))',
        dynamicFormula: 'AND(ISBLANK($J_ROWNUM_),$A_ROWNUM_ = "Data Element",ISBLANK($L_ROWNUM_))',
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
    },
    parentNotFound: {
        formula: 'AND($A3 = "Data Element",NOT(ISNUMBER(MATCH($O3, B:B, 0))),$O3<>"")',
        dynamicFormula: 'AND($A_ROWNUM_ = "Data Element",NOT(ISNUMBER(MATCH($O_ROWNUM_, B:B, 0))),$O_ROWNUM_<>"")',
        prompt: 'Parent Data Element not found.'
    }
};

export const HNQIS2_CONDITIONAL_FORMAT_VALIDATIONS = {
    parentNameNotDefined: {
        formula: 'AND(ISBLANK($A3),OR($B3="question",$B3="label",$B3="Standard",$B3="Std Overview",$B3="Criterion"))',
        dynamicFormula: 'AND(ISBLANK($A_ROWNUM_),OR($B_ROWNUM_="question",$B_ROWNUM_="label",$B_ROWNUM_="Standard",$B_ROWNUM_="Std Overview",$B_ROWNUM_="Criterion"))',
        prompt: 'Parent Name not defined.'
    },
    formNameNotDefined: {
        formula: 'AND(ISBLANK($C3),NOT(ISBLANK($B3)))',
        dynamicFormula: 'AND(ISBLANK($C_ROWNUM_),NOT(ISBLANK($B_ROWNUM_)))',
        prompt: 'Form Name not defined.'
    },
    formNameOutOfRange: {
        formula: `AND(NOT(ISBLANK($B3)),$B3<>"Std Overview",OR(LEN($C3)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($C3)>${MAX_DATA_ELEMENT_NAME_LENGTH}))`,
        dynamicFormula: `AND(NOT(ISBLANK($B_ROWNUM_)),$B_ROWNUM_<>"Std Overview",OR(LEN($C_ROWNUM_)<${MIN_DATA_ELEMENT_NAME_LENGTH},LEN($C_ROWNUM_)>${MAX_DATA_ELEMENT_NAME_LENGTH}))`,
        prompt: `Form Name out of range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).`
    },
    valueTypeNotDefined: {
        formula: 'AND($B3 = "question",ISBLANK($G3),ISBLANK($F3))',
        dynamicFormula: 'AND($B_ROWNUM_ = "question",ISBLANK($G_ROWNUM_),ISBLANK($F_ROWNUM_))',
        prompt: 'Value Type not defined.'
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
        formula: 'OR(AND($B3="question", OR(NOT(ISBLANK($I3)),NOT(ISBLANK($J3))), ISBLANK($K3)), AND($B3="score", ISBLANK($K3)))',
        dynamicFormula: 'OR(AND($B_ROWNUM_="question", OR(NOT(ISBLANK($I_ROWNUM_)),NOT(ISBLANK($J_ROWNUM_))), ISBLANK($K_ROWNUM_)), AND($B_ROWNUM_="score", ISBLANK($K_ROWNUM_)))',
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
    },
    parentNotFound: {
        formula: 'AND(OR($B3 = "question",$B3 = "label"),NOT(ISNUMBER(MATCH($L3, A:A, 0))),$L3<>"")',
        dynamicFormula: 'AND(OR($B_ROWNUM_ = "question",$B_ROWNUM_ = "label"),NOT(ISNUMBER(MATCH($L_ROWNUM_, A:A, 0))),$L_ROWNUM_<>"")',
        prompt: 'Parent Question not found.'
    }
};


export const HNQISMWI_CONDITIONAL_FORMAT_VALIDATIONS = {
    sectionStandardRequired: {
        formula: 'AND($B3="Section", $B4<>"Standard")',
        dynamicFormula: 'AND($B_ROWNUM_="Section", INDIRECT("B" & (ROW() + 1))<>"Standard")',
        prompt: 'The next row must be Standard row.'
    },
    
    // ********* For checking "Standard" and "Std Overview" relationship *********
    // If the current row is "Standard", check if the NEXT row is not "Std Overview"
    standardStdOverviewRequired: {
        formula: 'AND($B3="Standard", $B4<>"Std Overview")',
        dynamicFormula: 'AND($B_ROWNUM_="Standard", INDIRECT("B" & (ROW() + 1))<>"Std Overview")',
        prompt: 'The next row must be Std Overview row.'
    },
    // If the current row is "Std Overview", check if the PREVIOUS row is not "Standard"
    stdOverviewStandardRequired: {
        formula: 'AND($B3="Std Overview",$B2<>"Standard")',
        dynamicFormula: 'AND($B_ROWNUM_="Std Overview", INDIRECT("B" & (ROW() - 1))<>"Standard")',
        prompt: 'The previous row must be Standard row.'
    },
    
    // ********* For checking "Std Overview" and "Criterion" relationship *********
    // IF the current row is "Std Overview", check if the NEXT row is not "Criterion"
    stdOverviewCriterionRequired: {
        formula: 'AND($B3="Std Overview", $B4<>"Criterion")',
        dynamicFormula: 'AND($B_ROWNUM_="Std Overview", INDIRECT("B" & (ROW() + 1))<>"Criterion")',
        prompt: 'The next row must be Criterion row.'
    },
    // IF the current row is "Criterion", check if the PREVIOUS row is not "Std Overview"
    criterionStdOverviewRequired: {
        formula: 'AND($B3="Criterion", $B2<>"Std Overview", $B2<>"question", $B2<>"label")',
        dynamicFormula: 'AND($B_ROWNUM_="Criterion", INDIRECT("B" & (ROW() - 1))<>"Std Overview", INDIRECT("B" & (ROW() - 1))<>"question", INDIRECT("B" & (ROW() - 1))<>"label")',
        prompt: 'The previous row must be Std Overview row.'
    },
    
    // ********* For checking "Std Overview" and "Criterion" relationship *********
    // IF the current row is "Criterion", check if the NEXT row is not "question"
    criterionQuestionRequired: {
        formula: 'AND($B3="Criterion", $B4<>"question")',
        dynamicFormula: 'AND($B_ROWNUM_="Criterion", INDIRECT("B" & (ROW() + 1))<>"question")',
        prompt: 'The next row must be a question row.'
    },
    // IF the current row is "question", check if the PREVIOUS row is not "Criterion"
    questionCriterionRequired: {
        formula: 'AND($B3="question", OR($B2="Section", $B2="Standard", $B2="Std Overview"))',
        dynamicFormula: 'AND($B_ROWNUM_="question", OR(INDIRECT("B" & (ROW() - 1))="Section", INDIRECT("B" & (ROW() - 1))="Standard", INDIRECT("B" & (ROW() - 1))="Std Overview"))',
        prompt: 'The previous row must be a Criterion row.'
    },
    
    // Check OptionSet field required
    optionSetNotDefined: {
        formula: 'AND(ISBLANK($G3),NOT(ISBLANK($B3)),$B3="question")',
        dynamicFormula: 'AND(ISBLANK($G_ROWNUM_),NOT(ISBLANK($B_ROWNUM_)),$B_ROWNUM_="question")',
        prompt: 'Option set is not defined.'
    }
}

export const getPromptsFormula = (validationsList, rowNumber) => {
    let formula = "CONCATENATE(";

    formula = formula + Object.keys(validationsList).map(teaValidation => {
        if (validationsList[teaValidation].dynamicFormula) {
            return `IF(${validationsList[teaValidation].dynamicFormula
                .replaceAll('_ROWNUM_', rowNumber)}, "${validationsList[teaValidation].prompt} ", "")`
        }
    }).join(',');

    formula = formula + ',"")';
    
    return formula;
}