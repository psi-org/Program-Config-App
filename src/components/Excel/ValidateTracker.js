import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import SaveIcon from '@mui/icons-material/Save';
import {  FEEDBACK_ORDER } from "../../configs/Constants";


import { useEffect, useState } from "react";
import SaveMetadata from "./SaveMetadata";
import { validateFeedbacks, validateScores, validateSections, verifyProgramDetail } from "../../configs/ImportValidatorUtils";


//TODO: Work In Progress
const ValidateTracker = (props) => {
    let validationResults = {};
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Metadata validated. Please use the 'SAVE' button to persist your changes.");

    useEffect(() => {
        const importedSections = props.importedSections;
        const importedScore = props.importedScores;
        let errorCounts = 0;

        if (verifyProgramDetail(props.importResults, setValidationMessage)) {
            let questions = [];
            let scores = [];

            validationResults.questions = questions;
            validationResults.scores = scores;

            let feedbacksErrors, feedbacksWarnings

            // CHECK FEEDBACK DATA
            if (props.hnqisMode) {
                let validateResults = validateFeedbacks(props.hnqisMode, importedSections.concat(importedScore))
                feedbacksErrors = validateResults.feedbacksErrors
                feedbacksWarnings = validateResults.feedbacksWarnings
                
                errorCounts += feedbacksErrors.length
                validationResults.feedbacks = feedbacksErrors;
            }

            //ADD FEEDBACK ERRORS TO DATA ELEMENTS
            if (props.hnqisMode) importedSections.forEach((section) => {
                delete section.errors
                let section_errors = 0;
                section.dataElements.forEach((dataElement) => {
                    delete dataElement.errors

                    validateSections(props.importedScores, dataElement);
                    if (dataElement.errors) questions.push(dataElement);

                    if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                        let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                        let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

                        dataElement.errors ? dataElement.errors.push(deErrs) : dataElement.errors = [deErrs];
                    }

                    if (dataElement.errors) {
                        errorCounts += dataElement.errors.length;
                        section_errors += dataElement.errors.length;
                    }
                });
                if (section_errors > 0) section.errors = section_errors;
            });

            let score_errors = 0;
            delete importedScore.errors
            if (props.hnqisMode) importedScore.dataElements.forEach((dataElement) => {
                delete dataElement.errors
                validateScores(dataElement);
                if (dataElement.errors) scores.push(dataElement);

                if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                    let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                    let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg

                    dataElement.errors ? dataElement.errors.push(deErrs) : dataElement.errors = [deErrs];

                }

                if (dataElement.errors) {
                    errorCounts += dataElement.errors.length;
                    score_errors += dataElement.errors.length;
                }

            });
            if (score_errors > 0) importedScore.errors = score_errors;

            // SUMMARY - RESULTS
            if (errorCounts === 0) {
                setValid(true);
                props.setValidationResults(false);
            } else {
                setValidationMessage("Some Validation Errors occurred. Please check / fix the issues and upload again to continue.");
                props.setSavingMetadata(false);
                props.setValidationResults(validationResults);
            }
            props.previous.setSections(importedSections);
            props.previous.setScoresSection(importedScore);


        } else {
            setValid(false);
        }
        setProcessed(true);
    });

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setSavingMetadata(false)}>
            {props.hnqisMode ? 'Assessment Validation' : 'Save changes into the server?'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
            {props.hnqisMode &&
                <NoticeBox error={!valid} title={processed ? "Sections and Scores Validated" : "Validating Sections and Scores"}>
                    {!processed && <CircularLoader small />}
                    {validationMessage}
                </NoticeBox>
            }
            {!props.hnqisMode && 'This action cannot be undone'}
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color="error" disabled={!processed} onClick={() => props.setSavingMetadata(false)}> Close </Button>
            <Button variant='outlined' startIcon={<SaveIcon />} disabled={!valid} onClick={() => setSave(true)}> Save </Button>
            {save &&
                <SaveMetadata
                    hnqisMode={props.hnqisMode}
                    newDEQty={props.newDEQty}
                    programStage={props.programStage}
                    importedSections={props.importedSections}
                    importedScores={props.importedScores}
                    criticalSection={props.criticalSection}
                    setSavingMetadata={props.setSavingMetadata}
                    setSavedAndValidated={props.setSavedAndValidated}
                    removedItems={props.removedItems}
                    programMetadata={props.programMetadata}
                    setImportResults={props.setImportResults}
                    setErrorReports={props.setErrorReports}
                    refetchProgramStage={props.refetchProgramStage}
                />
            }
        </DialogActions>

    </CustomMUIDialog>)
}

export default ValidateTracker;