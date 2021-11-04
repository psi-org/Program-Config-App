import React from 'react';
import ExcelJS from 'exceljs/dist/es5/exceljs.browser.js';
import { saveAs } from 'file-saver';
import { activeTabNumber, valueType, renderType, aggOperator, thinBorder, middleCenter } from "../../configs/TemplateConstants";
import { fillBackgroundToRange, printArray2Column, applyBorderToRange, dataValidation, printObjectArray } from "../../configs/ExcelUtils";
import { useDataQuery } from '@dhis2/app-service-data';
import { arrayObjectToStringConverter } from '../../configs/Utils';
import { NoticeBox, CircularLoader } from "@dhis2/ui";
const optionSetQuery = {
  results: {
    resource: 'optionSets',
    params: {
      fields: ['id', 'name', 'options[name]'],
      filters: ['name:like:HNQIS - ']
    }
  }
};

const healthAreasQuery = {
  results: {
    resource: 'optionSets',
    params: {
      fields: ['name', 'options[id]','options[name]'],
      filters: ['name:$like:Health%20area']
    }
  }
};

const legentSetsQuery = {
  results: {
    resource: 'legendSets',
    params: {
      fields: ['id','name'],
      filter: ['name:$like:HNQIS']
    }
  }
}

const Configuration = ({ps}) => {
  const programStage = ps;
  const password = "TOyNrNrH8fNT8W%Au&4A";

  const { loading: loading, error: error, data: data} = useDataQuery(optionSetQuery);
  const { loading: haLoading, error: haError, data: haData } = useDataQuery(healthAreasQuery);
  const { loading: lsLoading, error: lsError, data: lsData } = useDataQuery(legentSetsQuery);
  
  let Configures = [];

  const initialize = () => {
    compile_report();
    setTimeout(function () {
      generate();
    }, 2000);
  };

  const compile_report = () => {
    let program_stage_id = programStage.id;
    programStage.programStageSections.forEach((programSection) => {
      let program_section_id = programSection.id;
      let row = {};
      row.structure = "Section";
      row.form_name = programSection.displayName;
      Configures.push(row);
      programSection.dataElements.forEach((dataElement) => {
        let row = {};
        row.form_name = dataElement.displayName;
        row.value_type = dataElement.valueType;
        row.optionSet = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : '';
        row.legend = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : '';

        row.program_stage_id = program_stage_id;
        row.program_section_id = program_section_id;
        row.data_element_id = dataElement.id;

        let critical = dataElement.attributeValues.filter(av => av.attribute.id === "NPwvdTt0Naj");
        row.critical = (critical.length > 0) ? critical[0].value : '';

        let metaDataString = dataElement.attributeValues.filter(av => av.attribute.id === "haUflNqP85K");
        let metaData = (metaDataString.length > 0) ? JSON.parse(metaDataString[0].value) : '';

        row.structure = (typeof metaData.elemType !== 'undefined') ? metaData.elemType : '';
        row.parent_name = (typeof metaData.parentVarName !== 'undefined') ? metaData.parentVarName : '';
        row.score_numerator = (typeof metaData.scoreNum !== 'undefined') ? metaData.scoreNum: '';
        row.score_denominator = (typeof metaData.scoreDen !== 'undefined') ? metaData.scoreDen : '';

        let compositiveIndicator = dataElement.attributeValues.filter(av => av.attribute.id === "LP171jpctBm");
        row.compositive_indicator = (compositiveIndicator.length > 0) ? compositiveIndicator[0].value : '';

        let feedbackText = dataElement.attributeValues.filter(av => av.attribute.id === "yhKEe6BLEer");
        row.feedback_text = (feedbackText.length > 0) ? feedbackText[0].value : '';

        row.compulsory = getCompulsoryStatusForDE(dataElement.id);
        Configures.push(row);
      });
    });
  };

  const getCompulsoryStatusForDE = (dataElement_id) => {
    let de = programStage.programStageDataElements.filter( psde => psde.dataElement.id === dataElement_id);
    return (de.length > 0) ? de[0].compulsory : false;
  }

  const generate = () => {
    const workbook = new ExcelJS.Workbook();
    addCreator(workbook);
    const instructionWS = workbook.addWorksheet("Instructions");
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
    hideColumns(templateWS);
    addProtection(templateWS);
    writeWorkbook(workbook);
  };

  const addCreator = wb => {
    wb.creator = 'Utsav Ashish Koju';
    wb.created = new Date();
  };

  const addInstructions = async ws => {
    ws.getCell("A1").value = "Instruction";
    ws.getCell("A2").value = "(WIP)";
    await ws.protect(password);
  };

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
    const subHeader = {
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
    ws.getRow(2).values = subHeader;
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
    dataValidation(ws, "B3:B300", {
      type: 'list',
      allowBlank: true,
      formulae: ['"Section,Label"']
    });
    dataValidation(ws, "D3:D300", {
      type: 'list',
      allowBlank: true,
      formulae: ['"Yes,No"']
    });
    dataValidation(ws, "E3:E300", {
      type: 'list',
      allowBlank: true,
      formulae: ['"Yes,No"']
    });
    dataValidation(ws, "F3:F300", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$B$3:$B$11']
    });
    dataValidation(ws, "G3:G300", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$H$3:$H$60']
    });
    dataValidation(ws, "H3:H300", {
      type: 'list',
      allowBlank: true,
      formulae: ['Mapping!$O$3:$O$9']
    });
    populateConfiguration(ws);
  };

  const populateConfiguration = async ws => {
    let dataRow = 3;
    Configures.forEach((configure) => {
      ws.getRow(dataRow).values = configure;
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
    
    addOptionSets(ws);
    addHealthAreas(ws);
    addLegendSets(ws);

    await ws.protect(password);
  };

  const addOptionSets = (ws) => {
    let optionData = [];
    console.log("data: ", data)
    if(typeof data !== 'undefined')
    {
      let optionSets = data.results.optionSets;
      optionSets.forEach((optionSet) => {
        let options = arrayObjectToStringConverter(optionSet.options, "name");
        let data = {
          "Option Sets": optionSet.name,
          "UID": optionSet.id,
          "Options": options
        };
        optionData.push(data);
      });
      printObjectArray(ws, optionData, "H2", "d5a6bd");
    }
    
  };

  const addHealthAreas = (ws) => {
    let healthAreaData = [];
    console.log("haData: ", haData);
    if(typeof haData !== 'undefined')
    {
      console.log("haData: ", haData.results);
      const healthAreas = haData.results.optionSets;
      healthAreas.forEach((ha) => {
        ha.options.forEach((option) => {
          let data = {
            "Code": option.id,
            "Health Area": option.name
          };
          healthAreaData.push(data);
        });
      });
      printObjectArray(ws, healthAreaData, "L2", "d5a6bd")
    }
  }

  const addLegendSets = (ws) => {
    let legendSetData = [];
    console.log("fetching legendset: ", lsData);
    if(typeof lsData !== 'undefined')
    {
      console.log("lsData: ", lsData.results);
      let legendSets = lsData.results.legendSets;
      legendSets.forEach((legendSet) => {
        let data = {
            "Legend Set" : legendSet.name,
            "UID" : legendSet.id
          };
          legendSetData.push(data);
      })
      printObjectArray(ws, legendSetData, "O2", "9fc5e8");
    }
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

  const writeWorkbook = async wb => {
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `HNQIS Config_${new Date()}.xlsx`);
  };

  const getValueForAttribute = async (attributeValues, attribute_id) => {
    attributeValues.forEach(a => {
      if (a.attribute.id === attribute_id) {
        return a.value;
      }
    });
  };

  initialize(); // return <>initialize()</>;

  return null;
};

export default Configuration;
