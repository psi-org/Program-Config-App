import { useState } from "react";
import ExcelJS from "exceljs/dist/es5/exceljs.browser";
import NoticesBox from "../UIElements/NoticesBox";
import { ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, Button, NoticeBox, Tag } from "@dhis2/ui";
import { validWorksheets, validTemplateHeader } from "../../configs/TemplateConstants";
import {readTemplateData} from '../STG_Details/importReader';


const Importer = (props) => {
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [currentTask, setCurrentTask] = useState(undefined);
    const [executedTasks, setExecutedTasks] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [isNotificationError, setNotificationError] = useState(false);

    const [importSummary,setImportSummary] = useState(false);

    const setFile = (files) => {
        setSelectedFile(files[0]);
    }

    const addExecutedTask = (Task) => {
        setExecutedTasks(executedTasks => [...executedTasks, Task]);
    }

    function hideForm() {
        props.displayForm(false);
    }

    const startImportProcess = () => {
        setExecutedTasks([]);
        setButtonDisabled(true);
        //1. Form Validation
        if (typeof selectedFile !== 'undefined') {
            //2. Validated File Type
            fileValidation(function (status) {
                if (status) {
                    const workbook = new ExcelJS.Workbook();
                    const reader = new FileReader();

                    reader.readAsArrayBuffer(selectedFile)
                    reader.onload = () => {
                        const buffer = reader.result;
                        workbook.xlsx.load(buffer).then(workbook => {
                            workbookValidation(workbook, function (status) {
                                if (status) {
                                    const templateWS = workbook.getWorksheet('Template');
                                    const instructionWS = workbook.getWorksheet('Instructions');
                                    const mappingWS = workbook.getWorksheet('Mapping');
                                    const mappingDetails = getMappingList(mappingWS);
                                    const programDetails = getProgramDetails(instructionWS, mappingDetails);

                                    const headers = templateWS.getRow(1).values;
                                    headers.shift();
                                    worksheetValidation(headers, function (status) {
                                        if (status) {
                                            var task = { step:4, name: "Extracting data from XLSX", status: "success" };
                                            setCurrentTask(task.name);
                                            let templateData = [];
                                            let dataRow = 3;
                                            templateWS.eachRow((row, rowIndex) => {
                                                if (rowIndex >= dataRow) {
                                                    let dataRow = {};
                                                    let rowVals = row.values;
                                                    validTemplateHeader.forEach((header, index) => {
                                                        //if(index === 0) dataRow[header] = rowVals[index+1].result;
                                                        //else dataRow[header] = rowVals[index + 1];
                                                        dataRow[header] = rowVals[index + 1];
                                                    })
                                                    templateData.push(dataRow);
                                                }
                                            });
                                            addExecutedTask(task);
                                            setCurrentTask(null);

                                            // Start import reading

                                            //console.log("Data: ", templateData);

                                            //let {importedSections,importedScores,importSummaryValues} = readTemplateData(templateData,props.previous);
                                            //let {importedSections,importedScores,importSummaryValues} = readTemplateData(templateData,props.previous,"PREFIX",[],[]);
                                            let {importedSections,importedScores,importSummaryValues} = readTemplateData(templateData,props.previous,programDetails.dePrefix,mappingDetails.optionSets,mappingDetails.legendSets);
                                            // console.log(importedSections);
                                            // console.log(importedScores);
                                            // console.log(importSummaryValues);
                                            // console.log(programDetails);
                                            // console.log(mappingDetails);
                                            importSummaryValues.program = programDetails;
                                            importSummaryValues.mapping = mappingDetails;

                                            // Set new sections & questions
                                            setImportSummary(importSummaryValues);
                                            props.setImportResults(importSummaryValues);
                                            props.setSaveStatus('Validate & Save');

                                            var newScoresSection = props.previous.scoresSection;
                                            newScoresSection.dataElements = importedScores;

                                            props.previous.setSections(importedSections);
                                            props.previous.setScoresSection(newScoresSection);

                                            let programMetadata_new = props.programMetadata.programMetadata;
                                            programMetadata_new.dePrefix = programDetails.dePrefix;
                                            programMetadata_new.useCompetencyClass = programDetails.useCompetencyClass;
                                            programMetadata_new.healthArea = mappingDetails.healthAreas.find(ha => ha.name == programDetails.healthArea)?.code;
                                            props.programMetadata.setProgramMetadata(programMetadata_new);
                                        }
                                    })
                                }

                            })
                        });
                    }
                }

            });
        }
        setButtonDisabled(false);
    }

    const getProgramDetails = (ws, mappingDetails) => {
        let program = {};
        program.name = ws.getCell("C12").value;
        program.shortName = ws.getCell("C13").value;
        let result = mappingDetails.programs.filter(prog => prog.name === program.name);
        program.id = result[0].id;

        program.useCompetencyClass = ws.getCell("C14").value;
        program.dePrefix = ws.getCell("C15").value;
        program.healthArea = ws.getCell("C16").value;
        return program;
    }

    const getMappingList = (ws) => {
        let mapping = {};
        mapping.optionSets = [];
        mapping.legendSets = [];
        mapping.programs = [];

        mapping.optionSets = getOptionSets(ws);
        mapping.legendSets = getLegendSets(ws);
        mapping.healthAreas = getHealthAreas(ws);
        mapping.programs = getProgramsMap(ws);
        return mapping;
    }

    const getOptionSets = (ws) => {
        let i = 3;
        let optionSets = [];
        while(ws.getCell("I"+i).value !== null) {
            let option = {};
            option.id = ws.getCell("I"+i).value;
            option.optionSet = ws.getCell("H"+i).value;
            optionSets.push(option);
            i++;
        }
        return optionSets;
    }

    const getHealthAreas = (ws) => {
        let i = 3;
        let healthAreas = [];
        while(ws.getCell("L"+i).value !== null) {
            let healthArea = {};
            healthArea.code = ws.getCell("L"+i).value;
            healthArea.name = ws.getCell("M"+i).value;
            healthAreas.push(healthArea);
            i++;
        }
        return healthAreas;
    }

    const getLegendSets = (ws) => {
        let i = 3;
        let legendSets = [];
        while(ws.getCell("P"+i).value !== null)
        {
            let legend = {};
            legend.id = ws.getCell("P"+i).value;
            legend.legendSet = ws.getCell("O"+i).value;
            legendSets.push(legend);
            i++;
        }
        return legendSets
    }

    const getProgramsMap = (ws) => {
        let i = 3;
        let programs = [];
        while(ws.getCell("R"+i).value !== null)
        {
            let program = {};
            program.id = ws.getCell("S"+i).value;
            program.name = ws.getCell("R"+i).value;
            programs.push(program);
            i++;
        }
        return programs
    }

    const fileValidation = (callback) => {
        var task = { step: 1, name: "Validating File Type - XLSX", status: "error" };
        setCurrentTask(task.name);
        let status = false;
        if (selectedFile.name.endsWith('xlsx')) {
            task.status = "success";
            status = true;
        } else {
            setNotificationError(true);
        }
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }

    const workbookValidation = (workbook, callback) => {
        var task = { step: 2, name: "Validating worksheet in the workbook", status: "success" };
        setCurrentTask(task.name);
        let status = true;
        validWorksheets.forEach((worksheet, index) => {
            if (worksheet !== workbook.getWorksheet(index + 1).name) {
                task.status = "error";
                status = false;
                setNotificationError(true);
            }
        });
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }

    const worksheetValidation = (headers, callback) => {
        var task = { step: 3, name: "Validating worksheet columns", status: "success" };
        setCurrentTask(task.name);
        let status = true;
        headers.forEach((value, key) => {
            if (value !== validTemplateHeader[key]) {
                status = false;
                task.status = "error";
                setNotificationError(true);
            }
        });
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }

    return <Modal>
        <ModalTitle>Select Configuration File</ModalTitle>
        <ModalContent>
            {(currentTask || executedTasks.length > 0) && <NoticesBox currentTask={currentTask} executedTasks={executedTasks} isError={isNotificationError} />}
            <br />
            {(importSummary) && 
                <NoticeBox title='Import Summary'>
                    <div style={{display:'flex', alignContent:'center', width:'20rem'}}>
                        <div style={{flexGrow:1}}><strong>Questions</strong></div>
                        <div style={{flexGrow:1}}><Tag positive>{'New: '+importSummary.questions.new}</Tag></div>
                        <div style={{flexGrow:1}}><Tag neutral>{'Updated: '+importSummary.questions.updated}</Tag></div>
                        <div style={{flexGrow:1}}><Tag negative>{'Removed: '+importSummary.questions.removed}</Tag></div>
                    </div>
                    <br/>
                    <div style={{display:'flex', alignContent:'center', width:'20rem'}}>
                        <div style={{flexGrow:1}}><strong>Sections</strong></div>
                        <div style={{flexGrow:1}}><Tag positive>{'New: ' +importSummary.sections.new}</Tag></div>
                        <div style={{flexGrow:1}}><Tag neutral>{'Updated: '+importSummary.sections.updated}</Tag></div>
                        <div style={{flexGrow:1}}><Tag negative>{'Removed: '+importSummary.sections.removed}</Tag></div>
                    </div>
                    <br/>
                    <div style={{display:'flex', alignContent:'center', width:'20rem'}}>
                        <div style={{flexGrow:1}}><strong>Scores</strong></div>
                        <div style={{flexGrow:1}}><Tag positive>{'New: '+importSummary.scores.new}</Tag></div>
                        <div style={{flexGrow:1}}><Tag neutral>{'Updated: '+importSummary.scores.updated}</Tag></div>
                        <div style={{flexGrow:1}}><Tag negative>{'Removed: '+importSummary.scores.removed}</Tag></div>
                    </div>
                    
                </NoticeBox>
            }
            <br />
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files)} />
        </ModalContent>
        <ModalActions>
            <ButtonStrip middle>
                <Button disabled={buttonDisabled} primary onClick={() => startImportProcess()}>Import</Button>
                <Button disabled={buttonDisabled} destructive onClick={() => hideForm()}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
}

export default Importer;