import React from 'react';
import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js';
import { saveAs } from 'file-saver';
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
  applyStyleToRange
} from "../../configs/ExcelUtils";
import {ReleaseNotes} from "../../configs/ReleaseNotes";

const Exporter = (props) => {
  const password = template_password;

  const initialize = () => {
    console.log("Load: ", "Exporter");
      generate();
  };

  const generate = () => {
    const workbook = new ExcelJS.Workbook();
    addCreator(workbook);
    const instructionWS = workbook.addWorksheet("Instructions", {
      views: [{
        showGridLines: false
        }]
      }
    );
    instructionWS.properties.defaultColWidth = 30;
    instructionWS.properties.defaultRowHeight = 20;
    instructionWS.properties.alignment = {vertical: "middle"};
    const templateWS = workbook.addWorksheet("Template", {
      views: [{
        showGridLines: false,
        state: 'frozen',
        xSplit: 3,
        ySplit: 2
      }]
    });
    const mappingWS = workbook.addWorksheet("Mapping", {
      views: [{
        showGridLines: false
      }]
    });
    const realeaseNotesWS = workbook.addWorksheet("Release Notes");
    workbook.views = [{
      activeTab: activeTabNumber
    }];
    addInstructions(instructionWS);
    addConfigurations(templateWS);
    addMapping(mappingWS);
    addReleaseNotes(realeaseNotesWS);
    hideColumns(templateWS);
    addProtection(templateWS);
    writeWorkbook(workbook);
  };

  const addCreator = wb => {
    wb.creator = 'Utsav Ashish Koju';
    wb.created = new Date();
  };

  const addInstructions = async (ws) => {
    ws.getColumn("A").width = 5;
    ws.getCell("B2").value = "Welcome to DHIS2 Configuration Template";
    ws.getCell("B2").style = {font: {bold: true}};
    ws.getCell("B4").value = "By using this spreadsheet you'll be able to configure the structure of the DHIS2 checklist. Make sure you understand how to work with the tools integrated in this spreadsheet before you continue working.";
    ws.getCell("B5").value = `You're currently working with version ${ReleaseNotes.at(-1).version} of this template, please refer to the \"Release Notes\" tab to check the latest features.`;

    ws.getCell("B7").value = "Define the program configuration";
    ws.getCell("B7").style = {font: {bold: true}};
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
    ws.getCell("F11").style = {font: {bold: true}};
    fillBackgroundToRange(ws, "F11:H11", "bfbfbf");
    ws.getCell("F12").value = "Program Name: The name that will be assigned to the checklist.";
    ws.getCell("F13").value = "Use 'Competency Class': This will determine if competency classes will be included in the program";
    ws.getCell("F14").value = "DE Prefix: A prefix that will be added to every Data Element in DHIS2, this is used to filter information."
    ws.getCell("F15").value = "Health Area: The Health Area where the checklist will be assigned, used for filtering.";
    fillBackgroundToRange(ws, "F12:H15", "f2f2f2");

    ws.getCell("B17").value = "*All the fields are required";
    ws.getCell("B17").style = {font: {color: {'argb': 'ff0000'}}}
    ws.getCell("B18").value = "This information won't change anything in this template, however, it will be used when creating program in DHIS2."
    ws.getRow("18").height = 20;
    ws.getCell("B11").style = {font: {bold: true, size: 10}};
    fillBackgroundToRange(ws, "B11:C11", "6fa8dc");
    applyStyleToRange(ws, 'B12:B16', {font: {bold: true, size: 10}});
    fillBackgroundToRange(ws, "B12:B16", "9fc5e8");
    fillBackgroundToRange(ws, 'C12:C16', "cfe2f3");

    ws.getCell("D12").value = {formula: "=VLOOKUP(C12, Mapping!R3:S300,2,FALSE)"};
    //ws.getCell("D15").value = {formula: "=INDEX(Mapping!L1:L100;MATCH(Instructions!C15;Mapping!M1:M100;0))"};
    ws.getCell('C12').value = props.programName;
    ws.getCell('C13').value = props.programShortName;
    ws.getCell('C14').value = props.useCompetencyClass;
    ws.getCell('C15').value = props.programPrefix;
    let healthAreaFound = props.healthAreaData.find(ha => ha["Code"] == props.programHealthArea);
    ws.getCell('C16').value = healthAreaFound ? healthAreaFound["Health Area"] : "Family Planning";
    
    
    //ws.getCell("D15").style = {font: {color: {'argb': 'ffffff'}}};
    ws.getCell("D12").style = {font: {color: {'argb': 'ffffff'}}}

    ws.getCell('B20').value = "Server mapping";
    ws.getCell("B20").style = {font: {bold: true}};
    ws.getCell("B21").value = `This file already contains the required metadata from the server ${location.hostname}`;

    ws.getCell('B23').value = "How to work with this template";
    ws.getCell("B23").style = {font: {bold: true}};
    ws.getCell("B24").value = "Most of the configurations are made in the \"Template\" tab, which contains several columns described below:";

    ws.getCell('B26').value = "Parent Name";
    ws.getCell("B26").style = {font: {bold: true}};
    ws.getCell("B26").alignment = {vertical: "middle"};
    ws.mergeCells('C26:F26');
    ws.getCell('C26').alignment = {wrapText: true};
    ws.getRow("26").height = 85;
    ws.getCell("C26").value = `[Question & Label Only] \n Identifier to use as reference in the "Parent question" column. This field is generated automatically when certain conditions are met. \n Parent Names follow the structure "_S#Q#" where the S means "Section" followed by the number of the section (1 for the first one, 2 for the second one, and so on...) and Q means "Question" followed by the number of the question in the section (the same way as the sections but the numbers restart with each section).`;

    ws.getCell('B27').value = "Structure";
    ws.getCell("B27").style = {font: {bold: true}};
    ws.getCell("B27").alignment = {vertical: "middle"};
    ws.mergeCells('C27:F27');
    ws.getCell('C27').alignment = {wrapText: true};
    ws.getRow("27").height = 115;
    ws.getCell("C27").value = `Determines what is being configured in the row. The value in this column will define which validations are applied to the row.  \n The possible structure values are: \n Section - Defines a section in the assessment, all the rows under it will create Data Elements contained in the section until another "Section" row is defined. \n Question - Defines a question Data Element that can be answered in some way (text field, numeric field, option set, etc.). \n Label - Defines a label Data Element, usually these are used to display instructions or help text. \n Score - Defines a score Data Element that will contain the value of the score calculations.`;

    ws.getCell('B28').value = "Form name";
    ws.getCell("B28").style = {font: {bold: true}};
    ws.getCell("B28").alignment = {vertical: "middle"};
    ws.mergeCells("C28:F28");
    ws.getCell("C28").value = `Text that will be displayed in the form during the assessment. This is the text that you want to show to the user.`;

    fillBackgroundToRange(ws, 'B26:B28', "efefef");

    ws.getCell('B29').value = "Critical Step\n";
    ws.getCell("B29").style = {font: {bold: true}};
    ws.getCell("B29").alignment = {vertical: "middle"};
    ws.mergeCells('C29:F29');
    ws.getCell('C29').alignment = {wrapText: true};
    ws.getRow("29").height = 48;
    ws.getCell("C29").value = `[Question Only] \n Scores are divided in critical and non-critical, this is mostly used for the "competency classification" but can also be used in other types of classification in analytics as well. A critical step will count for the critical score. Select "Yes" if you want to define a critical question.`;

    ws.getCell('B30').value = "Compulsory";
    ws.getCell("B30").style = {font: {bold: true}};
    ws.getCell("B30").alignment = {vertical: "middle"};
    ws.mergeCells('C30:F30');
    ws.getCell('C30').alignment = {wrapText: true};
    ws.getRow("30").height = 32;
    ws.getCell("C30").value = `[Question Only] \n A compulsory question must be answered to complete an assessment. Select "Yes" if you want define a mandatory question.`;

    fillBackgroundToRange(ws, 'B29:B30', "f4cccc");

    ws.getCell('B31').value = "Value Type";
    ws.getCell("B31").style = {font: {bold: true}};
    ws.getCell("B31").alignment = {vertical: "middle"};
    ws.mergeCells("C31:F31");
    ws.getCell('C31').alignment = {wrapText: true};
    ws.getRow("31").height = 48;
    ws.getCell("C31").value = `[Question, Label & Score] \n Determines the type of input if there's no Option Set selected. If there's an Option Set selected, the "Value Type" cell must match the Value Type of the Option Set.`;

    ws.getCell('B32').value = "Option Set";
    ws.getCell("B32").style = {font: {bold: true}};
    ws.getCell("B32").alignment = {vertical: "middle"};
    ws.mergeCells("C32:F32");
    ws.getCell('C32').alignment = {wrapText: true};
    ws.getRow("32").height = 32;
    ws.getCell("C32").value = `[Question Only] \n Select the Option Set that provides available answers for this question (forces Value Type)`;

    ws.getCell('B33').value = "Legend";
    ws.getCell("B33").style = {font: {bold: true}};
    ws.getCell("B33").alignment = {vertical: "middle"};
    ws.mergeCells("C33:F33");
    ws.getCell('C33').alignment = {wrapText: true};
    ws.getRow("33").height = 32;
    ws.getCell("C33").value = `[Question Only] \n Select the legend that will be applied to the question. The legend will be displayed in the data entry form and in the Feedback Module in the app.`;

    fillBackgroundToRange(ws, 'B31:B33', "d9ead3");

    ws.getCell('B34').value = "Score Numerator";
    ws.getCell("B34").style = {font: {bold: true}};
    ws.getCell("B34").alignment = {vertical: "middle"};
    ws.mergeCells("C34:F34");
    ws.getCell('C34').alignment = {wrapText: true};
    ws.getRow("34").height = 32;
    ws.getCell("C34").value = `[Question Only]\n Numerator for scores calculation. This value will be used in the formulas that calculate scores. Each numerator will contribute to the scores calculation formulas.`;

    ws.getCell('B35').value = "Score Denominator";
    ws.getCell("B35").style = {font: {bold: true}};
    ws.getCell("B35").alignment = {vertical: "middle"};
    ws.mergeCells("C35:F35");
    ws.getCell('C35').alignment = {wrapText: true};
    ws.getRow("35").height = 32;
    ws.getCell("C35").value = `[Question Only] \n Denominator for scores calculation. This value will be used in the formulas that calculate scores. Each numerator will contribute to the scores calculation formulas.`;

    ws.getCell('B36').value = "Compositive indicator (Feedback Order)";
    ws.getCell("B36").style = {font: {bold: true}};
    ws.getCell("B36").alignment = {vertical: "middle"};
    ws.mergeCells("C36:F36");
    ws.getCell('C36').alignment = {wrapText: true};
    ws.getRow("36").height = 126;
    ws.getCell("C36").value = `[Question, Label & Score] \n This number will generate the feedback hierarchy in the app, while also grouping the scores to calculate the composite scores. \n Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc. There cannot exist gaps in the Compositive indicators, for example: \n Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.  \n This limitation applies in the same level of the compositive indicator (Levels being level1.level2.level3.(...).levelN), meaning that the previous error (1.3) was located in level 2 (value 3) of the compositive indicator of value 1. \n Questions are not required to be grouped together to belong to the same level of the compositive indicator, for example: \n Having [ 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 1.4 ] is a valid configuration as there are no gaps in the same level of the compositive indicator.`;

    fillBackgroundToRange(ws, 'B34:B36', "fff2cc");

    ws.getCell('B37').value = "Parent Question";
    ws.getCell("B37").style = {font: {bold: true}};
    ws.getCell("B37").alignment = {vertical: "middle"};
    ws.mergeCells("C37:F37");
    ws.getCell('C37').alignment = {wrapText: true};
    ws.getRow("37").height = 48;
    ws.getCell("C37").value = `[Question & Label Only] \n Select the "Parent Name" of the question that will act as parent of the question/label defined in the row. Essentially the Data Element defined in the row won't be displayed in the data entry form until a certain condition applies to the selected parent.`;

    ws.getCell('B38').value = "Answer Value";
    ws.getCell("B38").style = {font: {bold: true}};
    ws.getCell("B38").alignment = {vertical: "middle"};
    ws.mergeCells("C38:F38");
    ws.getCell('C38').alignment = {wrapText: true};
    ws.getRow("38").height = 60;
    ws.getCell("C38").value = `[Question & Label Only] \n Specify the value that will trigger the "show" rule of the question/label defined in the row. \n The condition that will be evaluated is: [Parent question] == [Answer value]. If it matches then the question/label defined in the row will be displayed in the data entry for.`;

    fillBackgroundToRange(ws, 'B37:B38', "c9daf8");

    ws.getCell('B39').value = "Feedback Text";
    ws.getCell("B39").style = {font: {bold: true}};
    ws.getCell("B39").alignment = {vertical: "middle"};
    ws.mergeCells("C39:F39");
    ws.getCell('C39').alignment = {wrapText: true};
    ws.getRow("39").height = 32;
    ws.getCell("C39").value = `[Question & Label Only]\n Text that will be displayed in the Feedback app for each question.`;

    ws.getCell('B40').value = "Description";
    ws.getCell("B40").style = {font: {bold: true}};
    ws.getCell("B40").alignment = {vertical: "middle"};
    ws.mergeCells("C40:F40");
    ws.getCell('C40').alignment = {wrapText: true};
    ws.getRow("40").height = 16;
    ws.getCell("C40").value = `Enter the help text that will display to the supervisor during data entry. This text will appear as an ( i ) icon in the data entry form.`;

    ws.getCell("B42").value = `Every row in the "Template" tab starting from row 3 will generate the necessary components for the program when this file gets imported to the server. `;
    ws.getCell("B43").value = `The template will highlight in red some cells automatically while you're working on it, this means that there's a validation error in that cell and you must fix it before importing.`;
    ws.getCell("B44").value = `Also, keep in mind that this file is protected so you can only modify some specific cell ranges (most of the unlocked cells are in the "Template" tab).`;

    ws.getCell("B46").value = "Excel Validation";
    ws.getCell("B46").style = {font: {bold: true}};
    ws.getCell("B47").value = "Worksheet";
    ws.getCell("C47").value = "Column / Cell";
    ws.getCell("D47").value = "Validation Type";
    ws.getCell("E47").value = "Rule & Messages";
    ws.mergeCells("B48:B52");
    ws.getCell("B48").value = "Instruction";
    ws.getCell("B48").alignment = {vertical: "middle"};
    ws.mergeCells("C48:C49");
    ws.getCell("C48").value = "Program Name";
    ws.getCell("C48").alignment = {vertical: "middle"};
    ws.getCell("D48").value = "Conditional Validation";
    ws.getCell("D49").value = "Data Validation";
    ws.getCell("E48").value = "'=Instructions!C12' cell will be highlighted with RED Color";
    ws.getCell('E48').alignment = {wrapText: true};
    ws.getCell("E49").value = "A Dialogbox will show up with the proper message";
    ws.getCell('E49').alignment = {wrapText: true};
    ws.getCell("C50").value = "Prefix";
    ws.getCell("D50").value = "Data Validation";
    ws.getCell("E50").value = "A Dialogbox will show up with the proper message";
    ws.getCell('E50').alignment = {wrapText: true};
    ws.getCell("C51").value = "Competency Class";
    ws.getCell("D51").value = "Data Validation";
    ws.getCell("E51").value = "Only 'Yes' or 'No' can be selected. A dialogbox will pop up with anything else is selected";
    ws.getCell('E51').alignment = {wrapText: true};
    ws.getCell("C52").value = "Health Area";
    ws.getCell("D52").value = "Data Validation";
    ws.getCell("E52").value = "If value entered doesn't match with any of the provided option, a dialogbox will popup";
    ws.getCell("E52").alignment = {wrapText: true};

    ws.mergeCells("B53:B61");
    ws.getCell("B53").value = "Template";
    ws.getCell("B53").alignment = {vertical: "middle"};
    ws.getCell("C53").value = "Structure";
    ws.getCell("D53").value = "Data Validation";
    ws.getCell("E53").value = "Either 'Section', 'question', 'label', or 'score' can be selected. A Dialogbox will show to select the proper valid option from the list.";
    ws.getCell("E53").alignment = {wrapText: true};

    ws.getCell("C54").value = "Critical Step and Compulsory column";
    ws.getCell("D54").value = "Data Validation";
    ws.getCell("E54").value = "Only 'Yes' or 'No' can be selected. A dialogbox will pop up with anything else is selected";
    ws.getCell("E54").alignment = {wrapText: true};

    ws.getCell("C55").value = "\"Value Type\n Option Set\n Legend\"\n";
    ws.getCell("C55").alignment = {wrapText: true};
    ws.getCell("D55").value = "Data Validation";
    ws.getCell("E55").value = "Only valid value can be entered\n";
    ws.getCell("E55").alignment = {wrapText: true};

    ws.getCell("C56").value = "Score Numerator & Score Denominator\n";
    ws.getCell("D56").value = "Data Validation";
    ws.getCell("E56").value = "Value should be numeric and should be greater than 0\n";
    ws.getCell("E56").alignment = {wrapText: true};

    ws.getCell("C57").value = "Form Name\n";
    ws.getCell("D57").value = "Conditional Validation";
    ws.getCell("E57").value = "Cell will be highlighted RED if corresponding Structure is present but form name is missing";
    ws.getCell("E57").alignment = {wrapText: true};

    ws.getCell("C58").value = "Feedback Order";
    ws.getCell("D58").value = "Conditional Validation";
    ws.getCell("E58").value = "If the Structure is score then a compositive indicator should be provided";
    ws.getCell("E58").alignment = {wrapText: true};

    ws.getCell("C59").value = "Feedback Order";
    ws.getCell("D59").value = "Conditional Validation";
    ws.getCell("E59").value = "If either Numerator or Denominator is present then Feedback order should be provided otherwise the corresponding cell will be highlighted RED";
    ws.getCell("E59").alignment = {wrapText: true};

    ws.getCell("C60").value = "Score Numerator & Score Denominator";
    ws.getCell("D60").value = "Conditional Validation";
    ws.getCell("E60").value = "If either of the score is present and other one is absent then the missing side will be highlighted RED";
    ws.getCell("E60").alignment = {wrapText: true};

    ws.getCell("C61").value = "Parent Question and Answer \n";
    ws.getCell("D61").value = "Conditional Validation";
    ws.getCell("E61").value = "If Parent Question is present, answer should exist and vice versa otherwise the missing cell will be highlighted RED";
    ws.getCell("E61").alignment = {wrapText: true};

    fillBackgroundToRange(ws, 'B47:E47', "FABF8F");

    ws.getCell("B63").value = `Please ensure this content is clean. Everything will appear in the program just as it is submitted to the server. The developers will not correct any spelling mistakes or spacing errors. `;

    ws.getCell("B65").value = `Once you're done with the configurations proceed by uploading this template to the Config Web App to process it.`;
    ws.getCell("B66").value = `After uploading please check that the content has been configured as expected using the preview, then save the changes.`;

    ws.getCell("B68").value = `Now we're done!`;
    ws.getCell("B68").style = {font: {bold: true}};

    ws.getCell("B69").value = `Test your configurations both on the web and the Android app, then make changes using this template if necessary.`;
    ws.getCell("B70").value = `Remember that once uploaded you can download a copy of this template from the server.`;

    applyBorderToRange(ws, 1, 26, 2, 40);
    applyBorderToRange(ws, 1, 47, 4, 61);
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
            formulae: ['ISERROR(VLOOKUP(C12,Mapping!R3:R100,1,FALSE))'],
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
      formulae: ['Mapping!$M$3:$M$43']
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
      formulae: yesNoValidator
    });
    dataValidation(ws, "E3:E3000", {
      type: 'list',
      allowBlank: true,
      formulae: yesNoValidator
    });
    dataValidation(ws, "F3:F3000", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$B$3:$B$11']
    });
    dataValidation(ws, "G3:G3000", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$H$3:$H$60']
    });
    dataValidation(ws, "H3:H3000", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$O$3:$O$9']
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
    //conditional formatting for structure=label
    ws.addConditionalFormatting({
      ref:'F3:F3000',
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
      ref:'F3:F3000',
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
      ref:'K3:K3000',
      rules:[
        {
          type: 'expression',
          formulae: ['OR(AND(OR(NOT(ISBLANK($I3)),NOT(ISBLANK($J3))), ISBLANK($K3)), AND($B3="score", ISBLANK($K3)))'],
          style: conditionalError
        }
      ]
    });
    //Conditional formatting checking incomplete scoring
    ws.addConditionalFormatting({
      ref:'I3:J3000',
      rules:[
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
    })
  }

  const populateConfiguration = async ws => {
    let dataRow = 3;
    if(props.Configures.length > 0) {
      props.Configures.forEach((configure) => {
        ws.getRow(dataRow).values = configure;
        ws.getCell("A" + dataRow).value = {formula: '_xlfn.IF(OR(INDIRECT(_xlfn.CONCAT("B",ROW()))="Section",ISBLANK(INDIRECT(_xlfn.CONCAT("B",ROW())))),"",_xlfn.IF(INDIRECT(_xlfn.CONCAT("B",ROW()))="score","",_xlfn.CONCAT("_S",COUNTIF(_xlfn.INDIRECT(CONCATENATE("B1:B",ROW())),"Section"),"Q",ROW()-ROW($B$1)-SUMPRODUCT(MAX(ROW(INDIRECT(_xlfn.CONCAT("B1:B",ROW())))*("Section"=INDIRECT(_xlfn.CONCAT("B1:B",ROW())))))+1)))'};
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

  const addMapping = async (ws) => {
    printArray2Column(ws, valueType, "Value Type", "B2", "b6d7a8");
    printArray2Column(ws, renderType, "Render Type", "D2", "b6d7a8");
    printArray2Column(ws, aggOperator, "Agg. Operator", "F2", "a2c4c9");
    printObjectArray(ws, props.optionData, "H2", "d5a6bd");
    printObjectArray(ws, props.healthAreaData, "L2", "d5a6bd")
    printObjectArray(ws, props.legendSetData, "O2", "9fc5e8");
    printObjectArray(ws, props.programData, "R2", "9fc5e8");
    await ws.protect(password);
  };

  const addReleaseNotes = async (ws) => {
    ws.columns = [
      { header: "Version", key: "version", width: 15},
      { header: "Date", key: "date", width: 12},
      { header: "New Features / Bug Fixes", key: "description", width: 100}
    ];

    ws.duplicateRow(1,1,false);

    for (let i = 1; i < 2; i++) {
      ws.getRow(i).value = [];
    }

    ws.getCell("A1").value = "Release Notes";
    ws.mergeCells("A1:C1");

    let row = 2;

    for (let i = 0; i < ReleaseNotes.length; i++) {
      row = row + 1;
      ws.getRow(row).values = ReleaseNotes[i];
    }

    ws.getColumn('version').alignment = {vertical: "middle"};
    ws.getColumn('date').alignment = {vertical: "middle"};
    ws.getColumn('description').alignment = {wrapText: true};
    applyBorderToRange(ws, 0, 2, 2, parseInt(ws.lastRow._number));
  }

  const hideColumns = ws => {
    ws.getColumn('program_stage_id').hidden = true;
    ws.getColumn('program_section_id').hidden = true;
    ws.getColumn('data_element_id').hidden = true;
  };

  const addProtection = async ws => {
    for (let i = 3; i <= 3000; i++) {
      ws.getRow(i).protection = {
        locked: false
      };
    }

    await ws.protect(password, {
      insertRows: true,
      deleteRows: true
    });
  };

  const enableCellEditing = async (ws, cells) => {
    cells.forEach((cell)=>{
      ws.getCell(cell).protection = {locked: false}
    });
  }

  const writeWorkbook = async wb => {
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `HNQIS Config_${new Date()}.xlsx`);

    props.setStatus("Download Template");
    props.isLoading(false);
  };

  initialize(); // return <>initialize()</>;

  return null;
};

export default Exporter;