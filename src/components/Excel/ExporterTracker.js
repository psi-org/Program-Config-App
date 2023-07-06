import { useEffect } from 'react';
import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js';
import {
    activeTabNumber,
    valueType,
    renderType,
    aggOperator,
    middleCenter,
    template_password,
    structureValidator,
    yesNoValidator,
    conditionalError,
    conditionalDisable,
    sectionHighlighting,
    questionHighlighting,
    labelHighlighting
} from "../../configs/TemplateConstants";
import {
    fillBackgroundToRange,
    printArray2Column,
    applyBorderToRange,
    dataValidation,
    printObjectArray,
    applyStyleToRange,
    defineName,
    formatDate,
    writeWorkbook,
    enableCellEditing,
    hideColumns,
    addProtection,
    addReleaseNotes,
    addCreator
} from "../../configs/ExcelUtils";
import { ReleaseNotesTracker } from "../../configs/ReleaseNotes";

const MAX_FORM_NAME_LENGTH = 200;
const MIN_FORM_NAME_LENGTH = 2;

const Exporter = ({
    programPrefix, programName, programShortName, programTET, programCatCombo, programType, flag, stagesConfigurations, teaConfigurations, optionData, legendSetData, trackedEntityAttributesData, valueTypes, aggTypes, programData, isLoading, setFlag, setStatus
 }) => {

    const password = template_password;

    const generate = () => {
        const workbook = new ExcelJS.Workbook();
        addCreator(workbook);
        const instructionWS = workbook.addWorksheet("Instructions", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: '0070C0' } }
        });

        instructionWS.properties.defaultColWidth = 12;
        instructionWS.properties.defaultRowHeight = 15;
        instructionWS.properties.alignment = { vertical: "middle" };
        addInstructions(instructionWS);

        if (programType === 'Tracker Program') {
            const teasWS = workbook.addWorksheet("TEAs", {
                views: [{
                    showGridLines: false
                }],
                properties: { tabColor: { argb: 'FDE49B' } }
            });
        }

        let stagesArray = [];
        stagesConfigurations.forEach(configuration => {
            let worksheet = workbook.addWorksheet(configuration.stageName, {
                views: [{
                    showGridLines: false,
                    state: 'frozen',
                    xSplit: 3,
                    ySplit: 2
                }],
                properties: { tabColor: { argb: 'D1F1DA' } }
            });
            stagesArray.push(worksheet);
            //addConfigurations(worksheet);
            //hideColumns(templateWS, ['program_stage_id', 'program_section_id', 'data_element_id']);
            //addProtection(templateWS,3,3000,password);
        })

        const realeaseNotesWS = workbook.addWorksheet("Release Notes", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: 'D9E7FD' } }
        });
        addReleaseNotes(realeaseNotesWS, ReleaseNotesTracker, password);

        const mappingWS = workbook.addWorksheet("Mapping", {
            views: [{
                showGridLines: false
            }],
            properties: { tabColor: { argb: 'FBDAD7' } }
        });
        workbook.views = [{
            activeTab: 0,
        }];
        addMapping(mappingWS);
        
        writeWorkbook(workbook, programName, setStatus, isLoading);
    };

    
    const addInstructions = async (ws) => {
        ws.getCell("B2").value = "PROGRAM CONFIGURATION APP";
        ws.getCell("B2").style = { font: { size: 12, bold: true } };
        ws.getCell("B3").value = "TRACKER AND EVENT PROGRAMS CONFIGURATION TEMPLATE";
        ws.getCell("B3").style = { font: { size: 12, bold: true } };

        ws.mergeCells('B5:L5');
        ws.getCell("B5").value = "Instructions";
        ws.getCell("B5").style = { font: { bold: true } };
        fillBackgroundToRange(ws, "B5:L5", "BDD7EE");
        ws.getCell("B6").value = "This template has been designed for editing standard Tracker and Event Programs using the Program Configuration App (v1.7.0 and above).";
        ws.getCell("B7").value = "Please read carefully all the instructions contained in this file to avoid issues and unexpected results when importing it to a DHIS2 server.";
        ws.getCell("B8").value = "Please keep in mind that this Template can only be used to edit existing DHIS2 Programs; Program creation is not supported.";
        ws.getCell("B8").style = { font: { color: { argb: 'FFC00000' } } };

        ws.getCell("B10").value = "This template uses a color scheme to differentiate editable and read-only fields and columns:";
        ws.getCell("B10").style = { font: { bold: true } };

        fillBackgroundToRange(ws, "B12:B12", "BDD7EE");
        fillBackgroundToRange(ws, "C12:C12", "BFBFBF");
        applyBorderToRange(ws, 1, 12, 2, 12);
        fillBackgroundToRange(ws, "H12:H12", "E2EFDA");
        fillBackgroundToRange(ws, "I12:I12", "A6E3B7");
        applyBorderToRange(ws, 7, 12, 8, 12);

        ws.getCell("D12").value = "Automatically filled or read-only";
        ws.getCell("J12").value = "Editable or enabled for user input";

        ws.mergeCells('B14:L14');
        ws.getCell("B14").value = "Configurations";
        ws.getCell("B14").style = { font: { bold: true } };
        fillBackgroundToRange(ws, "B14:L14", "BDD7EE");

        ws.mergeCells('B16:F16');
        ws.getCell("B16").value = "SERVER INFO";
        ws.getCell("B16").alignment = { horizontal: "center" }; //TODO: Not working
        ws.getCell("B16").style = { font: { bold: true } };

        ws.mergeCells('B17:C17');
        ws.getCell("B17").value = "DHIS2 Server URL";
        ws.getCell("B17").style = { font: { bold: true } };
        ws.mergeCells('D17:F17');
        ws.getCell("D17").value = location.origin;
        ws.mergeCells('B18:C18');
        ws.getCell("B18").value = "DHIS2 Server Version";
        ws.getCell("B18").style = { font: { bold: true } };
        ws.mergeCells('D18:F18');
        ws.getCell("D18").value = localStorage.getItem('SERVER_VERSION');
        fillBackgroundToRange(ws, "B16:B18", "BDD7EE");

        ws.mergeCells('B19:F20');
        ws.getCell("B19").value = "The information displayed here corresponds to the server from which this Template was downloaded";
        ws.getCell("B19").style = { font: { color: { argb: 'FFC00000' } } };
        ws.getCell('B19').alignment = { wrapText: true };
        applyBorderToRange(ws, 1, 16, 5, 20);

        ws.getCell("H16").alignment = { vertical: 'middle', horizontal: 'center' };
        ws.mergeCells('H16:L16');
        ws.getCell("H16").value = "PROGRAM SETTINGS";
        ws.getCell("H16").style = { font: { bold: true } };

        ws.mergeCells('H17:I17');
        ws.getCell("H17").value = "Data Element Prefix";
        ws.getCell("H17").style = { font: { bold: true } };
        ws.mergeCells('J17:L17');
        ws.getCell("J17").value = programPrefix;
        ws.mergeCells('H18:I18');
        ws.getCell("H18").value = "Program";
        ws.getCell("H18").style = { font: { bold: true } };
        ws.mergeCells('J18:L18');
        ws.getCell("J18").value = programName;
        ws.mergeCells('H19:I19');
        ws.getCell("H19").value = "Program Short Name";
        ws.getCell("H19").style = { font: { bold: true } };
        ws.mergeCells('J19:L19');
        ws.getCell("J19").value = programShortName;
        ws.mergeCells('H20:I20');
        ws.getCell("H20").value = "Tracked Entity Type";
        ws.getCell("H20").style = { font: { bold: true } };
        ws.mergeCells('J20:L20');
        ws.getCell("J20").value = programTET;
        ws.mergeCells('H21:I21');
        ws.getCell("H21").value = "Category Combination";
        ws.getCell("H21").style = { font: { bold: true } };
        ws.mergeCells('J21:L21');
        ws.getCell("J21").value = programCatCombo;
        ws.mergeCells('H22:I22');
        ws.getCell("H22").value = "Program Type";
        ws.getCell("H22").style = { font: { bold: true } };
        ws.mergeCells('J22:L22');
        ws.getCell("J22").value = programType;
        fillBackgroundToRange(ws, "H16:H22", "BDD7EE");
        applyBorderToRange(ws, 7, 16, 11, 22);

        ws.getColumn("N").width = 70;
        ws.getCell("N16").value = "HELP";
        ws.getCell("N16").style = { font: { bold: true } };
        fillBackgroundToRange(ws, "N16:N16", "D9D9D9");
        ws.getCell("N17").value = "The prefix that the PCA automatically adds to the Program Data Elements";
        ws.getCell("N18").value = "The Name of the Program that's being edited";
        ws.getCell("N19").value = "The Short Name of the Program that's being edited";
        ws.getCell("N20").value = "Tracked Entity Type linked to the Program";
        ws.getCell("N21").value = "Category Combination of the Program that's being edited";
        ws.getCell("N22").value = "Program Type: Event/Tracker Program";
        fillBackgroundToRange(ws, "N17:N22", "F2F2F2");
        applyBorderToRange(ws, 13, 16, 13, 22);

        ws.mergeCells('B24:L24');
        ws.getCell("B24").value = "Template Contents";
        ws.getCell("B24").style = { font: { bold: true } };
        fillBackgroundToRange(ws, "B24:L24", "BDD7EE");
        
        /*ws.getColumn("A").width = 5;
        ws.getCell("B2").value = "Welcome to DHIS2 Configuration Template";
        ws.getCell("B2").style = { font: { bold: true } };
        ws.getCell("B4").value = "By using this spreadsheet you'll be able to configure the structure of the DHIS2 checklist. Make sure you understand how to work with the tools integrated in this spreadsheet before you continue working.";
        ws.getCell("B5").value = `You're currently working with version ${ReleaseNotes.at(-1).version} of this template, please refer to the \"Release Notes\" tab to check the latest features.`;

        ws.getCell("B7").value = "Define the program configuration";
        ws.getCell("B7").style = { font: { bold: true } };
        ws.getCell("B8").value = "The following information will be used to configure the checklist as a DHIS2 program compatible with HNQIS 2.0";
        ws.getCell("B9").value = "Note: Some fields are filled automatically when the template is downloaded from a server.";

        ws.mergeCells('B11:C11');
        ws.getCell("B11").value = "Program Details";
        ws.getCell("B12").value = "Program Name";
        ws.getCell("B13").value = "Program Short Name";
        ws.getCell("B14").value = "Use 'Competency Class'";
        ws.getCell("B15").value = "Program DE Prefix";
        ws.getCell("B16").value = "Health Area";

        ws.mergeCells('F11:H11');
        ws.getCell('F11').value = "Help";
        ws.getCell("F11").style = { font: { bold: true } };
        fillBackgroundToRange(ws, "F11:H11", "bfbfbf");
        ws.getCell("F12").value = "Program Name: The name that will be assigned to the checklist.";
        ws.getCell("F13").value = "Use 'Competency Class': This will determine if competency classes will be included in the program.";
        ws.getCell("F14").value = "DE Prefix: A prefix that will be added to every Data Element in DHIS2, make sure that it is unique."
        ws.getCell("F15").value = "Health Area: The Health Area where the checklist will be assigned, used for filtering.";
        fillBackgroundToRange(ws, "F12:H15", "f2f2f2");

        ws.getCell("B17").value = "*All the fields are required";
        ws.getCell("B17").style = { font: { color: { 'argb': 'ff0000' } } }
        ws.getCell("B18").value = "This information won't change anything in this template, however, it will be used when creating program in DHIS2."
        ws.getRow("18").height = 20;
        ws.getCell("B11").style = { font: { bold: true, size: 10 } };
        fillBackgroundToRange(ws, "B11:C11", "6fa8dc");
        applyStyleToRange(ws, 'B12:B16', { font: { bold: true, size: 10 } });
        fillBackgroundToRange(ws, "B12:B16", "9fc5e8");
        fillBackgroundToRange(ws, 'C12:C16', "cfe2f3");

        ws.getCell("D12").value = { formula: "=VLOOKUP(C12, Program_Data,2,FALSE)" };
        //ws.getCell("D15").value = {formula: "=INDEX(Mapping!L1:L100;MATCH(Instructions!C15;Mapping!M1:M100;0))"};
        ws.getCell('C12').value = props.programName;
        ws.getCell('C13').value = props.programShortName;
        ws.getCell('C14').value = props.useCompetencyClass;
        ws.getCell('C15').value = props.programPrefix;
        let healthAreaFound = props.healthAreaData.find(ha => ha["code"] == props.programHealthArea);
        ws.getCell('C16').value = healthAreaFound ? healthAreaFound["Health Area"] : "Family Planning";


        //ws.getCell("D15").style = {font: {color: {'argb': 'ffffff'}}};
        ws.getCell("D12").style = { font: { color: { 'argb': 'ffffff' } } }

        ws.getCell('B20').value = "Server mapping";
        ws.getCell("B20").style = { font: { bold: true } };
        ws.getCell("B21").value = `This file already contains the required metadata from the server ${location.hostname}`;

        ws.getCell('B23').value = "How to work with this template";
        ws.getCell("B23").style = { font: { bold: true } };
        ws.getCell("B24").value = "Most of the configurations are made in the \"Template\" tab, which contains several columns described below:";

        ws.getCell('B26').value = "Parent Name";
        ws.getCell("B26").style = { font: { bold: true } };
        ws.getCell("B26").alignment = { vertical: "middle" };
        ws.mergeCells('C26:F26');
        ws.getCell('C26').alignment = { wrapText: true };
        ws.getRow("26").height = 85;
        ws.getCell("C26").value = `[Question & Label Only] \n Identifier to use as reference in the "Parent question" column. This field is generated automatically when certain conditions are met. \n Parent Names follow the structure "_S#Q#" where the S means "Section" followed by the number of the section (1 for the first one, 2 for the second one, and so on...) and Q means "Question" followed by the number of the question in the section (the same way as the sections but the numbers restart with each section).`;

        ws.getCell('B27').value = "Structure";
        ws.getCell("B27").style = { font: { bold: true } };
        ws.getCell("B27").alignment = { vertical: "middle" };
        ws.mergeCells('C27:F27');
        ws.getCell('C27').alignment = { wrapText: true };
        ws.getRow("27").height = 115;
        ws.getCell("C27").value = `Determines what is being configured in the row. The value in this column will define which validations are applied to the row.  \n The possible structure values are: \n Section - Defines a section in the assessment, all the rows under it will create Data Elements contained in the section until another "Section" row is defined. \n Question - Defines a question Data Element that can be answered in some way (text field, numeric field, option set, etc.). \n Label - Defines a label Data Element, usually these are used to display instructions or help text. \n Score - Defines a score Data Element that will contain the value of the score calculations.`;

        ws.getCell('B28').value = "Form name";
        ws.getCell("B28").style = { font: { bold: true } };
        ws.getCell("B28").alignment = { vertical: "middle" };
        ws.mergeCells("C28:F28");
        ws.getCell("C28").value = `Text that will be displayed in the form during the assessment. This is the text that you want to show to the user.`;

        fillBackgroundToRange(ws, 'B26:B28', "efefef");

        ws.getCell('B29').value = "Critical Step\n";
        ws.getCell("B29").style = { font: { bold: true } };
        ws.getCell("B29").alignment = { vertical: "middle" };
        ws.mergeCells('C29:F29');
        ws.getCell('C29').alignment = { wrapText: true };
        ws.getRow("29").height = 48;
        ws.getCell("C29").value = `[Question Only] \n Scores are divided in critical and non-critical, this is mostly used for the "competency classification" but can also be used in other types of classification in analytics as well. A critical step will count for the critical score. Select "Yes" if you want to define a critical question.`;

        ws.getCell('B30').value = "Compulsory";
        ws.getCell("B30").style = { font: { bold: true } };
        ws.getCell("B30").alignment = { vertical: "middle" };
        ws.mergeCells('C30:F30');
        ws.getCell('C30').alignment = { wrapText: true };
        ws.getRow("30").height = 32;
        ws.getCell("C30").value = `[Question Only] \n A compulsory question must be answered to complete an assessment. Select "Yes" if you want define a mandatory question.`;

        fillBackgroundToRange(ws, 'B29:B30', "f4cccc");

        ws.getCell('B31').value = "Value Type";
        ws.getCell("B31").style = { font: { bold: true } };
        ws.getCell("B31").alignment = { vertical: "middle" };
        ws.mergeCells("C31:F31");
        ws.getCell('C31').alignment = { wrapText: true };
        ws.getRow("31").height = 48;
        ws.getCell("C31").value = `[Question, Label & Score] \n Determines the type of input if there's no Option Set selected. If there's an Option Set selected, the "Value Type" cell must match the Value Type of the Option Set.`;

        ws.getCell('B32').value = "Option Set";
        ws.getCell("B32").style = { font: { bold: true } };
        ws.getCell("B32").alignment = { vertical: "middle" };
        ws.mergeCells("C32:F32");
        ws.getCell('C32').alignment = { wrapText: true };
        ws.getRow("32").height = 32;
        ws.getCell("C32").value = `[Question Only] \n Select the Option Set that provides available answers for this question (forces Value Type)`;

        ws.getCell('B33').value = "Legend";
        ws.getCell("B33").style = { font: { bold: true } };
        ws.getCell("B33").alignment = { vertical: "middle" };
        ws.mergeCells("C33:F33");
        ws.getCell('C33').alignment = { wrapText: true };
        ws.getRow("33").height = 32;
        ws.getCell("C33").value = `[Question Only] \n Select the legend that will be applied to the question. The legend will be displayed in the data entry form and in the Feedback Module in the app.`;

        fillBackgroundToRange(ws, 'B31:B33', "d9ead3");

        ws.getCell('B34').value = "Score Numerator";
        ws.getCell("B34").style = { font: { bold: true } };
        ws.getCell("B34").alignment = { vertical: "middle" };
        ws.mergeCells("C34:F34");
        ws.getCell('C34').alignment = { wrapText: true };
        ws.getRow("34").height = 32;
        ws.getCell("C34").value = `[Question Only]\n Numerator for scores calculation. This value will be used in the formulas that calculate scores. Each numerator will contribute to the scores calculation formulas.`;

        ws.getCell('B35').value = "Score Denominator";
        ws.getCell("B35").style = { font: { bold: true } };
        ws.getCell("B35").alignment = { vertical: "middle" };
        ws.mergeCells("C35:F35");
        ws.getCell('C35').alignment = { wrapText: true };
        ws.getRow("35").height = 32;
        ws.getCell("C35").value = `[Question Only] \n Denominator for scores calculation. This value will be used in the formulas that calculate scores. Each numerator will contribute to the scores calculation formulas.`;

        ws.getCell('B36').value = "Compositive indicator (Feedback Order)";
        ws.getCell("B36").style = { font: { bold: true } };
        ws.getCell("B36").alignment = { vertical: "middle" };
        ws.mergeCells("C36:F36");
        ws.getCell('C36').alignment = { wrapText: true };
        ws.getRow("36").height = 126;
        ws.getCell("C36").value = `[Question, Label & Score] \n This number will generate the feedback hierarchy in the app, while also grouping the scores to calculate the composite scores. \n Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc. There cannot exist gaps in the Compositive indicators, for example: \n Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.  \n This limitation applies in the same level of the compositive indicator (Levels being level1.level2.level3.(...).levelN), meaning that the previous error (1.3) was located in level 2 (value 3) of the compositive indicator of value 1. \n Questions are not required to be grouped together to belong to the same level of the compositive indicator, for example: \n Having [ 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 1.4 ] is a valid configuration as there are no gaps in the same level of the compositive indicator.`;

        fillBackgroundToRange(ws, 'B34:B36', "fff2cc");

        ws.getCell('B37').value = "Parent Question";
        ws.getCell("B37").style = { font: { bold: true } };
        ws.getCell("B37").alignment = { vertical: "middle" };
        ws.mergeCells("C37:F37");
        ws.getCell('C37').alignment = { wrapText: true };
        ws.getRow("37").height = 48;
        ws.getCell("C37").value = `[Question & Label Only] \n Select the "Parent Name" of the question that will act as parent of the question/label defined in the row. Essentially the Data Element defined in the row won't be displayed in the data entry form until a certain condition applies to the selected parent.`;

        ws.getCell('B38').value = "Answer Value";
        ws.getCell("B38").style = { font: { bold: true } };
        ws.getCell("B38").alignment = { vertical: "middle" };
        ws.mergeCells("C38:F38");
        ws.getCell('C38').alignment = { wrapText: true };
        ws.getRow("38").height = 60;
        ws.getCell("C38").value = `[Question & Label Only] \n Specify the value that will trigger the "show" rule of the question/label defined in the row. \n The condition that will be evaluated is: [Parent question] == [Answer value]. If it matches then the question/label defined in the row will be displayed in the data entry for.`;

        fillBackgroundToRange(ws, 'B37:B38', "c9daf8");

        ws.getCell('B39').value = "Feedback Text";
        ws.getCell("B39").style = { font: { bold: true } };
        ws.getCell("B39").alignment = { vertical: "middle" };
        ws.mergeCells("C39:F39");
        ws.getCell('C39').alignment = { wrapText: true };
        ws.getRow("39").height = 32;
        ws.getCell("C39").value = `[Question & Label Only]\n Text that will be displayed in the Feedback app for each question.`;

        ws.getCell('B40').value = "Description";
        ws.getCell("B40").style = { font: { bold: true } };
        ws.getCell("B40").alignment = { vertical: "middle" };
        ws.mergeCells("C40:F40");
        ws.getCell('C40').alignment = { wrapText: true };
        ws.getRow("40").height = 16;
        ws.getCell("C40").value = `Enter the help text that will display to the supervisor during data entry. This text will appear as an ( i ) icon in the data entry form.`;

        ws.getCell("B42").value = `Every row in the "Template" tab starting from row 3 will generate the necessary components for the program when this file gets imported to the server. `;
        ws.getCell("B43").value = `The template will highlight in red some cells automatically while you're working on it, this means that there's a validation error in that cell and you must fix it before importing.`;
        ws.getCell("B44").value = `Also, keep in mind that this file is protected so you can only modify some specific cell ranges (most of the unlocked cells are in the "Template" tab).`;

        ws.getCell("B46").value = "Excel Validation";
        ws.getCell("B46").style = { font: { bold: true } };
        ws.getCell("B47").value = "Worksheet";
        ws.getCell("C47").value = "Column / Cell";
        ws.getCell("D47").value = "Validation Type";
        ws.getCell("E47").value = "Rule & Messages";
        ws.mergeCells("B48:B52");
        ws.getCell("B48").value = "Instruction";
        ws.getCell("B48").alignment = { vertical: "middle" };
        ws.mergeCells("C48:C49");
        ws.getCell("C48").value = "Program Name";
        ws.getCell("C48").alignment = { vertical: "middle" };
        ws.getCell("D48").value = "Conditional Validation";
        ws.getCell("D49").value = "Data Validation";
        ws.getCell("E48").value = "'=Instructions!C12' cell will be highlighted with RED Color";
        ws.getCell('E48').alignment = { wrapText: true };
        ws.getCell("E49").value = "A Dialogbox will show up with the proper message";
        ws.getCell('E49').alignment = { wrapText: true };
        ws.getCell("C50").value = "Prefix";
        ws.getCell("D50").value = "Data Validation";
        ws.getCell("E50").value = "A Dialogbox will show up with the proper message";
        ws.getCell('E50').alignment = { wrapText: true };
        ws.getCell("C51").value = "Competency Class";
        ws.getCell("D51").value = "Data Validation";
        ws.getCell("E51").value = "Only 'Yes' or 'No' can be selected. A dialogbox will pop up with anything else is selected";
        ws.getCell('E51').alignment = { wrapText: true };
        ws.getCell("C52").value = "Health Area";
        ws.getCell("D52").value = "Data Validation";
        ws.getCell("E52").value = "If value entered doesn't match with any of the provided option, a dialogbox will popup";
        ws.getCell("E52").alignment = { wrapText: true };

        ws.mergeCells("B53:B61");
        ws.getCell("B53").value = "Template";
        ws.getCell("B53").alignment = { vertical: "middle" };
        ws.getCell("C53").value = "Structure";
        ws.getCell("D53").value = "Data Validation";
        ws.getCell("E53").value = "Either 'Section', 'question', 'label', or 'score' can be selected. A Dialogbox will show to select the proper valid option from the list.";
        ws.getCell("E53").alignment = { wrapText: true };

        ws.getCell("C54").value = "Critical Step and Compulsory column";
        ws.getCell("D54").value = "Data Validation";
        ws.getCell("E54").value = "Only 'Yes' or 'No' can be selected. A dialogbox will pop up with anything else is selected";
        ws.getCell("E54").alignment = { wrapText: true };

        ws.getCell("C55").value = "\"Value Type\n Option Set\n Legend\"\n";
        ws.getCell("C55").alignment = { wrapText: true };
        ws.getCell("D55").value = "Data Validation";
        ws.getCell("E55").value = "Only valid value can be entered\n";
        ws.getCell("E55").alignment = { wrapText: true };

        ws.getCell("C56").value = "Score Numerator & Score Denominator\n";
        ws.getCell("D56").value = "Data Validation";
        ws.getCell("E56").value = "Value should be numeric and should be greater than 0\n";
        ws.getCell("E56").alignment = { wrapText: true };

        ws.getCell("C57").value = "Form Name\n";
        ws.getCell("D57").value = "Conditional Validation";
        ws.getCell("E57").value = "Cell will be highlighted RED if corresponding Structure is present but form name is missing";
        ws.getCell("E57").alignment = { wrapText: true };

        ws.getCell("C58").value = "Feedback Order";
        ws.getCell("D58").value = "Conditional Validation";
        ws.getCell("E58").value = "If the Structure is score then a compositive indicator should be provided";
        ws.getCell("E58").alignment = { wrapText: true };

        ws.getCell("C59").value = "Feedback Order";
        ws.getCell("D59").value = "Conditional Validation";
        ws.getCell("E59").value = "If either Numerator or Denominator is present then Feedback order should be provided otherwise the corresponding cell will be highlighted RED";
        ws.getCell("E59").alignment = { wrapText: true };

        ws.getCell("C60").value = "Score Numerator & Score Denominator";
        ws.getCell("D60").value = "Conditional Validation";
        ws.getCell("E60").value = "If either of the score is present and other one is absent then the missing side will be highlighted RED";
        ws.getCell("E60").alignment = { wrapText: true };

        ws.getCell("C61").value = "Parent Question and Answer \n";
        ws.getCell("D61").value = "Conditional Validation";
        ws.getCell("E61").value = "If Parent Question is present, answer should exist and vice versa otherwise the missing cell will be highlighted RED";
        ws.getCell("E61").alignment = { wrapText: true };

        fillBackgroundToRange(ws, 'B47:E47', "FABF8F");

        ws.getCell("B63").value = `Please ensure this content is clean. Everything will appear in the program just as it is submitted to the server. The developers will not correct any spelling mistakes or spacing errors. `;

        ws.getCell("B65").value = `Once you're done with the configurations proceed by uploading this template to the Config Web App to process it.`;
        ws.getCell("B66").value = `After uploading please check that the content has been configured as expected using the preview, then save the changes.`;

        ws.getCell("B68").value = `Now we're done!`;
        ws.getCell("B68").style = { font: { bold: true } };

        ws.getCell("B69").value = `Test your configurations both on the web and the Android app, then make changes using this template if necessary.`;
        ws.getCell("B70").value = `Remember that once uploaded you can download a copy of this template from the server.`;

        applyBorderToRange(ws, 1, 26, 2, 40);
        applyBorderToRange(ws, 1, 47, 4, 61);
        instructionValidations(ws);
        enableCellEditing(ws, ['C12', 'D12', 'C13', 'C14', 'C15', 'C16']);*/
        await ws.protect(password);
    };
    
    /*
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
            header: "Form name",
            key: "form_name",
            width: 55
        }, {
            header: "Critical Step",
            key: "isCritical",
            width: 14
        }, {
            header: "Compulsory",
            key: "isCompulsory",
            width: 14
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
            header: "Compositive Indicator (Feedback Order)",
            key: "compositive_indicator",
            width: 22,
            style: { numFmt: '@' }
        }, {
            header: "Parent question",
            key: "parent_question",
            width: 19
        }, {
            header: "Answer value",
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
        }];
        fillBackgroundToRange(ws, "A1:C1", "efefef");
        fillBackgroundToRange(ws, "D1:E1", "f4cccc");
        fillBackgroundToRange(ws, "F1:H1", "d9ead3");
        fillBackgroundToRange(ws, "I1:K1", "fff2cc");
        fillBackgroundToRange(ws, "L1:M1", "c9daf8");
        ws.getRow(1).height = 35;
        ws.getRow(1).alignment = middleCenter;
        ws.getRow(2).values = {
            parent_name: `Indentifier to use as reference in the "Parent question" column`,
            structure: `Defines what is being configured in the row`,
            form_name: `Text that will be displayed in the form during the assessment`,
            isCritical: "A critical step will count for the critical score",
            isCompulsory: "A compulsory question must be answered to complete an assessment",
            value_type: `Determines the type of input if there's no Option Set selected`,
            optionSet: `Select the option set that provides available answers for this question (forces Value Type)`,
            legend: "Select the legend that will be applied to the question",
            score_numerator: "Numerator for scores calculation",
            score_denominator: "Denominator for scores calculation",
            compositive_indicator: "This number will generate the feedback tree in the app, accepted values are:1, 1.1, 1.1.1, 1.1.2, 1.1..., 1.2, etc.",
            parent_question: "Select the Parent Name of the question that will act as parent",
            answer_value: `Specify the value that will trigger the "show" rule of the question`,
            feedback_text: `Text that will be displayed in the Feedback app for each question`,
            description: `Enter the help text that will display to the supervisor during data entry`,
            program_stage_id: "",
            program_section_id: "",
            data_element_id: ""
        };
        ws.getRow(2).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "d9d2e9"
            }
        };
        ws.getRow(2).height = 100;
        ws.getRow(2).alignment = middleCenter;
        applyBorderToRange(ws, 0, 0, 14, 2);
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
            formulae: structureValidator
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
        dataValidation(ws, "F3:F3000", {
            type: 'list',
            allowBlank: true,
            error: 'Please select the valid value from the dropdown',
            errorTitle: 'Invalid Selection',
            showErrorMessage: true,
            formulae: ['Value_Type']
        });
        dataValidation(ws, "G3:G3000", {
            type: 'list',
            allowBlank: true,
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

    const addConditionalFormatting = (ws) => {
        ws.addConditionalFormatting({
            ref: 'A3:A3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['AND(ISBLANK($A3),OR($B3="question",$B3="label"))'],
                    style: conditionalError,
                }
            ],
            promptTitle: 'Parent name not defined',
            prompt: 'A parent name was not defined for the specified element.'
        });
        ws.addConditionalFormatting({
            ref: 'C3:C3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['AND(ISBLANK($C3),NOT(ISBLANK($B3)))'],
                    style: conditionalError,
                }
            ],
            promptTitle: 'Form name not defined',
            prompt: 'A form name was not defined for the specified element.'
        });
        //conditional formatting for form name out of range
        ws.addConditionalFormatting({
            ref: 'C3:C3000',
            rules: [
                {
                    type: 'expression',
                    formulae: [`AND(NOT(ISBLANK($B3)),OR(LEN($C3)<${MIN_FORM_NAME_LENGTH},LEN($C3)>${MAX_FORM_NAME_LENGTH}))`],
                    style: conditionalError,
                }
            ],
            promptTitle: 'Form name is too long',
            prompt: `Given form name length is out of the accepted range (Between ${MIN_FORM_NAME_LENGTH} and ${MAX_FORM_NAME_LENGTH} characters).`
        });
        //conditional formatting for structure=label
        ws.addConditionalFormatting({
            ref: 'F3:F3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['$B3="label"'],
                    style: conditionalDisable
                }
            ]
        });
        //conditional formatting for structure=scores
        ws.addConditionalFormatting({
            ref: 'F3:F3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['$B3="score"'],
                    style: conditionalDisable
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
                    formulae: ['OR(AND(OR(NOT(ISBLANK($I3)),NOT(ISBLANK($J3))), ISBLANK($K3)), AND($B3="score", ISBLANK($K3)))'],
                    style: conditionalError
                }
            ]
        });
        //Conditional formatting checking incomplete scoring
        ws.addConditionalFormatting({
            ref: 'I3:J3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['OR(AND($I3<>"",$J3=""), AND($I3="",$J3<>""))'],
                    style: conditionalError
                }
            ]
        });
        //Conditional formatting checking incomplete parent and answer
        ws.addConditionalFormatting({
            ref: 'L3:M3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['OR(AND($L3<>"", $M3=""), AND($L3="", $M3<>""))'],
                    style: conditionalError
                }
            ]
        })
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
        ws.addConditionalFormatting({
            ref: 'L4:L3000',
            rules: [
                {
                    type: 'expression',
                    formulae: ['$A4=$L4'],
                    style: conditionalError,
                }
            ]
        });
    }

    const populateConfiguration = async ws => {
        let dataRow = 3;
        if (props.Configures.length > 0) {
            props.Configures.forEach((configure) => {
                ws.getRow(dataRow).values = configure;
                ws.getCell("A" + dataRow).value = { formula: '_xlfn.IF(OR(INDIRECT(_xlfn.CONCAT("B",ROW()))="Section",ISBLANK(INDIRECT(_xlfn.CONCAT("B",ROW())))),"",_xlfn.IF(INDIRECT(_xlfn.CONCAT("B",ROW()))="score","",_xlfn.CONCAT("_S",COUNTIF(_xlfn.INDIRECT(CONCATENATE("B1:B",ROW())),"Section"),"Q",ROW()-ROW($B$1)-SUMPRODUCT(MAX(ROW(INDIRECT(_xlfn.CONCAT("B1:B",ROW())))*("Section"=INDIRECT(_xlfn.CONCAT("B1:B",ROW())))))+1)))' };
                if (configure.structure === "Section") {
                    fillBackgroundToRange(ws, "A" + dataRow + ":R" + dataRow, "f8c291")
                }
                if (configure.structure === "label") {
                    fillBackgroundToRange(ws, "A" + dataRow + ":R" + dataRow, "c6e0b4")
                }

                dataRow = dataRow + 1;
            });
            applyBorderToRange(ws, 0, 3, 14, dataRow - 1);
        }
    };
    */
    const addMapping = async (ws) => {
        let optionSetData = optionData.map(od => {
            od.url = `${location.origin}/api/optionSets/${od.id}.json?fields=id,name,options[id,code,name]`;
            return od
        })
        printObjectArray(ws, trackedEntityAttributesData, "B2", "bdd7ee");
        defineName(ws, `B3:F${trackedEntityAttributesData.length + 2}`, "Tracked_Entity_Attributes_Data");

        printObjectArray(ws, optionSetData, "H2", "bdd7ee");
        defineName(ws, `H3:K${optionSetData.length + 2}`, "Option_Sets_Data");

        printObjectArray(ws, legendSetData, "M2", "bdd7ee");
        defineName(ws, `M3:N${legendSetData.length + 2}`, "Legend_Set_Data");

        printObjectArray(ws, valueTypes, "P2", "bdd7ee");
        defineName(ws, `P3:Q${valueTypes.length + 2}`, "Value_Type");

        printArray2Column(ws, renderType, "Render Type", "S2", "bdd7ee");
        defineName(ws, `S3:S${renderType.length + 2}`, "Render_Type");

        printObjectArray(ws, aggTypes, "U2", "bdd7ee");
        defineName(ws, `U3:V${aggTypes.length + 2}`, "Agg_Operator");
        
        await ws.protect(password);
    };
    
    useEffect(() => {
        if (flag) {
            generate()
            setFlag(!flag)
        }
    }, [])

    return null;
};

export default Exporter;