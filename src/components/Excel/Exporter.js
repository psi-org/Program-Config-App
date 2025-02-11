import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { ReleaseNotes } from "../../configs/ReleaseNotes.js";
import {
    HNQIS2_AGG_OPERATORS,
    conditionalError,
    disabledHighlighting,
    labelHighlighting,
    middleCenter,
    questionHighlighting,
    RENDER_TYPES,
    sectionHighlighting,
    structureValidator,
    TEMPLATE_PASSWORD,
    HNQIS2_VALUE_TYPES,
    verticalMiddle,
    yesNoValidator,
    HNQIS2_CONDITIONAL_FORMAT_VALIDATIONS,
    HNQISMWI_CONDITIONAL_FORMAT_VALIDATIONS,
    getPromptsFormula,
    structureValidatorMWI,
    standardHighlighting,
    criterionHighlighting,
    HNQIS2_HEADER_INSTRUCTIONS,
    HNQISMWI_HEADER_INSTRUCTIONS
} from "../../configs/TemplateConstants.js";
import {
    addCreator,
    addProtection,
    addReleaseNotes,
    applyBorderToRange,
    applyStyleToRange,
    buildCellObject,
    dataValidation,
    defineName,
    enableCellEditing,
    fillBackgroundToRange,
    hideColumns,
    printArray2Column,
    printObjectArray,
    writeWorkbook
} from "../../utils/ExcelUtils.js";
import { deepMerge } from '../../utils/Utils.js';

