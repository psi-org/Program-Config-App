import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import SaveIcon from '@mui/icons-material/Save';
import {  FEEDBACK_ORDER } from "../../configs/Constants";


import { useEffect, useState } from "react";
import SaveMetadata from "../UIElements/SaveMetadata";
import { validateFeedbacks, validateScores, validateQuestions, verifyProgramDetail, validateSectionsHNQIS2 } from "../../configs/ImportValidatorUtils";
import { getPCAMetadataDE } from "../../configs/Utils";



const ValidateMetadata = (
    { 
        hnqisMode,
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
        refetchProgramStage
    }
) => {
    let validationResults = {};
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Metadata validated. Please use the 'SAVE' button to persist your changes.");

    useEffect(() => {
        const importedSectionsV = importedSections;
        const importedScoresV = importedScores;
        let errorCounts = 0;
        let excelRow = 2;

        if (verifyProgramDetail(importResults, setValidationMessage)) {
            let sections = [];
            let questions = [];
            let scores = [];

            validationResults.sections = sections;
            validationResults.questions = questions;
            validationResults.scores = scores;

            let feedbacksErrors, feedbacksWarnings

            // CHECK FEEDBACK DATA
            if (hnqisMode) {
                let validateResults = validateFeedbacks(hnqisMode, importedSectionsV.concat(importedScoresV))
                feedbacksErrors = validateResults.feedbacksErrors
                feedbacksWarnings = validateResults.feedbacksWarnings
                
                errorCounts += feedbacksErrors.length
                validationResults.feedbacks = feedbacksErrors;
            }
            

            //ADD FEEDBACK ERRORS TO DATA ELEMENTS
            if (hnqisMode) importedSectionsV.forEach((section) => {
                excelRow += 1;
                let section_errors = 0;
                const sectionErrorDetails = {
                    title: section.name || ('Section on Template row '+excelRow),
                    tagName: '[ Section ]'
                }
                delete section.errors
                validateSectionsHNQIS2(section, sectionErrorDetails);
                
                if (section.errors) {
                    sections.push(section);
                    errorCounts += section.errors.errors.length;
                    section_errors += section.errors.errors.length;
                }

                section.dataElements.forEach((dataElement) => {
                    excelRow += 1;
                    let metadata = getPCAMetadataDE(dataElement);
                    dataElement.labelFormName = metadata.labelFormName;

                    const errorDetails = {
                        title: dataElement.labelFormName || dataElement.formName || dataElement.name || ('Element on Template row ' + excelRow),
                        tagName: dataElement.labelFormName ? '[ Label ]' : '[ Question ]'
                    }

                    delete dataElement.errors

                    validateQuestions(importedScores, dataElement, metadata, section.dataElements,errorDetails);
                    if (dataElement.errors) questions.push(dataElement);

                    if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                        let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                        let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

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
                if (section_errors > 0) section.errorsCount = section_errors;
            });

            let score_errors = 0;
            delete importedScoresV.errors
            if (hnqisMode) importedScoresV.dataElements.forEach((dataElement) => {
                excelRow += 1;
                const errorDetails = {
                    title: dataElement.formName || dataElement.name || ('Score on Template row ' + excelRow),
                    tagName: '[ Score ]'
                }
                delete dataElement.errors
                validateScores(dataElement, errorDetails);
                if (dataElement.errors) scores.push(dataElement);

                if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                    let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                    let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

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
            if (score_errors > 0) importedScoresV.errors = score_errors;

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
    });

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setSavingMetadata(false)}>
            {hnqisMode ? 'Assessment Validation' : 'Save changes into the server?'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
            {hnqisMode &&
                <NoticeBox error={!valid} title={processed ? "Sections and Scores Validated" : "Validating Sections and Scores"}>
                    {!processed && <CircularLoader small />}
                    {validationMessage}
                </NoticeBox>
            }
            {!hnqisMode && 'This action cannot be undone'}
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color="error" disabled={!processed} onClick={() => setSavingMetadata(false)}> Close </Button>
            <Button variant='outlined' startIcon={<SaveIcon />} disabled={!valid} onClick={() => setSave(true)}> Save </Button>
            {save &&
                <SaveMetadata
                    programId={programStage.program.id}
                    hnqisMode={hnqisMode}
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
                />
            }
        </DialogActions>

    </CustomMUIDialog>)
}

export default ValidateMetadata;