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

                                    const programDetails = getProgramDetails(instructionWS);
                                    const mappingDetails = getMappingList(mappingWS);
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
                                            console.log(importedSections);
                                            console.log(importedScores);
                                            console.log(importSummaryValues);
                                            console.log(programDetails);
                                            console.log(mappingDetails);
                                            //props.setNewDeQty(importSummaryValues.questions.new);

                                            // Set new sections & questions
                                            setImportSummary(importSummaryValues);
                                            props.setImportResults(importSummaryValues);
                                            props.setSaveStatus('Save & Validate');

                                            var newScoresSection = props.previous.scoresSection;
                                            newScoresSection.dataElements = importedScores;

                                            props.previous.setSections(importedSections);
                                            props.previous.setScoresSection(newScoresSection);
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

    const getProgramDetails = (ws) => {
        let program = {};
        program.id = ws.getCell("D12").value.result;
        program.name = ws.getCell("C12").value;
        program.useCompetencyClass = ws.getCell("C13").value;
        program.dePrefix = ws.getCell("C14").value;
        program.healthArea = ws.getCell("C15").value;
        return program;
    }

    const getMappingList = (ws) => {
        let mapping = {};
        mapping.optionSets = [];
        mapping.legendSets = [];
        let i = 3;
        while(ws.getCell("I"+i).value !== null) {
            let option = {};
            option.id = ws.getCell("I"+i).value;
            option.optionSet = ws.getCell("H"+i).value;
            mapping.optionSets.push(option);
            i++;
        }
        i = 3;
        while(ws.getCell("P"+i).value !== null)
        {
            let legend = {};
            legend.id = ws.getCell("P"+i).value;
            legend.legendSet = ws.getCell("O"+i).value;
            mapping.legendSets.push(legend);
            i++;
        }
        return mapping;
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