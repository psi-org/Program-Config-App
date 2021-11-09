import ImportForm from "./ImportForm";
import { useState } from "react";
import ExcelJS, { Workbook } from "exceljs/dist/es5/exceljs.browser";
import NoticesBox from "../UIElements/NoticesBox";
import { ButtonStrip, FileInput, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import { validWorksheets, validTemplateHeader } from "../../configs/TemplateConstants";


const Importer = (props) => {
    const [ selectedFile, setSelectedFile ] = useState(undefined);
    const [ currentTask, setCurrentTask ] = useState(undefined);
    const [ executedTasks, setExecutedTasks] = useState([]);
    const [ buttonDisabled, setButtonDisabled ] = useState(false);

    const setFile = (files) => {
        setSelectedFile(files[0]);
    }

    const addExecutedTask = (Task) => {
        setExecutedTasks(executedTasks => [...executedTasks, Task] );
    }

    function hideForm() {
        props.displayForm(false);
    }

    const startImportProcess = () =>
    {
        setButtonDisabled(true);
        //1. Form Validation
        if(typeof selectedFile !== 'undefined')
        {
            //2. Validated File Type
            fileValidation(function(status){
                if(status) {
                    const workbook = new ExcelJS.Workbook();
                    const reader = new FileReader();

                    reader.readAsArrayBuffer(selectedFile)
                    reader.onload = () => {
                        const buffer = reader.result;
                        workbook.xlsx.load(buffer).then(workbook => {
                            workbookValidation(workbook, function(status){
                                if(status){
                                    const templateWS = workbook.getWorksheet('Template');
                                    const headers = templateWS.getRow(1).values;
                                    headers.shift();
                                    worksheetValidation(headers, function(status){
                                        if(status)
                                        {
                                            var task = {step: 4, name: "Extracting data from XLSX", status: "success"};
                                            setCurrentTask(task.name);
                                            let templateData = [];
                                            let dataRow = 3;
                                            templateWS.eachRow((row, rowIndex) => {
                                                if(rowIndex>=dataRow)
                                                {
                                                    let dataRow = {};
                                                    let rowVals = row.values;
                                                    validTemplateHeader.forEach((header, index) =>{
                                                        dataRow[header] = rowVals[index+1];
                                                    })
                                                    templateData.push(dataRow);
                                                }
                                            });
                                            addExecutedTask(task);
                                            setCurrentTask(null);
                                            console.log("Data: ", templateData);
                                        }
                                    })
                                }
                                
                            })
                        });
                    }
                }
                
            });
        }
        else
        {
            //Some validation error WIP
            console.log("validation erros");
        }
        setButtonDisabled(false);
    }

    const fileValidation = (callback) => {
        var task = {step: 1, name: "Validating File Type - XLSX", status: "error"};
        setCurrentTask(task.name);
        let status = false;
        if (selectedFile.name.endsWith('xlsx'))
        {
            task.status = "success";
            status = true;
        }
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }

    const workbookValidation = (workbook, callback) => {
        var task = {step: 2, name: "Validating worksheet in the workbook", status: "success"};
        setCurrentTask(task.name);
        let status = true;
        validWorksheets.forEach((worksheet, index)=>{
            if(worksheet !== workbook.getWorksheet(index+1).name)
            {
                task.status = "error";
                status = false;
            }
        });
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }

    const worksheetValidation = (headers, callback) => {
        var task = {step: 3, name: "Validating worksheet columns", status: "success"};
        setCurrentTask(task.name);
        let status = true;
        headers.forEach((value, key) => {
            console.log(value, " == ", validTemplateHeader[key]);
            if(value !== validTemplateHeader[key])
            {
                status = false;
                task.status = "error";
            }
        });
        addExecutedTask(task);
        setCurrentTask(null);
        callback(status);
    }
      
    return <Modal>
                <ModalTitle>Select Configuration File</ModalTitle>
                <ModalContent>
                    {(currentTask || executedTasks.length > 0) && <NoticesBox currentTask={currentTask} executedTasks={executedTasks}/>}
                    <br/>
                    <input type="file" accept=".xlsx" onChange={ (e) => setFile(e.target.files) } />
                </ModalContent>
                <ModalActions>
                    <ButtonStrip middle>
                        <Button disabled={buttonDisabled} primary onClick={() => startImportProcess()}>Import</Button>
                        <Button disabled={buttonDisabled} destructive onClick={() => hideForm()}>Cancel</Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
    
    // <ImportForm showForm={props.displayForm} import={startImport} setFile={setFile}/>
}

export default Importer;