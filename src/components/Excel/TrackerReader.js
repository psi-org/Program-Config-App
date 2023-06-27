import ExcelJS from "exceljs/dist/es5/exceljs.browser";

const readFile = file => {

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
                            var task = { step: 4, name: "Extracting data from XLSX", status: "success" };
                            setCurrentTask(task.name);
                            let templateData = [];
                            let dataRow = 3;
                            templateWS.eachRow((row, rowIndex) => {
                                if (rowIndex >= dataRow) {
                                    let dataRow = {};
                                    let rowVals = row.values;
                                    validTemplateHeader.forEach((header, index) => {
                                        /* dataRow[header] = (isObject(rowVals[index+1]) && rowVals[index+1].hasOwnProperty('result')) ? rowVals[index+1].result : rowVals[index+1]; */
                                        dataRow[header] = rowVals[index + 1]
                                    })
                                    templateData.push(dataRow);
                                }
                            });
                            addExecutedTask(task);
                            setCurrentTask(null);

                            // Start import reading
                            let { importedSections, importedScores, importSummaryValues } = readTemplateData(templateData, props.previous, programDetails.dePrefix, mappingDetails.optionSets, mappingDetails.legendSets, props.currentSectionsData);
                            importSummaryValues.program = programDetails;
                            importSummaryValues.mapping = mappingDetails;

                            // Set new sections & questions
                            setImportSummary(importSummaryValues);
                            props.setImportResults(importSummaryValues);
                            props.setSaveStatus('Validate & Save');
                            props.setSavedAndValidated(false);

                            var newScoresSection = props.previous.scoresSection;
                            newScoresSection.dataElements = importedScores;
                            delete newScoresSection.errors;

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

const workbookValidation = (workbook, callback) => {
    var task = { step: 2, name: "Validating worksheet in the workbook", status: "success" };
    //setCurrentTask(task.name);
    let status = true;
    validWorksheets.forEach((worksheet, index) => {
        try {
            if (worksheet !== workbook.getWorksheet(index + 1).name) {
                task.status = "error";
                status = false;
                setNotificationError(true);
            }
        } catch (e) {
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