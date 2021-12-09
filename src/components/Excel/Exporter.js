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
  sectionHighlighting
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

    ws.getCell("B7").value = "Define program configuration";
    ws.getCell("B7").style = {font: {bold: true}};
    ws.getCell("B8").value = "The following information will be used to configure the checklist as a DHIS2 program compatible with HNQIS 2.0";
    ws.getCell("B9").value = "Note: Some fields are filled automatically when the template is downloaded from a server.";

    ws.mergeCells('B11:C11');
    ws.getCell("B11").value = "Program Details";
    ws.getCell("B12").value = "Program Name";
    ws.getCell("B13").value = "Use 'Competency Class'";
    ws.getCell("B14").value = "DE Prefix";
    ws.getCell("B15").value = "Health Area";

    ws.mergeCells('F11:H11');
    ws.getCell('F11').value = "Help";
    ws.getCell("F11").style = {font: {bold: true}};
    fillBackgroundToRange(ws, "F11:H11", "bfbfbf");
    ws.getCell("F12").value = "Program Name: The name that will be assigned to the checklist.";
    ws.getCell("F13").value = "Use 'Competency Class': This will determine if competency classes will be included in the program";
    ws.getCell("F14").value = "DE Prefix: A prefix that will be added to every Data Element in DHIS2, this is used to filter information."
    ws.getCell("F15").value = "Health Area: The Health Area where the checklist will be assigned, used for filtering.";
    fillBackgroundToRange(ws, "F12:H15", "f2f2f2");

    ws.getCell("B16").value = "*All the fields are required";
    ws.getCell("B16").style = {font: {color: {'argb': 'ff0000'}}}
    ws.getCell("B18").value = "This information won't change anything in this template, however, it will be used when creating program in DHIS2."

    ws.getCell("B11").style = {font: {bold: true, size: 10}};
    fillBackgroundToRange(ws, "B11:C11", "6fa8dc");
    applyStyleToRange(ws, 'B12:B15', {font: {bold: true, size: 10}});
    fillBackgroundToRange(ws, "B12:B15", "9fc5e8");
    fillBackgroundToRange(ws, 'C12:C15', "cfe2f3");

    ws.getCell("D12").value = {formula: "=VLOOKUP(C12, Mapping!R3:S300,2,FALSE)"};
    ws.getCell('C12').value = props.programName;
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
    ws.getRow("26").height = 32;
    ws.getCell("C26").value = `[Question & Label Only]\r\n Indentifier to use as reference in the "Parent question" column. This field is generated automatically when certain conditions are met.`;

    ws.getCell('B27').value = "Structure";
    ws.getCell("B27").style = {font: {bold: true}};
    ws.getCell("B27").alignment = {vertical: "middle"};
    ws.mergeCells('C27:F27');
    ws.getCell('C27').alignment = {wrapText: true};
    ws.getRow("27").height = 115;
    ws.getCell("C27").value = `Determines what is being configured in the row. The value in this column will define which validations are applied to the row. \n The possible structure values are:\n Section - Defines a section in the assessment, all the rows under it will create Data Elements contained in the section until another ""Section"" row is defined.\n Question - Defines a question Data Element that can be answered in some way (text field, numeric field, opton set, etc.).\n Label - Defines a label Data Element, usually these are used to display instructions or help text.\n Score - Defines a score Data Element that will contain the value of the score calculations.`;

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
    ws.getRow("30").height = 48;
    ws.getCell("C29").value = `[Question Only] \n Scores are divided in critical and non-critical, this is mostly used for the ""competency classification"" but can also be used in other types of classification in analytics as well. A critical step will count for the critical score. Select ""Yes"" if you want to define a critical question.`;

    ws.getCell('B30').value = "Compulsory";
    ws.getCell("B30").style = {font: {bold: true}};
    ws.getCell("B30").alignment = {vertical: "middle"};
    ws.mergeCells('C30:F30');
    ws.getCell('C30').alignment = {wrapText: true};
    ws.getRow("30").height = 30;
    ws.getCell("C30").value = `[Question Only] \n A compulsory question must be answered to complete an assessment. Select ""Yes"" if you want define a mandatory question.`;

    fillBackgroundToRange(ws, 'B29:B30', "f4cccc");

    ws.getCell('B31').value = "Value Type";
    ws.getCell("B31").style = {font: {bold: true}};
    ws.getCell("B31").alignment = {vertical: "middle"};
    ws.mergeCells("C31:F31");
    ws.getCell("C31").value = `[Question, Label & Score]`;

    ws.getCell('B32').value = "Option Set";
    ws.getCell("B32").style = {font: {bold: true}};
    ws.getCell("B32").alignment = {vertical: "middle"};
    ws.mergeCells("C32:F32");
    ws.getCell("C32").value = `[Question Only]`;

    ws.getCell('B33').value = "Legend";
    ws.getCell("B33").style = {font: {bold: true}};
    ws.getCell("B33").alignment = {vertical: "middle"};
    ws.mergeCells("C33:F33");
    ws.getCell("C33").value = `[Question Only]`;

    fillBackgroundToRange(ws, 'B31:B33', "d9ead3");

    ws.getCell('B34').value = "Score Numerator";
    ws.getCell("B34").style = {font: {bold: true}};
    ws.getCell("B34").alignment = {vertical: "middle"};
    ws.mergeCells("C34:F34");
    ws.getCell("C34").value = `[Question Only]`;

    ws.getCell('B35').value = "Score Denominator";
    ws.getCell("B35").style = {font: {bold: true}};
    ws.getCell("B35").alignment = {vertical: "middle"};
    ws.mergeCells("C35:F35");
    ws.getCell("C35").value = `[Question Only]`;

    ws.getCell('B36').value = "Compositive indicator (Feedback Order)";
    ws.getCell("B36").style = {font: {bold: true}};
    ws.getCell("B36").alignment = {vertical: "middle"};
    ws.mergeCells("C36:F36");
    ws.getCell("C36").value = `[Question, Label & Score]`;

    fillBackgroundToRange(ws, 'B34:B36', "fff2cc");

    ws.getCell('B37').value = "Parent Question";
    ws.getCell("B37").style = {font: {bold: true}};
    ws.getCell("B37").alignment = {vertical: "middle"};
    ws.mergeCells("C37:F37");
    ws.getCell("C37").value = ``;

    ws.getCell('B38').value = "Answer Value";
    ws.getCell("B38").style = {font: {bold: true}};
    ws.getCell("B38").alignment = {vertical: "middle"};
    ws.mergeCells("C38:F38");
    ws.getCell("C38").value = ``;

    fillBackgroundToRange(ws, 'B37:B38', "c9daf8");

    ws.getCell('B39').value = "Feedback Text";
    ws.getCell("B39").style = {font: {bold: true}};
    ws.getCell("B39").alignment = {vertical: "middle"};
    ws.mergeCells("C39:F39");
    ws.getCell("C39").value = ``;

    ws.getCell('B40').value = "Description";
    ws.getCell("B40").style = {font: {bold: true}};
    ws.getCell("B40").alignment = {vertical: "middle"};
    ws.mergeCells("C40:F40");
    ws.getCell("C40").value = ``;

    applyBorderToRange(ws, 1, 26, 2, 40);
    instructionValidations(ws);
    enableCellEditing(ws, ['C12', 'D12', 'C13', 'C14', 'C15']);
    await ws.protect(password);
  };

  const instructionValidations = (ws) => {
    dataValidation(ws, "C12", {
      type: 'textLength',
      operator: 'lessThan',
      showErrorMessage: true,
      error: 'Program name exceeds 225 characters',
      errorTitle: 'Invalid Length',
      allowBlank: true,
      formulae: [226]
    });
    dataValidation(ws, "C11", {
      type: 'textLength',
      operator: 'lessThan',
      showErrorMessage: true,
      error: 'DE Prefix exceeds 2 characters',
      errorTitle: 'Invalid Length',
      allowBlank: true,
      formulae: [3]
    });
    dataValidation(ws, "C13", {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      error: 'Please select the valid option from the List',
      errorTitle: 'Invalid option',
      formulae: yesNoValidator
    });
    dataValidation(ws, "C15", {
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
      key: "critical_step",
      width: 14
    }, {
      header: "Compulsory",
      key: "compulsory",
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
      width: 22
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
      critical_step: "A critical step will count for the critical score",
      compulsory: "A compulsory question must be answered to complete an assessment",
      value_type: `Determines the type of input if there's no Option Set selected`,
      optionSet: `Select the option set that provides available answers for this question (forces Value Type)`,
      legend: "Select the legend that will be applied to the question",
      score_numerator: "Numerator for scores calculation",
      score_denominator: "Denominator for scores calculation",
      compositive_indicator: "This number will generate the feedback tree in the app, accepted values are:1, 1.1, 1.1.1, 1.1.2, 1.1..., 1.2, etc.  [See more]",
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
    //conditional formatting for structure=label and Value type <> LONG TEXT
    ws.addConditionalFormatting({
      ref:'F3:F3000',
      rules: [
        {
          type: 'expression',
          formulae: ['AND($B3="label", $F3<>"LONG_TEXT")'],
          style: conditionalError
        }
      ]
    });
    //conditional formatting for structure=scores and valuetype=NUMBER
    ws.addConditionalFormatting({
      ref:'F3:F3000',
      rules: [
        {
          type: 'expression',
          formulae: ['AND($B3="score", $F3<>"NUMBER")'],
          style: conditionalError
        }
      ]
    });
    //conditional formatting checking Feedback order if either score (numerator or denominator is available)
    ws.addConditionalFormatting({
      ref:'K3:K3000',
      rules:[
        {
          type: 'expression',
          formulae: ['AND(OR(NOT(ISBLANK($I3)),NOT(ISBLANK($J3))), ISBLANK($K3))'],
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
    ws.addConditionalFormatting({
      ref: 'A3:R3000',
      rules: [
        {
          type: 'expression',
          formulae: ['$B3 = "Section"'],
          style: sectionHighlighting
        }
      ]
    })
  }

  const populateConfiguration = async ws => {
    let dataRow = 3;
    props.Configures.forEach((configure) => {
      ws.getRow(dataRow).values = configure;
      ws.getCell("A"+dataRow).value = {formula:'_xlfn.IF(INDIRECT(_xlfn.CONCAT("B",ROW()))="Section","",_xlfn.CONCAT("_S",COUNTIF(_xlfn.INDIRECT(CONCATENATE("B1:B",ROW())),"Section"),"Q",ROW()-ROW($B$1)-SUMPRODUCT(MAX(ROW(INDIRECT(_xlfn.CONCAT("B1:B",ROW())))*("Section"=INDIRECT(_xlfn.CONCAT("B1:B",ROW())))))+1))'};
      if (configure.structure === "Section") {
        fillBackgroundToRange(ws, "A"+dataRow+":R"+dataRow, "f8c291")
      }
      dataRow = dataRow + 1;
    });
    applyBorderToRange(ws, 0, 3, 14, dataRow - 1);
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
    for (let i = 3; i <= 500; i++) {
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

    props.setStatus("Download");
    props.isLoading(false);
  };

  initialize(); // return <>initialize()</>;

  return null;
};

export default Exporter;