const Exporter = (props) => {

    const password = TEMPLATE_PASSWORD;

    const generate = () => {
        const workbook = new ExcelJS.Workbook();
        addCreator(workbook);
        const instructionWS = workbook.addWorksheet("Instructions", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: '0070C0' } }
        }
        );
        instructionWS.properties.defaultColWidth = 30;
        instructionWS.properties.defaultRowHeight = 20;
        instructionWS.properties.alignment = verticalMiddle;
        const templateWS = workbook.addWorksheet("Template", {
            views: [{
                showGridLines: false,
                state: 'frozen',
                xSplit: 3,
                ySplit: 2
            }],
            properties: { tabColor: { argb: 'D1F1DA' } }
        });
        const releaseNotesWS = workbook.addWorksheet("Release Notes", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: 'D9E7FD' } }
        });
        const mappingWS = workbook.addWorksheet("Mapping", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: 'FBDAD7' } }
        });
        workbook.views = [{
            activeTab: 1
        }];
        addMapping(mappingWS);
        addInstructions(instructionWS);
        addConfigurations(templateWS);
        addReleaseNotes(releaseNotesWS, ReleaseNotes, password);
        hideColumns(templateWS, getHiddenColumns());
        addProtection(templateWS,3,3000,password);
        writeWorkbook(workbook, props.programName, props.isLoading);
    };

    const isHNQISMWI = () => {
        return ( props.hnqisType === "HNQISMWI" );
    }
    
    const getHiddenColumns = () => {
        const hideColumnNames = ['program_stage_id', 'program_section_id', 'data_element_id'];
        // Extract keys with value as "X"
        const templateHeader = isHNQISMWI() ? HNQISMWI_HEADER_INSTRUCTIONS : HNQIS2_HEADER_INSTRUCTIONS;
            
        const keysWithX = Object.keys(templateHeader).filter(
            key => templateHeader[key] === "X"
        );

        return keysWithX.concat(hideColumnNames);
    }
    
    const addInstructions = async (ws) => {
        let editingCell;

        ws.getColumn("A").width = 5;

        editingCell = buildCellObject(ws, "A1");
        editingCell.cell.value = "I";
        editingCell.cell.style = { font: { color: { argb: 'FFFFFFFF' } } };

        editingCell = buildCellObject(ws, "B2");
        editingCell.cell.value = "HNQIS 2.0 CONFIGURATION TEMPLATE";
        editingCell.cell.style = { font: { size: 12, bold: true } };
        ws.getCell("B4").value = "By using this Template, you will be able to configure the structure of the HNQIS2 checklist. Before you continue working, make sure you understand how to work with the tools integrated into this spreadsheet.";
        ws.getCell("B5").value = `You're currently working with version ${ReleaseNotes.at(-1).version} of this Template, please refer to the 'Release Notes' tab to check the latest features.`;

        editingCell = buildCellObject(ws, "B7:H7");
        editingCell.merge();
        editingCell.cell.value = "Configurations";
        editingCell.cell.style = { font: { size: 12, bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "6fa8dc");
        ws.getCell("B8").value = "The following settings will be used to configure the checklist as HNQIS 2.0 compatible Tracker Program";
        ws.getCell("B9").value = "Please Note: Some fields are filled automatically when the template is downloaded from the server.";

        editingCell = buildCellObject(ws, "B11:C11");
        editingCell.merge();
        editingCell.cell.value = "PROGRAM DETAILS";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;
        fillBackgroundToRange(ws, editingCell.ref, "6fa8dc");
        ws.getCell("B12").value = "Program Name";
        ws.getCell("B13").value = "Program Short Name";
        ws.getCell("B14").value = "Use 'Competency Class'";
        ws.getCell("B15").value = "Program DE Prefix";
        ws.getCell("B16").value = "Health Area";
        applyStyleToRange(ws, 'B12:B16', { font: { bold: true } });
        fillBackgroundToRange(ws, "B12:B16", "9fc5e8");

        editingCell = buildCellObject(ws, "B17");
        editingCell.cell.value = "*All the fields are required";
        editingCell.cell.style = { font: { color: { 'argb': 'ff0000' } } }
        ws.getCell("B18").value = "These settings will not affect this Template's behavior; however, they will update the Program configurations in the DHIS2 Server."
        ws.getRow("18").height = 20;

        editingCell = buildCellObject(ws, "D12");
        editingCell.cell.value = { formula: "=VLOOKUP(C12, Program_Data,2,FALSE)" };
        editingCell.cell.style = { font: { color: { 'argb': 'ffffff' } } }
        ws.getCell("C12").value = props.programName;
        ws.getCell("C13").value = props.programShortName;
        ws.getCell("C14").value = props.useCompetencyClass;
        ws.getCell("C15").value = props.programPrefix;
        const healthAreaFound = props.healthAreaData.find(ha => ha["code"] == props.programHealthArea);
        ws.getCell("C16").value = healthAreaFound ? healthAreaFound["Health Area"] : "Family Planning";
        editingCell = buildCellObject(ws, "D13");
        editingCell.cell.value = ReleaseNotes.at(-1).version;
        editingCell.cell.style = { font: { color: { argb: 'FFFFFFFF' } } };
        editingCell = buildCellObject(ws, "D14:D16");
        editingCell.merge();
        editingCell.cell.value = props.hnqisType;
        editingCell.cell.style = { font: { color: { argb: 'FFFFFFFF' } } };
        fillBackgroundToRange(ws, "C12:C16", "cfe2f3");

        applyBorderToRange(ws, 1, 11, 2, 16);

        editingCell = buildCellObject(ws, "F11:H11");
        editingCell.merge();
        editingCell.cell.value = "HELP";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "bfbfbf");
        editingCell = buildCellObject(ws, "F12:H12");
        editingCell.merge();
        editingCell.cell.value = "Program Name: The Name of the Program (Checklist).";
        editingCell = buildCellObject(ws, "F13:H13");
        editingCell.merge();
        editingCell.cell.value = "Program Short Name: The Short Name property of the Program (Checklist).";
        editingCell = buildCellObject(ws, "F14:H14");
        editingCell.merge();
        editingCell.cell.value = "Use 'Competency Class': This will determine if competency classes will be included in the Program.";
        editingCell = buildCellObject(ws, "F15:H15");
        editingCell.merge();
        editingCell.cell.value = "DE Prefix: Prefix that will be added to every Data Element contained in the Checklist. Must be unique.";
        editingCell = buildCellObject(ws, "F16:H16");
        editingCell.merge();
        editingCell.cell.value = "Health Area: The Health Area assigned to the Checklist, used for filtering.";

        fillBackgroundToRange(ws, "F12:H16", "f2f2f2");
        applyBorderToRange(ws, 5, 11, 7, 16);

        //ws.getCell("D15").style = {font: {color: {'argb': 'ffffff'}}};

        editingCell = buildCellObject(ws, "B20:B21");
        editingCell.merge();
        editingCell.cell.value = "SERVER DETAILS";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter
        fillBackgroundToRange(ws, editingCell.ref, "6fa8dc");

        editingCell = buildCellObject(ws, "C20");
        editingCell.cell.value = "DHSI2 Server URL";
        editingCell.cell.style = { font: { bold: true } };
        editingCell = buildCellObject(ws, "D20");
        editingCell.cell.value = location.origin;

        editingCell = buildCellObject(ws, "C21");
        editingCell.cell.value = "DHSI2 Server Version";
        editingCell.cell.style = { font: { bold: true } };
        editingCell = buildCellObject(ws, "D21");
        editingCell.cell.value = localStorage.getItem('SERVER_VERSION');
        applyBorderToRange(ws, 1, 20, 3, 21);

        fillBackgroundToRange(ws, "C20:C21", "cfe2f3");

        editingCell = buildCellObject(ws, "F20:H21");
        editingCell.merge();
        editingCell.cell.value = "Please note: This Template can only be imported to the same server from which it was downloaded. Do NOT use this template to transfer the current Program to another server.";
        editingCell.cell.style = { font: { bold: true, color: { 'argb': 'ff0000' } } };
        editingCell.cell.alignment = middleCenter
        applyBorderToRange(ws, 5, 20, 7, 21);

        editingCell = buildCellObject(ws, "B23:H23");
        editingCell.cell.value = "How to work with this Template";
        editingCell.cell.style = { font: { size: 12, bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "6fa8dc");
        ws.getCell("B24").value = "Most of the configurations are performed in the \"Template\" tab, which contains several columns described below:";

        editingCell = buildCellObject(ws, "B26");
        editingCell.cell.value = "Parent Name";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C26:F26");
        editingCell.merge();
        editingCell.cell.value = `[Question & Label Only] \n Identifier to use as reference in the 'Parent Question' column. This field is generated automatically when certain conditions are met. \n Parent Names follow the structure "_S#Q#" where the S means "Section" followed by the number of the section (1 for the first one, 2 for the second one, and so on...) and Q means "Question" followed by the number of the Question in the Section (in the same way as the Sections, but restarting the numbers on each Section).`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("26").height = 85;

        editingCell = buildCellObject(ws, "B27");
        editingCell.cell.value = "Structure";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C27:F27");
        editingCell.merge();
        editingCell.cell.value = `Determines what is being configured in the row. The value in this column will define which validations are applied to the row. \nThe available structure values are: \n Section - Defines a section in the assessment, all the rows under it will create Data Elements contained in the section until another "Section" row is defined. \n Question - Defines a Question Data Element that can be answered in some way (text field, numeric field, option set, etc.). \n Label - Defines a Label Data Element, commonly used to display instructions or helper text. \n Score - Defines a Score Data Element that will contain the value of the score calculations.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("27").height = 115;

        editingCell = buildCellObject(ws, "B28");
        editingCell.cell.value = "Form Name";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C28:F28");
        editingCell.merge();
        editingCell.cell.value = `Text that will be displayed with each Question in the form during the assessment. This is what the user will see while completing the Assessment.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("28").height = 32;

        fillBackgroundToRange(ws, 'B26:B28', "efefef");

        editingCell = buildCellObject(ws, "B29");
        editingCell.cell.value = "Critical Step\n";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C29:F29");
        editingCell.merge();
        editingCell.cell.value = `[Question Only] \n Scores are divided in Critical and Non-Critical, this is mostly used for the 'Competency Classification' but can also be used in other types of classification in analytics as well. A Critical Step will count for the Critical Score. The default value is 'No'.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("29").height = 48;

        editingCell = buildCellObject(ws, "B30");
        editingCell.cell.value = "Compulsory";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C30:F30");
        editingCell.merge();
        editingCell.cell.value = `[Question Only] \n A Compulsory Question must be answered to complete an assessment. The default value is 'No'.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("30").height = 32;

        fillBackgroundToRange(ws, 'B29:B30', "f4cccc");

        editingCell = buildCellObject(ws, "B31");
        editingCell.cell.value = "Value Type";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C31:F31");
        editingCell.merge();
        editingCell.cell.value = `[Question, Label & Score] \n Determines the type of input if there is no Option Set selected. If there is an Option Set selected, the "Value Type" cell will be ignored.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("31").height = 48;

        editingCell = buildCellObject(ws, "B32");
        editingCell.cell.value = "Option Set";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C32:F32");
        editingCell.merge();
        editingCell.cell.value = `[Question Only] \n Select the Option Set that provides available answers for this question (forces Value Type)`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("32").height = 32;

        editingCell = buildCellObject(ws, "B33");
        editingCell.cell.value = "Legend";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C33:F33");
        editingCell.merge();
        editingCell.cell.value = `[Question Only] \n Select the Legend that will be applied to the question. The Legend will be displayed in the data entry form and in the Feedback Module of the PSI Capture App.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("33").height = 48;

        fillBackgroundToRange(ws, 'B31:B33', "d9ead3");

        editingCell = buildCellObject(ws, "B34");
        editingCell.cell.value = "Score Numerator";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C34:F34");
        editingCell.merge();
        editingCell.cell.value = `[Question Only]\n Numerator for score calculations. This value will be used in the formulas that calculate scores. Each Numerator will contribute to the score calculation formulas.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("34").height = 48;

        editingCell = buildCellObject(ws, "B35");
        editingCell.cell.value = "Score Denominator";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C35:F35");
        editingCell.merge();
        editingCell.cell.value = `[Question Only] \n Denominator for score calculations. This value will be used in the formulas that calculate scores. Each Denominator will contribute to the score calculation formulas.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("35").height = 48;

        editingCell = buildCellObject(ws, "B36");
        editingCell.cell.value = "Compositive Indicator (Feedback Order)";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C36:F36");
        editingCell.merge();
        editingCell.cell.value = `[Question, Label & Score] \n This number will define the feedback hierarchy in the app, while also grouping the scores to calculate the Compositive Scores. \n Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc. There cannot exist gaps in the Compositive Indicators, for example: \n Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.  \n This limitation applies in the same level of the compositive indicator (Levels being level1.level2.level3.(...).levelN), meaning that the previous error (1.3) was located in level 2 (value 3) of the Compositive Indicator of value 1. \n Questions are not required to be in the same Section to affect to the same level of the Compositive Indicator, for example: \n Having [ 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 1.4 ] is a valid configuration as there are no gaps in the same level of the Compositive Indicator.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("36").height = 126;

        fillBackgroundToRange(ws, 'B34:B36', "fff2cc");

        editingCell = buildCellObject(ws, "B37");
        editingCell.cell.value = "Parent Question";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C37:F37");
        editingCell.merge();
        editingCell.cell.value = `[Question & Label Only] \n Select the "Parent Name" of the Question that will act as Parent of the Question/Label defined in the row. Essentially, the Data Element defined in the row won't be displayed in the data entry form until a certain condition applies to the selected Parent.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("37").height = 48;

        editingCell = buildCellObject(ws, "B38");
        editingCell.cell.value = "Answer Value";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C38:F38");
        editingCell.merge();
        editingCell.cell.value = `[Question & Label Only] \n Specify the value that will trigger the "show" rule of the Question/Label defined in the row. \n The condition that will be evaluated is: [Parent question] == [Answer value]. If it matches, the Question/Label defined in the row will be displayed in the data entry form.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("38").height = 60;

        fillBackgroundToRange(ws, 'B37:B38', "c9daf8");

        editingCell = buildCellObject(ws, "B39");
        editingCell.cell.value = "Feedback Text";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C39:F39");
        editingCell.merge();
        editingCell.cell.value = `[Question & Label Only]\n Text that will be displayed in the Feedback Module for each Question.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("39").height = 32;

        editingCell = buildCellObject(ws, "B40");
        editingCell.cell.value = "Description";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C40:F40");
        editingCell.merge();
        editingCell.cell.value = `Enter the helper text that will be displayed to the supervisor during data entry. This text will appear as an ( i ) icon in the data entry form.`;
        editingCell.cell.alignment = verticalMiddle;
        ws.getRow("40").height = 32;

        applyBorderToRange(ws, 1, 26, 2, 40);

        ws.getCell("B42").value = `Every row in the 'Template' Tab starting from row 3 will generate the necessary components for the program when this file gets imported to the server. `;
        ws.getCell("B43").value = `The template will highlight in red some cells automatically while you are working on it, this means that there is a validation error in that cell and you must fix it before importing.`;
        ws.getCell("B44").value = `Also, keep in mind that this file is protected so you can only modify some specific cell ranges (most of the unlocked cells are in the 'Template' Tab).`;


        editingCell = buildCellObject(ws, "B46:H46");
        editingCell.merge();
        editingCell.cell.value = "Excel Validations";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "6fa8dc");

        ws.getCell("B48").value = "Worksheet";
        ws.getCell("C48").value = "Column / Cell";
        ws.getCell("D48").value = "Validation Type";
        ws.getCell("E48").value = "Rule & Messages";
        fillBackgroundToRange(ws, 'B48:E48', "cfe2f3");

        editingCell = buildCellObject(ws, "B49:B53");
        editingCell.merge();
        editingCell.cell.value = "Instructions Tab";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C49:C50");
        editingCell.merge();
        editingCell.cell.value = "Program Name";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D49");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D50");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E49");
        editingCell.cell.value = "'=Instructions!C12' cell will be highlighted in red.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E50");
        editingCell.cell.value = "A Dialog Box will show up with the proper message.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C51");
        editingCell.cell.value = "Prefix";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D51");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E51");
        editingCell.cell.value = "A Dialog Box will show up with the proper message.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C52");
        editingCell.cell.value = "Competency Class";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D52");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E52");
        editingCell.cell.value = "Only 'Yes' or 'No' can be selected. A Dialog Box will be displayed when invalid data is provided.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C53");
        editingCell.cell.value = "Health Area";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D53");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E53");
        editingCell.cell.value = "If the provided value does not match any of the available options, a Dialog Box will be displayed";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "B54:B62");
        editingCell.merge();
        editingCell.cell.value = "Template Tab";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C54");
        editingCell.cell.value = "'Structure' column";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D54");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E54");
        editingCell.cell.value = "Either 'Section', 'question', 'label', or 'score' can be selected. A Dialogbox will show to select the proper valid option from the list.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C55");
        editingCell.cell.value = "'Critical Step' and 'Compulsory' columns";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D55");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E55");
        editingCell.cell.value = "Only 'Yes' or 'No' can be selected. A Dialog Box will be displayed when invalid data is provided.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C56");
        editingCell.cell.value = "'Value Type',\n 'Option Set' and\n 'Legend' columns";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D56");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E56");
        editingCell.cell.value = "Only the available options are accepted as input.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C57");
        editingCell.cell.value = "'Score Numerator' and 'Score Denominator' columns";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D57");
        editingCell.cell.value = "Data Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E57");
        editingCell.cell.value = "Value must be numeric and greater than 0.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C58");
        editingCell.cell.value = "'Form Name' column";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D58");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E58");
        editingCell.cell.value = "The cell will be highlighted in red if the corresponding Structure is present but the Form Name is empty.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C59:C60");
        editingCell.merge();
        editingCell.cell.value = "'Feedback Order' column";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D59");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E59");
        editingCell.cell.value = "If the 'Structure' is 'score', a Compositive Indicator must be provided.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D60");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E60");
        editingCell.cell.value = "If either 'Numerator' or 'Denominator' is present, the 'Feedback Order' should be provided; otherwise, the corresponding cell will be highlighted in red.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C61");
        editingCell.cell.value = "'Score Numerator' and 'Score Denominator' columns";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D61");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E61");
        editingCell.cell.value = "If any of the scores is present and the other one is missing, the missing score will be highlighted in red.";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "C62");
        editingCell.cell.value = "'Parent Question' and 'Answer Value' columns";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "D62");
        editingCell.cell.value = "Conditional Validation";
        editingCell.cell.alignment = verticalMiddle;

        editingCell = buildCellObject(ws, "E62");
        editingCell.cell.value = "If the Parent Question is defined, the Answer Value must be defined as well (and vice versa). The missing value will be highlighted in red.";
        editingCell.cell.alignment = verticalMiddle;

        ws.getCell("B64").value = `Please ensure the Template content is clean. Everything will appear in the Program just as it is submitted to the server. The developers will not correct any spelling mistakes or spacing errors. `;

        ws.getCell("B66").value = `Once you are done with the configurations, proceed by uploading this template to the Program Configuration App to the same server where it was downloaded from to process it.`;
        ws.getCell("B67").value = `After uploading, please check that the content is correct by using the PCA Preview feature, then proceed to save the changes.`;

        ws.getCell("B69").value = `Now we are done!`;
        ws.getCell("B69").style = { font: { bold: true } };

        ws.getCell("B70").value = `Test your configurations on both the Web Tracker Capture and the Android Capture App.`;
        ws.getCell("B71").value = `If necessary, download the Template again to make further changes.`;
        ws.getCell("B72").value = `Remember that once uploaded, you can download a copy of this template from the server.`;

        applyBorderToRange(ws, 1, 48, 4, 62);
        instructionValidations(ws);
        enableCellEditing(ws, ['C12', 'D12', 'C13', 'C14', 'C15', 'C16']);
        await ws.protect(password);
    };

    const instructionValidations = (ws) => {
        ws.addConditionalFormatting({
            ref: '$C$12',
            rules: [
                {
                    type: 'expression',
                    formulae: ['ISERROR(D12)'],
                    style: conditionalError,
                }
            ]
        });
        dataValidation(ws, "C12", {
            type: 'textLength',
            operator: 'lessThan',
            showErrorMessage: true,
            error: 'Program name exceeds 225 characters',
            errorTitle: 'Invalid Length',
            allowBlank: true,
            formulae: [226]
        });
        dataValidation(ws, "C15", {
            type: 'textLength',
            operator: 'lessThan',
            showErrorMessage: true,
            error: 'DE Prefix exceeds 25 characters',
            errorTitle: 'Invalid Length',
            allowBlank: true,
            formulae: [26]
        });
        dataValidation(ws, "C14", {
            type: 'list',
            allowBlank: true,
            showErrorMessage: true,
            error: 'Please select the valid option from the List',
            errorTitle: 'Invalid option',
            formulae: yesNoValidator
        });
        dataValidation(ws, "C16", {
            type: 'list',
            allowBlank: true,
            showErrorMessage: true,
            error: 'Please select the valid option from the List',
            errorTitle: 'Invalid option',
            formulae: ['Health_Area_Option']
        });
    }

    const addConfigurations = ws => {
        ws.columns = [{
            header: "Parent Name",
            key: "parent_name",
            width: 15
        }, {
            header: "Structure",
            key: "structure",
            width: 15
        }, {
            header: "Form Name",
            key: "form_name",
            width: 55
        }, {
            header: "Critical Step",
            key: "isCritical",
            width: 16
        }, {
            header: "Compulsory",
            key: "isCompulsory",
            width: 16
        }, {
            header: "Value Type",
            key: "value_type",
            width: 15
        }, {
            header: "Option Set",
            key: "optionSet",
            width: 20
        }, {
            header: "Legend",
            key: "legend",
            width: 20
        }, {
            header: "Score Numerator",
            key: "score_numerator",
            width: 13
        }, {
            header: "Score Denominator",
            key: "score_denominator",
            width: 13
        }, {
            header: "Feedback Order",
            key: "compositive_indicator",
            width: 22,
            style: { numFmt: '@' }
        }, {
            header: "Parent Question",
            key: "parent_question",
            width: 19
        }, {
            header: "Answer Value",
            key: "answer_value",
            width: 19
        }, {
            header: "Feedback Text",
            key: "feedback_text",
            width: 40
        }, {
            header: "Description",
            key: "description",
            width: 40
        }, {
            header: "Program Stage Id",
            key: "program_stage_id",
            width: 1
        }, {
            header: "Program Section Id",
            key: "program_section_id",
            width: 1
        }, {
            header: "Data Element Id",
            key: "data_element_id",
            width: 1
        },{
            header: "Errors/Warnings/Info",
            key: "prompts",
            width: 50
        }];
        fillBackgroundToRange(ws, "A1:C1", "efefef");
        fillBackgroundToRange(ws, "D1:E1", "f4cccc");
        fillBackgroundToRange(ws, "F1:H1", "d9ead3");
        fillBackgroundToRange(ws, "I1:K1", "fff2cc");
        fillBackgroundToRange(ws, "L1:M1", "c9daf8");
        ws.getRow(1).height = 35;
        ws.getRow(1).alignment = middleCenter;
        ws.getRow(2).values = isHNQISMWI()
            ? HNQISMWI_HEADER_INSTRUCTIONS
            : HNQIS2_HEADER_INSTRUCTIONS;

        ws.getCell("A2").note = {
            texts: [{ text: "If the Parent Name is not automatically generated for questions, then drag the formula from another cell in the same column." }],
            margins: {
                insetmode: 'custom',
                inset: [0.25, 0.25, 0.35, 0.35]
            },
            protection: {
                locked: true,
                lockText: true
            },
        }

        ws.getCell("S2").note = {
            texts: [{ text: "If prompts are not displayed when cells in a row are highlighted in red, then drag the formula from another cell in the same column." }],
            margins: {
                insetmode: 'custom',
                inset: [0.25, 0.25, 0.35, 0.35]
            },
            protection: {
                locked: true,
                lockText: true
            },
        };

        ws.getRow(2).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "D9D9D9"
            }
        };
        ws.getRow(2).height = 100;
        ws.getRow(2).alignment = middleCenter;
        applyBorderToRange(ws, 0, 0, 18, 2);
        addValidation(ws);
        addConditionalFormatting(ws);
        populateConfiguration(ws);
    };
    
    const addValidation = (ws) => {
        dataValidation(ws, "B3:B3000", {
            type: 'list',
            allowBlank: false,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: isHNQISMWI() ? structureValidatorMWI : structureValidator
        });
        dataValidation(ws, "D3:D3000", {
            type: 'list',
            allowBlank: true,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: yesNoValidator
        });
        dataValidation(ws, "E3:E3000", {
            type: 'list',
            allowBlank: true,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: yesNoValidator
        });
        
        // For "Value Type" column
        dataValidation(ws, "F3:F3000", {
            type: 'list',
            allowBlank: true,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: ['Value_Type']
        });
        
        // For Malawi
        let allowOptionSetToBlank = true;
        if( isHNQISMWI() ) {
            // Not allow Option set as blank
            allowOptionSetToBlank = false;
        }
        // Add validation for "Option Set"
        dataValidation(ws, "G3:G3000", {
            type: 'list',
            allowBlank: allowOptionSetToBlank,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: ['Option_Sets_option']
        });
        
        dataValidation(ws, "H3:H3000", {
            type: 'list',
            allowBlank: true,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: ['Legend_Set_Option']
        });
        dataValidation(ws, "I3:J3000", {
            type: "decimal",
            showInputMessage: true,
            promptTitle: 'Decimal',
            prompt: 'Value is not numeric'
        });
        dataValidation(ws, "I3:J3000", {
            type: 'decimal',
            operator: 'greaterThan',
            showErrorMessage: true,
            allowBlank: true,
            formulae: [0],
            error: 'The numerator or denominator for the specified question have to be greater that zero',
            errorTitle: 'Invalid score',
        });
    }

    const getConditionalFormatting = () => {
        let validationsList = [];
        if( isHNQISMWI() ) {
            validationsList = deepMerge(HNQIS2_CONDITIONAL_FORMAT_VALIDATIONS, HNQISMWI_CONDITIONAL_FORMAT_VALIDATIONS);
            
            const hiddenColumns = getHiddenColumns();
            if( hiddenColumns.indexOf("value_type") >= 0 ) {
                delete validationsList.valueTypeNotDefined;
            }
            if( hiddenColumns.indexOf("score_numerator") >= 0 || hiddenColumns.indexOf("score_denominator") >= 0 ) {
                delete validationsList.incompleteScoring;
            }
            
            console.log(validationsList);
        }
        else {
            validationsList = HNQIS2_CONDITIONAL_FORMAT_VALIDATIONS;
        }
        
        return validationsList;
    }
    
    const addConditionalFormatting = (ws) => {
        const validationsList = getConditionalFormatting();
        
        const hiddenColumns = getHiddenColumns();
        
        
        if( isHNQISMWI() ) {
            //Highlight when Parent Name is not defined for Questions and Labels
            ws.addConditionalFormatting({
                ref: 'B3:B3000',
                rules: [
                    {
                        type: 'expression',
                        formulae: [validationsList.sectionStandardRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.standardSectionRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.standardStdOverviewRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.stdOverviewStandardRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.stdOverviewCriterionRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.criterionStdOverviewRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.criterionQuestionRequired.formula],
                        style: conditionalError,
                    },
                    {
                        type: 'expression',
                        formulae: [validationsList.questionCriterionRequired.formula],
                        style: conditionalError,
                    }
                ]
            });
            
            ws.addConditionalFormatting({
                ref: 'B3:B3',
                rules: [
                    {
                        type: 'expression',
                        formulae: ['COUNTIF(B:B, "Section") = 0'],
                        style: conditionalError,
                    }
                ]
            });
        }
        

        //Highlight when Parent Name is not defined for Questions and Labels
        ws.addConditionalFormatting({
            ref: 'A3:A3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.parentNameNotDefined.formula],
                    style: conditionalError,
                }
            ]
        });
        //Highlight when the Form Name is not defined and a Structure is selected
        ws.addConditionalFormatting({
            ref: 'C3:C3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.formNameNotDefined.formula],
                    style: conditionalError,
                }
            ]
        });
        //Form name out of range
        ws.addConditionalFormatting({
            ref: 'C3:C3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.formNameOutOfRange.formula],
                    style: conditionalError,
                }
            ]
        });
        
        // If the ""Value Type" column is hidden, then the optoon set values columns are set "required" for 'question'
        if( hiddenColumns.indexOf("value_type") >= 0 ) {
            ws.addConditionalFormatting({
                ref: 'G3:G3000',
                rules: [
                    {
                        type: 'expression',
                        formulae: [validationsList.optionSetNotDefined.formula],
                        style: conditionalError,
                    }
                ]
            });
        }
        else {
            //Value type not defined
            ws.addConditionalFormatting({
                ref: 'F3:F3000',
                rules: [
                    {
                        type: 'expression',
                        formulae: [validationsList.valueTypeNotDefined.formula],
                        style: conditionalError,
                    }
                ]
            });
        }
       
        //Disable Value Type when Option Set is selected
        ws.addConditionalFormatting({
            ref: 'F3:F3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.valueTypeDisable.formula],
                    style: disabledHighlighting
                }
            ]
        });
        //conditional formatting for structure=label
        ws.addConditionalFormatting({
            ref: 'D3:J3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.labelDisable.formula],
                    style: disabledHighlighting
                }
            ]
        });
        //conditional formatting for structure=score (1)
        ws.addConditionalFormatting({
            ref: 'A3:A3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.scoreDisable.formula],
                    style: disabledHighlighting
                }
            ]
        });
        //conditional formatting for structure=score (2)
        ws.addConditionalFormatting({
            ref: 'D3:J3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.scoreDisable.formula],
                    style: disabledHighlighting
                }
            ]
        });
        //conditional formatting for structure=score (3)
        ws.addConditionalFormatting({
            ref: 'L3:O3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.scoreDisable.formula],
                    style: disabledHighlighting
                }
            ]
        });
        //conditional formatting for structure=scores and compositive indicator is empty
        //or
        //conditional formatting checking Feedback order if either score (numerator or denominator is available)
        ws.addConditionalFormatting({
            ref: 'K3:K3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.feedbackOrderNotDefined.formula],
                    style: conditionalError
                }
            ]
        });
        
        if( hiddenColumns.indexOf("score_numerator") < 0 &&  hiddenColumns.indexOf("score_denominator") < 0 ) {
            //Conditional formatting checking incomplete scoring
            ws.addConditionalFormatting({
                ref: 'I3:J3000',
                rules: [
                    {
                        type: 'expression',
                        formulae: [validationsList.incompleteScoring.formula],
                        style: conditionalError
                    }
                ]
            });
        }
        //Conditional formatting checking incomplete parent and answer
        ws.addConditionalFormatting({
            ref: 'L3:M3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.incompleteParentLogic.formula],
                    style: conditionalError
                }
            ]
        })
        //Parent question is the same as the Parent Name of the current Question
        ws.addConditionalFormatting({
            ref: 'L3:L3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.selfParent.formula],
                    style: conditionalError,
                }
            ]
        });
        //Parent question is not found
        ws.addConditionalFormatting({
            ref: 'L3:L3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [validationsList.parentNotFound.formula],
                    style: conditionalError,
                }
            ]
        });

        //Row highlighting for Sections, Questions and Labels
        ws.addConditionalFormatting({
            ref: 'A3:R3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['$B3 = "Section"'],
                    style: sectionHighlighting
                },
                {
                    type: 'expression',
                    formulae: ['OR($B3 = "Standard",$B3 = "Std Overview")'],
                    style: standardHighlighting
                },
                {
                    type: 'expression',
                    formulae: ['$B3 = "Criterion"'],
                    style: criterionHighlighting
                },
                {
                    type: 'expression',
                    formulae: ['$B3 = "question"'],
                    style: questionHighlighting
                },
                {
                    type: 'expression',
                    formulae: ['$B3 = "label"'],
                    style: labelHighlighting
                }
            ]
        });
        
    }

    const populateConfiguration = async ws => {
        let dataRow = 3;
        if (props.Configures.length > 0) {
            const conditionList = getConditionalFormatting();
            
            props.Configures.forEach((configure) => {
                configure.prompts = {
                    formula: `=${getPromptsFormula(conditionList, dataRow)}`
                }
                ws.getRow(dataRow).values = configure;
                ws.getCell("A" + dataRow).value = {
                    formula: props.hnqisType === "HNQISMWI"
                        ? '_xlfn.IF(_xlfn.OR(_xlfn.AND(_xlfn.INDIRECT(_xlfn.CONCAT("B",_xlfn.ROW()))<>"question",_xlfn.INDIRECT(_xlfn.CONCAT("B",_xlfn.ROW()))<>"label",_xlfn.INDIRECT(_xlfn.CONCAT("B",_xlfn.ROW()))<>"Std Overview"),_xlfn.ISBLANK(_xlfn.INDIRECT(_xlfn.CONCAT("B",_xlfn.ROW())))),"",_xlfn.IF(_xlfn.INDIRECT(_xlfn.CONCAT("B",_xlfn.ROW()))="score","",_xlfn.CONCAT("_S",_xlfn.TEXT(_xlfn.COUNTIF(_xlfn.INDIRECT(_xlfn.CONCAT("B1:B",_xlfn.ROW())),"Section"),"00"),"Q",_xlfn.TEXT(_xlfn.ROW()-_xlfn.SUMPRODUCT(_xlfn.MAX(_xlfn.ROW(_xlfn.INDIRECT(_xlfn.CONCAT("B1:B",_xlfn.ROW())))*(_xlfn.INDIRECT(_xlfn.CONCAT("B1:B",_xlfn.ROW()))="Section")))-_xlfn.COUNTIF(_xlfn.INDIRECT(_xlfn.CONCAT("A",_xlfn.SUMPRODUCT(_xlfn.MAX(_xlfn.ROW(_xlfn.INDIRECT(_xlfn.CONCAT("B1:B",_xlfn.ROW())))*(_xlfn.INDIRECT(_xlfn.CONCAT("B1:B",_xlfn.ROW()))="Section")))+1,":A",_xlfn.ROW()-1)),""),"000"))))'
                        : '_xlfn.IF(OR(INDIRECT(_xlfn.CONCAT("B",ROW()))="Section",ISBLANK(INDIRECT(_xlfn.CONCAT("B",ROW())))),"",_xlfn.IF(INDIRECT(_xlfn.CONCAT("B",ROW()))="score","",_xlfn.CONCAT("_S",TEXT(COUNTIF(_xlfn.INDIRECT(CONCATENATE("B1:B",ROW())),"Section"),"00"),"Q",TEXT(ROW()-ROW($B$1)-SUMPRODUCT(MAX(ROW(INDIRECT(_xlfn.CONCAT("B1:B",ROW())))*("Section"=INDIRECT(_xlfn.CONCAT("B1:B",ROW())))))+1,"000"))))'
                };
                if (configure.structure === "Section") {
                    fillBackgroundToRange(ws, "A" + dataRow + ":R" + dataRow, "f8c291")
                }
                if (configure.structure === "label") {
                    fillBackgroundToRange(ws, "A" + dataRow + ":R" + dataRow, "c6e0b4")
                }

                dataRow = dataRow + 1;
            });
            applyBorderToRange(ws, 0, 3, 18, dataRow - 1);
        }
    };

    const addMapping = async (ws) => {

        const editingCell = buildCellObject(ws, "A1");
        editingCell.cell.value = "M";
        editingCell.cell.style = { font: { color: { argb: 'FFFFFFFF' } } };

        printArray2Column(ws, HNQIS2_VALUE_TYPES, "Value Type", "B2", "b6d7a8");
        printArray2Column(ws, RENDER_TYPES, "Render Type", "D2", "b6d7a8");
        printArray2Column(ws, HNQIS2_AGG_OPERATORS, "Agg. Operator", "F2", "a2c4c9");
        if (props.optionData.length > 0) {
            printObjectArray(ws, props.optionData, "H2", "d5a6bd");
        }
        printObjectArray(ws, props.healthAreaData, "L2", "d5a6bd");
        if (props.legendSetData.length > 0) {
            printObjectArray(ws, props.legendSetData, "O2", "9fc5e8");
        }
        printObjectArray(ws, props.programData, "R2", "9fc5e8");

        defineName(ws, `B3:B${HNQIS2_VALUE_TYPES.length + 2}`, "Value_Type");
        defineName(ws, `D3:D${RENDER_TYPES.length + 2}`, "Render_Type");
        defineName(ws, `F3:F${HNQIS2_AGG_OPERATORS.length + 2}`, "Agg_Operator");
        defineName(ws, `H2:J${props.optionData.length + 2}`, "Option_Sets_Data");
        defineName(ws, `H3:H${props.optionData.length + 2}`, "Option_Sets_option");
        defineName(ws, `L2:M${props.healthAreaData.length + 2}`, "Health_Area_Data");
        defineName(ws, `M3:M${props.healthAreaData.length + 2}`, "Health_Area_Option");
        defineName(ws, `O2:P${props.legendSetData.length + 2}`, "Legend_Set_Data");
        defineName(ws, `O3:O${props.legendSetData.length + 2}`, "Legend_Set_Option");
        defineName(ws, `R2:S${props.programData.length + 2}`, "Program_Data");
        await ws.protect(password);
    };

    useEffect(() => {
        if (props.flag) {
            generate();
            props.setFlag(!props.flag);
        }
    }, [])

    return null;
};

Exporter.propTypes = {
    Configures: PropTypes.array,
    flag: PropTypes.bool,
    healthAreaData: PropTypes.array,
    hnqisType: PropTypes.string,
    isLoading: PropTypes.func,
    legendSetData: PropTypes.array,
    optionData: PropTypes.array,
    programData: PropTypes.array,
    programHealthArea: PropTypes.string,
    programName: PropTypes.string,  
    programPrefix: PropTypes.string,
    programShortName: PropTypes.string,
    setFlag: PropTypes.func, 
    useCompetencyClass: PropTypes.string
}

export default Exporter;