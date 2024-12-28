import { CircularLoader, NoticeBox } from "@dhis2/ui";
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import {  FEEDBACK_ORDER } from "../../configs/Constants.js";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants.js";
import { validateFeedbacks, validateScores, validateQuestions, verifyProgramDetail, validateSectionsHNQIS2, validateMetadataStructure } from "../../utils/ImportValidatorUtils.js";
import { DeepCopy, getPCAMetadataDE, programIsHNQIS, programIsHNQISMWI } from "../../utils/Utils.js";
import SaveMetadata from "../UIElements/SaveMetadata.js";
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

const ValidateMetadata = (
    { 
        hnqisType,
        newDEQty,
        programStage,
        importedSections,
        importedScores,
        criticalSection,
        removedItems,
        setSavingMetadata,
        setSavedAndValidated,
        previous,
        setImportResults,
        importResults,
        setValidationResults,
        programMetadata,
        setErrorReports,
        stagesList,
        setExportToExcel,
        stageRefetch
    }
) => {
    
    const initValidationMsg = () => {
        let msg = "Metadata validated. Please use the 'SAVE' button to persist your changes.";
        if( programIsHNQISMWI(hnqisType) ) {
            msg += " The number of sections may be reset.";
        }
        
        return msg;
    }
    
    const validationResults = {};
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState(initValidationMsg());
    
    const resetErrorsInSections = () => {
        importedSections.forEach((section) => {
            delete section.errors;
            delete section.errorsCount;
        })
    }
    
    useEffect(() => {
        if (!save) {
            const importedSectionsV = importedSections;
            const importedScoresV = importedScores;
            let errorCounts = 0;
            let excelRow = 2;

            if (verifyProgramDetail(importResults, setValidationMessage)) {
                const sections = [];
                const questions = [];
                const scores = [];
                resetErrorsInSections();

                validationResults.sections = sections;
                validationResults.questions = questions;
                validationResults.scores = scores;

                let feedbacksErrors;

                // CHECK FEEDBACK DATA
                if (programIsHNQIS(hnqisType)) {
                    const validateResults = validateFeedbacks(!!hnqisType, importedSectionsV.concat(importedScoresV))
                    feedbacksErrors = validateResults.feedbacksErrors
                
                    errorCounts += feedbacksErrors.length
                    validationResults.feedbacks = feedbacksErrors;
                }
            

                //ADD FEEDBACK ERRORS TO DATA ELEMENTS
                const dataElementsList = DeepCopy(importedSections.map(section => section.dataElements).flat());

                if (programIsHNQIS(hnqisType)) {
                    if( programIsHNQISMWI(hnqisType) ) {
                        validateMetadataStructure(importedSectionsV);
                    }
                    
                    importedSectionsV.forEach((section) => {
                        excelRow += 1;
                        let section_errors = 0;
                        const sectionErrorDetails = {
                            title: section.name || ('Section on Template row ' + excelRow),
                            tagName: '[ Section ]'
                        }
                        validateSectionsHNQIS2(section, sectionErrorDetails);
                
                        if (section.errors) {
                            sections.push(section);
                            errorCounts += section.errors.errors.length;
                            section_errors += section.errors.errors.length;
                        }

                        section.dataElements.forEach((dataElement) => {
                            excelRow += 1;
                            const metadata = getPCAMetadataDE(dataElement);
                            dataElement.labelFormName = metadata.labelFormName;

                            const errorDetails = {
                                title: dataElement.labelFormName || dataElement.formName || dataElement.name || ('Element on Template row ' + excelRow),
                                tagName: dataElement.labelFormName ? '[ Label ]' : '[ Question ]'
                            }

                            delete dataElement.errors

                            validateQuestions(importedScores, dataElement, metadata, dataElementsList, errorDetails);
                            if (dataElement.errors) { questions.push(dataElement) }

                            if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                                const deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                                const deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

                                dataElement.errors ? dataElement.errors.errors.push(deErrs) : dataElement.errors = {
                                    title: errorDetails.title,
                                    tagName: errorDetails.tagName,
                                    errors: [deErrs],
                                    displayBadges: true
                                };
                            }

                            if (dataElement.errors) {
                                errorCounts += dataElement.errors.errors.length;
                                section_errors += dataElement.errors.errors.length;
                            }
                        });
                        if (section_errors > 0) { section.errorsCount = section_errors }
                    });
                }

                let score_errors = 0;
                delete importedScoresV.errors
                if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2) {
                    importedScoresV.dataElements.forEach((dataElement) => {
                        excelRow += 1;
                        const errorDetails = {
                            title: dataElement.formName || dataElement.name || ('Score on Template row ' + excelRow),
                            tagName: '[ Score ]'
                        }
                        delete dataElement.errors
                        validateScores(dataElement, errorDetails);
                        if (dataElement.errors) { scores.push(dataElement) }

                        if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                            const deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                            const deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

                            dataElement.errors ? dataElement.errors.errors.push(deErrs) : dataElement.errors = {
                                title: errorDetails.title,
                                tagName: errorDetails.tagName,
                                errors: [deErrs],
                                displayBadges: true
                            };

                        }

                        if (dataElement.errors) {
                            errorCounts += dataElement.errors.errors.length;
                            score_errors += dataElement.errors.errors.length;
                        }

                    });
                }
                if (score_errors > 0) { importedScoresV.errors = score_errors }
                // SUMMARY - RESULTS
                if (errorCounts === 0) {
                    setValid(true);
                    setValidationResults(false);
                } else {
                    setValidationMessage("Some Validation Errors occurred. Please check / fix the issues and upload again to continue.");
                    setSavingMetadata(false);
                    setValidationResults(validationResults);
                }
                previous.setSections(importedSectionsV);
                previous.setScoresSection(importedScoresV);


            } else {
                setValid(false);
            }
            setProcessed(true);
        }
    });

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setSavingMetadata(false)}>
            {hnqisType ? 'Assessment Validation' : 'Save changes into the server?'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
            {hnqisType &&
                <NoticeBox error={!valid} title={processed ? "Sections and Scores Validated" : "Validating Sections and Scores"}>
                    {!processed && <CircularLoader small />}
                    {validationMessage}
                </NoticeBox>
            }
            {!hnqisType && 'This action cannot be undone'}
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color="error" disabled={!processed} onClick={() => setSavingMetadata(false)}> Close </Button>
            <Button variant='outlined' startIcon={<SaveIcon />} disabled={!valid} onClick={() => setSave(true)}> Save </Button>
            {save &&
                <SaveMetadata
                    programId={programStage.program.id}
                    hnqisType={hnqisType}
                    newObjectsQtty={newDEQty}
                    programStage={programStage}
                    importedSections={importedSections}
                    importedScores={importedScores}
                    criticalSection={criticalSection}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    removedItems={removedItems}
                    programMetadata={programMetadata}
                    setImportResults={setImportResults}
                    setErrorReports={setErrorReports}
                    stagesList={stagesList}
                    saveType={'stage'}
                    fromImport={!!importResults}
                    setExportToExcel={setExportToExcel}
                    stageRefetch={stageRefetch}
                />
            }
        </DialogActions>

    </CustomMUIDialog>)
}

ValidateMetadata.propTypes = {
    criticalSection: PropTypes.object,
    hnqisType: PropTypes.string,
    importResults: PropTypes.oneOfType([PropTypes.object,PropTypes.bool]),
    importedScores: PropTypes.object,
    importedSections: PropTypes.array,
    newDEQty: PropTypes.number,
    previous: PropTypes.object,
    programMetadata: PropTypes.object,
    programStage: PropTypes.object,
    removedItems: PropTypes.oneOfType([PropTypes.object,PropTypes.array]),
    setErrorReports: PropTypes.func,
    setExportToExcel: PropTypes.func,
    setImportResults: PropTypes.func,
    setSavedAndValidated: PropTypes.func,
    setSavingMetadata: PropTypes.func,
    setValidationResults: PropTypes.func,
    stageRefetch: PropTypes.func,
    stagesList: PropTypes.array,
}

export default ValidateMetadata;
