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
    labelHighlighting,
    verticalMiddle
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
    addCreator,
    buildCellObject,
    generateBorderObject
} from "../../configs/ExcelUtils";
import { ReleaseNotesTracker } from "../../configs/ReleaseNotes";

const MAX_FORM_NAME_LENGTH = 200;
const MIN_FORM_NAME_LENGTH = 2;

const Exporter = ({
    programID, programPrefix, programName, programShortName, programTET, programCatCombo, programType, flag, stagesConfigurations, teaConfigurations, optionData, legendSetData, trackedEntityAttributesData, valueTypes, aggTypes, programData, isLoading, setFlag, setStatus
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
            addTEAConfigurations(teasWS);
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
        let editingCell;

        editingCell = buildCellObject(ws, "B2");
        editingCell.cell.value = "PROGRAM CONFIGURATION APP";
        editingCell.cell.style = { font: { size: 12, bold: true } };

        editingCell = buildCellObject(ws, "B3");
        editingCell.cell.value = "TRACKER AND EVENT PROGRAMS CONFIGURATION TEMPLATE";
        editingCell.cell.style = { font: { size: 12, bold: true } };


        editingCell = buildCellObject(ws, "B5:L5");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Instructions";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "BDD7EE");
        ws.getCell("B6").value = "This template has been designed for editing standard Tracker and Event Programs using the Program Configuration App (v1.7.0 and above).";
        ws.getCell("B7").value = "Please read carefully all the instructions contained in this file to avoid issues and unexpected results when importing it to a DHIS2 server.";

        editingCell = buildCellObject(ws, "B8");
        editingCell.cell.value = "Please keep in mind that this Template can only be used to edit existing DHIS2 Programs; Program creation is not supported.";
        editingCell.cell.style = { font: { color: { argb: 'FFC00000' } } };


        editingCell = buildCellObject(ws, "B10");

        editingCell.cell.value = "This template uses a color scheme to differentiate editable and read-only fields and columns:";
        editingCell.cell.style = { font: { bold: true } };


        fillBackgroundToRange(ws, "B12:B12", "BDD7EE");
        fillBackgroundToRange(ws, "C12:C12", "BFBFBF");
        applyBorderToRange(ws, 1, 12, 2, 12);
        ws.getCell("D12").value = "Automatically filled or read-only";
        fillBackgroundToRange(ws, "H12:H12", "E2EFDA");
        fillBackgroundToRange(ws, "I12:I12", "A6E3B7");
        applyBorderToRange(ws, 7, 12, 8, 12);
        ws.getCell("J12").value = "Editable or enabled for user input";


        editingCell = buildCellObject(ws, "B14:L14");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Configurations";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "BDD7EE");


        editingCell = buildCellObject(ws, "B16:F16");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "SERVER INFO";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;


        editingCell = buildCellObject(ws, "B17:C17");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "DHIS2 Server URL";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "D17:F17");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = location.origin;

        editingCell = buildCellObject(ws, "B18:C18");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "DHIS2 Server Version";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "D18:F18");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = localStorage.getItem('SERVER_VERSION');
        fillBackgroundToRange(ws, "B16:B18", "BDD7EE");


        editingCell = buildCellObject(ws, "B19:F20");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "The information displayed here corresponds to the server from which this Template was downloaded";
        editingCell.cell.style = { font: { color: { argb: 'FFC00000' } } };
        editingCell.cell.alignment = middleCenter;
        applyBorderToRange(ws, 1, 16, 5, 20);


        editingCell = buildCellObject(ws, "H16:L16");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "PROGRAM SETTINGS";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;

        editingCell = buildCellObject(ws, "H17:I17");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Program ID";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J17:L17");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programID;

        editingCell = buildCellObject(ws, "H18:I18");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Data Element Prefix";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J18:L18");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programPrefix;

        editingCell = buildCellObject(ws, "H19:I19");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Program";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J19:L19");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programName;

        editingCell = buildCellObject(ws, "H20:I20");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Program Short Name";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J20:L20");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programShortName;

        editingCell = buildCellObject(ws, "H21:I21");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Tracked Entity Type";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J21:L21");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programTET;

        editingCell = buildCellObject(ws, "H22:I22");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Category Combination";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J22:L22");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programCatCombo;

        editingCell = buildCellObject(ws, "H23:I23");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Program Type";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J23:L23");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = programType;
        fillBackgroundToRange(ws, "H16:H23", "BDD7EE");
        applyBorderToRange(ws, 7, 16, 11, 23);

        ws.getColumn("N").width = 70;

        editingCell = buildCellObject(ws, "N16:N16");
        editingCell.cell.value = "HELP";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "D9D9D9");
        ws.getCell("N17").value = "The DHIS2 ID of the Program that's being edited";
        ws.getCell("N18").value = "The prefix that the PCA automatically adds to the Program Data Elements";
        ws.getCell("N19").value = "The Name of the Program that's being edited";
        ws.getCell("N20").value = "The Short Name of the Program that's being edited";
        ws.getCell("N21").value = "Tracked Entity Type linked to the Program";
        ws.getCell("N22").value = "Category Combination of the Program that's being edited";
        ws.getCell("N23").value = "Program Type: Event/Tracker Program";
        fillBackgroundToRange(ws, "N17:N23", "F2F2F2");
        applyBorderToRange(ws, 13, 16, 13, 23);


        editingCell = buildCellObject(ws, "B25:L25");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Template Contents";
        editingCell.cell.style = { font: { bold: true } };
        fillBackgroundToRange(ws, editingCell.ref, "BDD7EE");


        editingCell = buildCellObject(ws, "B27:C27");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Tab Name";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "D27:F27");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Description";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "G27:I27");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Purpose";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J27:L27");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "How and when to use it";
        editingCell.cell.style = { font: { bold: true } };

        fillBackgroundToRange(ws, "B27:L27", "BDD7EE");


        ws.getRow(29).height = 270;
        ws.getRow(31).height = 150;
        ws.getRow(33).height = 120;
        ws.getRow(35).height = 105;
        ws.getRow(37).height = 120;
        ws.getRow(38).height = 90;
        ws.getRow(39).height = 90;

        editingCell = buildCellObject(ws, "B28:C31");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "TEAs";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;
        fillBackgroundToRange(ws, editingCell.ref, "FDE49B");

        editingCell = buildCellObject(ws, "D28:F31");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Program Tracked Entity Attributes Management.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "G28:I31");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "This tab contains the Tracked Entity Attributes assigned to the current Program.\n\nColumns B, D, E, F, G and H are read-only.These columns are used to provide additional information about the selected TEA.\n\nAny Duplicated values in Column C will be highlighted in red, allowing you to identify which ones need to be removed from the list.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J28:L28");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Adding new TEAs";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J29:L29");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "To add a new TEA to the Program, choose a blank cell in column B and select an option from the dropdown list. Note that columns B, D, E, F, G and H will be filled out with the metadata from the selected attribute, allowing you to verify if the selected TEA is the desired one.\nNext, you can define whether the new attribute is 'Mandatory', 'Searchable', or should 'Display in List'.\n\nFor columns from I to L, choose 'Yes' or 'No' accordingly.Keep in mind that if a cell remains blank, the default value is 'No'.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J30:L30");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Removing a TEA";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J31:L31");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "If you want to remove an existing Tracked Entity Attribute from the current program, you just need to delete the entire row. When importing this template into the Program Configuration App, missing rows will be treated as elements to be removed from the Program's current configuration.";
        editingCell.cell.alignment = { ...verticalMiddle };


        editingCell = buildCellObject(ws, "B32:C37");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Stages\n(Names may vary) ";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;
        fillBackgroundToRange(ws, editingCell.ref, "D1F1DA");

        editingCell = buildCellObject(ws, "D32:F37");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "A Tab is generated for every Program Stage available.\n\nEach Tab is used for the corresponding Program Stage management.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "G32:I34");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "If this is an Event Program, only one Tab will be enabled for you to edit the contents of the Data Entry form.\n\nIf this is a Tracker Program, a Tab will be enabled for each available Program Stage so you can customise each stage separately.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "G35:I37");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Please keep in mind that this Template can only be used to edit existing Program Stages; Program Stage creation is not supported. If you need to create new Program Stages, please use the PCA Program Stage Creation feature and download the Template again.";
        editingCell.cell.style = { font: { color: { argb: 'FFC00000' } } };
        editingCell.cell.alignment = { ...verticalMiddle };


        editingCell = buildCellObject(ws, "J32:L32");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Adding new Data Elements/Sections";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J33:L33");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Insert a new row where you want to add a new Data Element or start a new Section. Use the Structure column (B) to define whether the new row is a Data Element or the start of a Section.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J34:L34");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Removing a Data Element/Section";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J35:L35");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "To remove a Data Element or Section from the Program Stage, delete the entire row (not just its contents). The PCA will detect the missing item is and handle its removal.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J36:L36");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Adding existing Data Elements";
        editingCell.cell.style = { font: { bold: true } };

        editingCell = buildCellObject(ws, "J37:L37");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "This template does not support the insertion of existing Data Elements from a DHIS2 Server.\n\nTo add existing Data Elements please make use of the PCA features directly.";
        editingCell.cell.style = { font: { color: { argb: 'FFC00000' } } };
        editingCell.cell.alignment = { ...verticalMiddle };


        editingCell = buildCellObject(ws, "B38:C38");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Release Notes";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;
        fillBackgroundToRange(ws, editingCell.ref, "D9E7FD");

        editingCell = buildCellObject(ws, "D38:F38");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "PCA Tracker and Event Programs Template Release Notes history.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "G38:I38");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "This Tab contains the Release History of the Configuration Template, providing details about the most prominent features included with each release.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J38:L38");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "The Release Notes Tab is protected, so you're not allowed to edit its contents. However, you're allowed to view its contents.";
        editingCell.cell.alignment = { ...verticalMiddle };


        editingCell = buildCellObject(ws, "B39:C39");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "Mapping";
        editingCell.cell.style = { font: { bold: true } };
        editingCell.cell.alignment = middleCenter;
        fillBackgroundToRange(ws, editingCell.ref, "FBDAD7");

        editingCell = buildCellObject(ws, "D39:F39");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "A Tab used to store the Export Server Metadata for use in the current Template.";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "G39:I39");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "This Tab contains the necessary metadata exported from the server where this template was downloaded from (Check Server URL in the current Tab).";
        editingCell.cell.alignment = { ...verticalMiddle };

        editingCell = buildCellObject(ws, "J39:L39");
        ws.mergeCells(editingCell.ref);
        editingCell.cell.value = "The Mapping Tab is protected, so you're not allowed to edit its contents. However, you're allowed to view its contents.";
        editingCell.cell.alignment = { ...verticalMiddle };

        applyBorderToRange(ws, 1, 27, 11, 39);


        applyBorderToRange(ws, 9, 28, 11, 28, generateBorderObject("1101"));
        applyBorderToRange(ws, 9, 29, 11, 29, generateBorderObject("0101"));

        applyBorderToRange(ws, 9, 30, 11, 30, generateBorderObject("0101"));
        applyBorderToRange(ws, 9, 31, 11, 31, generateBorderObject("0111"));

        applyBorderToRange(ws, 6, 32, 8, 32, generateBorderObject("1101"));
        applyBorderToRange(ws, 6, 35, 8, 35, generateBorderObject("0111"));

        applyBorderToRange(ws, 9, 32, 11, 32, generateBorderObject("1101"));
        applyBorderToRange(ws, 9, 33, 11, 33, generateBorderObject("0101"));

        applyBorderToRange(ws, 9, 34, 11, 34, generateBorderObject("0101"));
        applyBorderToRange(ws, 9, 35, 11, 35, generateBorderObject("0101"));

        applyBorderToRange(ws, 9, 36, 11, 36, generateBorderObject("0101"));
        applyBorderToRange(ws, 9, 37, 11, 37, generateBorderObject("0111"));

        await ws.protect(password);
    };

    const addTEAConfigurations = ws => {
        ws.columns = [{
            header: "Structure",
            key: "structure",
            width: 15
        }, {
            header: "UID",
            key: "uid",
            width: 15
        }, {
            header: "Name",
            key: "name",
            width: 45
        }, {
            header: "Form name",
            key: "form_name",
            width: 45
        }, {
            header: "Short Name",
            key: "short_name",
            width: 30
        }, {
            header: "Description",
            key: "description",
            width: 30
        }, {
            header: "Value Type",
            key: "value_type",
            width: 15
        }, {
            header: "Aggregation Type",
            key: "aggregation_type",
            width: 30
        }, {
            header: "Mandatory",
            key: "mandatory",
            width: 15
        }, {
            header: "Searchable",
            key: "searchable",
            width: 15
        }, {
            header: "Display in List",
            key: "display_in_list",
            width: 15
        }, {
            header: "Allow Future Date",
            key: "allow_future_date",
            width: 15
        }, {
            header: "Program Section Id",
            key: "program_section_id",
            width: 1
        }];
        fillBackgroundToRange(ws, "A1:A1", "E2EFDA");
        fillBackgroundToRange(ws, "B1:B1", "BDD7EE");
        fillBackgroundToRange(ws, "C1:C1", "E2EFDA");
        fillBackgroundToRange(ws, "D1:H1", "BDD7EE");
        fillBackgroundToRange(ws, "I1:N1", "E2EFDA");
        applyBorderToRange(ws, 0, 0, 12, 2);
        //addValidation(ws);
        //addConditionalFormatting(ws);
        //populateConfiguration(ws);
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