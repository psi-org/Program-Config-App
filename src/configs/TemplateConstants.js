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

export const isTracker = (importType) => (importType === 'TRACKER');

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

export const HNQIS2_TEMPLATE_HEADERS = ['Parent Name', 'Structure', 'Form Name', 'Critical Step', 'Compulsory', 'Value Type', 'Option Set', 'Legend', 'Score Numerator', 'Score Denominator', 'Compositive Indicator (Feedback Order)', 'Parent Question', 'Answer Value', 'Feedback Text', 'Description', 'Program Stage Id', 'Program Section Id', 'Data Element Id'];
export const HNQIS2_TEMPLATE_VERSION_CELL = "D13";
export const HNQIS2_ORIGIN_SERVER_CELL = "D20";

export const TRACKER_TEMPLATE_HEADERS = ['Structure', 'Correlative', 'Use Auto Naming', 'Form Name', 'Full Name', 'Short Name', 'Code', 'Description', 'Compulsory', 'Value Type', 'Agg Operator', 'Option Set', 'Option Set Details', 'Legend Set', 'Parent Question', 'Answer Value', 'Stage ID', 'Stage Name', 'Program Stage Id', 'Program Section Id', 'Data Element Id'];
export const TRACKER_TEMPLATE_VERSION_CELL = "L2";
export const TRACKER_ORIGIN_SERVER_CELL = "D17";
export const TRACKER_PROGRAM_TYPE_CELL = "J23";

export const HNQIS2_VALUE_TYPES = ['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'INTEGER_ZERO_OR_POSITIVE', 'TEXT', 'LONG_TEXT', 'PERCENTAGE', 'DATE', 'TIME'];
export const HNQIS2_AGG_OPERATORS = ['NONE', 'SUM', 'AVERAGE', 'COUNT'];

export const RENDER_TYPES = ['DEFAULT', 'DROPDOWN', 'VERTICAL_RADIOBUTTONS', 'HORIZONTAL_RADIOBUTTONS', 'VERTICAL_CHECKBOXES', 'HORIZONTAL_CHECKBOXES', 'VALUE'];