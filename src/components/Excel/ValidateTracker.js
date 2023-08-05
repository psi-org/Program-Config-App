import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import SaveIcon from '@mui/icons-material/Save';

import { useEffect, useState } from "react";
//import SaveMetadata from "./SaveMetadata";
import { getNewObjectsCount, validateDataElement, validateFeedbacks, validateScores, validateSections, validateTEA, verifyProgramDetail } from "../../configs/ImportValidatorUtils";


//TODO: Work In Progress

const ValidateTracker = (
    {
        importResults,
        setImportResults,
        programMetadata,
        programSpecificType,
        setSavingMetadata,
        setSavedAndValidated,
        setValidationResults,
        setErrorReports,
        refetchProgram
    }
) => {
    let validationResults = {
        stages: {},
        teas: []
    };
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Metadata validated. Please use the 'SAVE' button to persist your changes.");

    useEffect(() => {
        if (importResults) {
            const importedStages = importResults.configurations.importedStages;
            const teas = importResults.configurations.teas;
            let errorCounts = 0;
            
            if (teas) {
                const teaList = teas.map(section => section.trackedEntityAttributes.map(tea => tea.trackedEntityAttribute.id)).flat();
                teas.forEach(section => {
                    section.trackedEntityAttributes.forEach(tea => {
                        delete tea.errors;
                        validateTEA(tea, teaList);
                        if (tea.errors?.length > 0) errorCounts += tea.errors.length;
                    })
                });
            }

            importedStages.forEach(stage => {
                let stage_errors = 0;
                stage.importedSections.forEach(section => {
                    section.dataElements.forEach(dataElement => {
                        delete dataElement.errors;
                        validateDataElement(dataElement);
                        stage_errors += dataElement.errors?.length || 0;
                    });
                });
                errorCounts += stage_errors;
                if (stage_errors > 0) stage.errors = stage_errors;
            });
            

            if (errorCounts === 0) {
                setValid(true);
                setValidationResults(false);
            } else {
                setValidationMessage("Some Validation Errors occurred. Please check / fix the issues and upload again to continue.");
                setSavingMetadata(false);
                setValidationResults(validationResults);
            }
        } else {
            setValid(true);
        }
        setProcessed(true);
    });

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setSavingMetadata(false)}>
            Settings Validation
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
            <NoticeBox error={!valid} title={processed ? "Program configurations validated" : "Validating program configurations"}>
                {!processed && <CircularLoader small />}
                {validationMessage}
            </NoticeBox>
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color="error" disabled={!processed} onClick={() => setSavingMetadata(false)}> Close </Button>
            <Button variant='outlined' startIcon={<SaveIcon />} disabled={!valid} onClick={() => setSave(true)}> Save </Button>
            {save && 
                /*<SaveMetadata
                    hnqisMode={hnqisMode}
                    newObjects={getNewObjectsCount(importResults)}
                    programStage={programStage}
                    importedStages={importedStages}
                    importedScores={importedScores}
                    criticalSection={criticalSection}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    removedItems={removedItems}
                    programMetadata={programMetadata}
                    setImportResults={setImportResults}
                    setErrorReports={setErrorReports}
                    refetchProgramStage={refetchProgramStage}
                />*/<></>
            }
        </DialogActions>

    </CustomMUIDialog>)
}

export default ValidateTracker;