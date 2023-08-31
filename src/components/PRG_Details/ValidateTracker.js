import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from '../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from '../UIElements/CustomMUIDialog'
import SaveIcon from '@mui/icons-material/Save';

import { useEffect, useState } from "react";
import SaveMetadata from "../UIElements/SaveMetadata";
import { buildProgramConfigurations, getNewObjectsCount, validateDataElement, validateSections, validateTEA } from "../../configs/ImportValidatorUtils";
import { truncateString } from "../../configs/Utils";

const ValidateTracker = (
    {
        importResults,
        setImportResults,
        programMetadata,
        programSpecificType,
        removedItems,
        setSavingMetadata,
        setSavedAndValidated,
        setValidationResults,
        setErrorReports,
        refetchProgram
    }
) => {
    let validationResults = {
        stages: {
            sections: [],
            dataElements: []
        },
        teas: {
            sections: [],
            teas: []
        }
    };
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Metadata validated. Please use the 'SAVE' button to persist your changes.");

    const [validationScope, setValidationScope] = useState();

    useEffect(() => {
        setValidationScope(importResults || buildProgramConfigurations(programMetadata))
    }, [])
    

    useEffect(() => {
        if (validationScope && !save) {
            const importedStages = validationScope.configurations.importedStages;
            const teas = validationScope.configurations.teas;
            let errorCounts = 0;
            let excelRow = 2;
        
            if (teas) {
                const teaList = teas.map(section => section.trackedEntityAttributes.map(tea => tea.trackedEntityAttribute.id)).flat();
                teas.forEach(section => {
                    excelRow += 1;
                    const sectionErrorDetails = {
                        title: section.name || ('Section on Template row ' + excelRow),
                        tagName: '[ Program TEA Section ]'
                    }
                    delete section.errors;
                    validateSections(section, sectionErrorDetails);

                    if (section.errors) {
                        validationResults.teas.sections.push(section);
                        errorCounts += section.errors.errors.length;
                    }
                    section.trackedEntityAttributes.forEach(tea => {
                        excelRow += 1;
                        const errorDetails = {
                            title: tea?.trackedEntityAttribute?.name ? `${tea.trackedEntityAttribute.name} (Template row ${excelRow})` : 'Tracked Entity Attribute on Template row ' + excelRow,
                            tagName: '[ Tracked Entity Attribute ]'
                        }
                        delete tea.errors;
                        validateTEA(tea, teaList, errorDetails);
                        if (tea.errors) validationResults.teas.teas.push(tea);
                        if (tea.errors?.errors.length > 0) errorCounts += tea.errors.errors.length;
                    })
                });
            }

            importedStages.forEach(stage => {

                excelRow = 2;
                let stage_errors = 0;
                delete stage.errors;

                let dataElementsList = stage.importedSections.map(section => section.dataElements).flat();

                stage.importedSections.forEach(section => {
                    excelRow += 1;
                    const sectionErrorDetails = {
                        title: section.name || `Section on Template row ${excelRow}`,
                        tagName: `[ Section | ${stage.name} ]`
                    }
                    delete section.errors;
                    validateSections(section, sectionErrorDetails);

                    if (section.errors) {
                        validationResults.stages.sections.push(section);
                        stage_errors += section.errors.errors.length;
                    }

                    section.dataElements.forEach(dataElement => {
                        excelRow += 1;
                        const errorDetails = {
                            title: dataElement?.name ? `${truncateString(dataElement.name)} (Template row ${excelRow})` : `Data Element on Template row ${excelRow}`,
                            tagName: `[ Data Element | ${stage.name} ]`
                        }
                        delete dataElement.errors;
                        validateDataElement(dataElement, errorDetails, dataElementsList);
                        if (dataElement.errors) validationResults.stages.dataElements.push(dataElement);
                        if (dataElement.errors?.errors.length > 0) stage_errors += dataElement.errors.errors.length;
                    });

                });

                errorCounts += stage_errors;
                if (stage_errors > 0) stage.errorsCount = stage_errors;

            });

            if (errorCounts === 0) {
                setValid(true);
                setValidationResults(false);
            } else {
                setValidationMessage("Some Validation Errors occurred. Please check / fix the issues and upload again to continue.");
                setSavingMetadata(false);
                setValidationResults(validationResults);
            }

            setProcessed(true);
        }
    }, [validationScope]);

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
            {save && validationScope &&
                <SaveMetadata
                    programId={programMetadata.id}
                    newObjectsQtty={getNewObjectsCount(importResults)}
                    importedStages={validationScope.configurations.importedStages}
                    importedTEAs={validationScope.configurations.teas}
                    importResults={importResults || { stages: [], teaSummary: {teas:[]} }}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    programMetadata={programMetadata}
                    setImportResults={setImportResults}
                    setErrorReports={setErrorReports}
                    saveType={'program'}
                />
            }
        </DialogActions>

    </CustomMUIDialog>)
}

export default ValidateTracker;