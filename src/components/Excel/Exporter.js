import React from 'react';
import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js';
import { saveAs } from 'file-saver';
import { activeTabNumber, valueType, renderType, aggOperator, middleCenter, template_password, structureValidator, yesNoValidator, conditionalError } from "../../configs/TemplateConstants";
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
    ws.getCell("B4").value = "By using this spreadsheet you'll be able to configure the structure of the DHIS2 checklist. Make sure you understa how to work wiht the tools integrated in this spreadsheet before you continue working.";
    ws.getCell("B6").value = "Define program configuration";
    ws.getCell("B6").style = {font: {bold: true}};
    ws.getCell("B7").value = "The following information will be used to configure the checklist as a DHIS2 program compatible with HNQIS 2.0";
    
    ws.mergeCells('B8:C8');
    ws.getCell("B8").value = "Program Details";

    ws.getCell("B10").value = "Use 'Competency Class'";
    ws.getCell("B11").value = "DE Prefix";
    ws.getCell("B12").value = "Health Area";
    ws.getCell("B14").value = "Program Name: The name that will be assigned to the checklist.";
    ws.getCell("B15").value = "Use 'Competency Class': This will determine if competency classes will be included in the program";
    ws.getCell("B16").value = "DE Prefix: A prefix that will be added to every Data Element in DHIS2, this is used to filter information."
    ws.getCell("B17").value = "Health Area: The Health Area where the checklist will be assigned, used for filtering.";
    ws.getCell("B19").value = "This information won't change anything in this template, however, it will be used when creating program in DHIS2."

    ws.getCell("B8").style = {font: {bold: true, size: 10}};
    fillBackgroundToRange(ws, "B8:C8", "6fa8dc");
    applyStyleToRange(ws, 'B9:B12', {font: {bold: true, size: 10}});
    fillBackgroundToRange(ws, "B9:B12", "9fc5e8");
    fillBackgroundToRange(ws, 'C9:C12', "cfe2f3");

    ws.getCell("D9").value = {formula: "=VLOOKUP(C9, Mapping!R3:S300,2,FALSE)"};
    ws.getCell('C9').value = props.programName;
    ws.getCell("D9").style = {font: {color: {'argb': 'ffffff'}}}

    instructionValidations(ws);
    enableCellEditing(ws, ['C9', 'D9', 'C10', 'C11', 'C12']);
    await ws.protect(password);
  };

  const instructionValidations = (ws) => {
    ws.getCell("B9").value = "Program Name";
    dataValidation(ws, "C9", {
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
    dataValidation(ws, "C10", {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      error: 'Please select the valid option from the List',
      errorTitle: 'Invalid option',
      formulae: yesNoValidator
    });
    dataValidation(ws, "C12", {
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
      parent_name: "",
      structure: "",
      form_name: "Question text that will be displayed in the assessment",
      critical_step: "A critical step will count for the critical score",
      compulsory: "A compulsory question must be answered to complete an assessment",
      value_type: "Specify the value type of the question",
      optionSet: "Select the option set that provides available answers for this question",
      legend: "Select the legend that will be applied to the question",
      score_numerator: "",
      score_denominator: "",
      compositive_indicator: "This number will generate the feedback tree in the app, accepted values are:1, 1.1, 1.1.1, 1.1.2, 1.1..., 1.2, etc.  [See more]",
      parent_question: "Select the Parent Name of the question that will act as parent",
      answer_value: "Select the option that will show the question",
      feedback_text: "Text that will be displayed in the Feedback app for each question",
      description: "Enter the help text that will display to the supervisor during data entry",
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