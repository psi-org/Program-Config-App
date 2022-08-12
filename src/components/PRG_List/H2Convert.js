import { useDataQuery } from "@dhis2/app-runtime";

import { CircularLoader } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import UpgradeIcon from '@mui/icons-material/SwitchAccessShortcutAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LabelIcon from '@mui/icons-material/LabelImportant';
import QuizIcon from '@mui/icons-material/Quiz';

import { useState, useEffect } from "react";
import { FormControl, FormControlLabel, Switch } from "@mui/material";
import SelectOptions from "../UIElements/SelectOptions";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import AlertDialogSlide from '../UIElements/AlertDialogSlide';

import {QUESTION_TYPE_ATTRIBUTE, DE_TYPE_ATTRIBUTE, HEADER_ATTRIBUTE, QUESTION_PARENT_ATTRIBUTE, QUESTION_PARENT_OPTIONS_ATTRIBUTE, COMPOSITIVE_SCORE_ATTRIBUTE, SCORE_NUM_ATTRIBUTE, SCORE_DEN_ATTRIBUTE} from '../../configs/Constants';

const queryProgramMetadata = {
    results: {
        resource: 'programs',
        params: ({ program }) => ({ //Special care in Organisation Units and Sharing Settings
            fields: ['id', 'name', 'shortName', 'ignoreOverdueEvents', 'skipOffline', 'onlyEnrollOnce', 'sharing', 'maxTeiCountToReturn', 'selectIncidentDatesInFuture', 'selectEnrollmentDatesInFuture', 'registration', 'favorite', 'useFirstStageDuringRegistration', 'completeEventsExpiryDays', 'withoutRegistration', 'featureType', 'minAttributesRequiredToSearch', 'displayFrontPageList', 'programType', 'accessLevel', 'expiryDays', 'categoryCombo', 'programIndicators', 'translations', 'attributeValues', 'userRoles', 'favorites', 'programRuleVariables', 'programTrackedEntityAttributes', 'notificationTemplates', 'organisationUnits', 'programSections', 'programStages[programStageDataElements[dataElement[id],compulsory,displayInReports,sortOrder],programStageSections[name,dataElements[*,attributeValues[value,attribute[id,name]]]]]'],
            filter: [`id:eq:${program}`]
        })
    }
};

const queryHealthAreas = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['options[code,name]'],
            filter: ['id:eq:y752HEwvCGi']
        }
    }
};

const H2Convert = ({ program, setConversionH2ProgramId, setNotification }) => {

    const [dialogStatus, setDialogStatus] = useState(false);
    const [errorHA, setErrorHA] = useState();
    const [loading, setLoading] = useState(true);

    const { data: programData } = useDataQuery(queryProgramMetadata, { variables: { program } });
    const { data: haQuery } = useDataQuery(queryHealthAreas);

    const [useCompetency, setUseCompetency] = useState(false);
    const [healthArea, setHealthArea] = useState('');
    const [healthAreaOptions, setHealthAreaOptions] = useState(undefined);

    const [sectionsData, setSectionsData] = useState(undefined);

    useEffect(() => {
        if (programData && haQuery) {
            setHealthAreaOptions(haQuery?.results?.optionSets[0].options.map(op => {
                return { label: op.name, value: op.code }
            }));
        }
    }, [programData, haQuery])

    useEffect(() => {
        if (healthAreaOptions) setLoading(false)
    }, [healthAreaOptions])

    useEffect(() => {
        if (programData) {
            let program = programData?.results?.programs[0]

            let h1Tabs = program.programStages[0].programStageSections
            let h1StageDataElements = program.programStages[0].programStageDataElements

            let newDataElementsList = []
            h1Tabs.forEach(tab => newDataElementsList = newDataElementsList.concat(tab.dataElements.map(de =>
            ({
                dataElement: de,
                tabName: tab.name,
                programStageDataElement: h1StageDataElements.find(psde => psde.dataElement.id === de.id)
            })
            )))

            setSectionsData(newDataElementsList.reduce((acu, cur) => {
                let header = cur.dataElement.attributeValues.find(att => att.attribute.id === HEADER_ATTRIBUTE)?.value
                let sectionName = `${cur.tabName} - ${header}`
                let sectionIdx = acu.findIndex(section => section.name === sectionName)
                if (sectionIdx === -1) acu.push({ name: sectionName, dataElements: [cur] })
                else acu[sectionIdx].dataElements.push(cur)
                return acu
            }, []))
        }
    }, [programData])

    const handleChangeComp = (event) => {
        setUseCompetency(event.target.checked);
    };

    const healthAreaChange = (event) => {
        setErrorHA(undefined)
        setHealthArea(event.target.value);
    }

    const hideForm = () => {
        setConversionH2ProgramId(undefined)
    }

    const submission = () => {
        if (healthArea === "") {
            setErrorHA('This field is required')
        } else {
            setDialogStatus(true)
        }
    }

    const convertProgram = () => {
        console.log(sectionsData)
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                    Convert HNQIS 1.X Program to HNQIS 2.0
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em', display: 'flex', flexDirection: 'column' }}>
                    {loading &&
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularLoader />
                            <span style={{ fontSize: '1.1em', marginTop: '0.5em' }}>Preparing Metadata</span>
                        </div>
                    }
                    {!loading &&
                        <>
                            <p><strong>Selected Program: </strong>{programData?.results?.programs[0].name}</p>
                            <FormControl margin="dense" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={useCompetency} onChange={handleChangeComp} name="competency" />
                                    }
                                    label="Use Competency Class"
                                />
                                <SelectOptions
                                    useError={errorHA !== undefined}
                                    helperText={errorHA}
                                    label={'Program Health Area (*)'}
                                    items={healthAreaOptions}
                                    handler={healthAreaChange}
                                    styles={{ width: '60%' }}
                                    value={healthArea}
                                    defaultOption='Select Health Area'
                                />
                            </FormControl>
                        </>}
                    <p style={{fontSize: '1.2em', marginBottom: '0.5em'}}>Assessment Preview</p>
                    {sectionsData &&
                        <div style={{width: '100%', padding: '0 1em 0 0', overflow: 'auto'}}>
                            {sectionsData.map((section,i) => 
                                <Accordion style={{ margin: '0.5em 0' }} key={i}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#FFF'}}/>} sx={{backgroundColor:'#2c6693', color:'#FFF'}}>
                                        {section.name}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {section.dataElements.map(de => 
                                            <div style={{width: '100%', display: 'flex', margin: '0.5em 0', padding: '0.5em', alignItems: 'center'}}>
                                                {
                                                    (de.dataElement.attributeValues
                                                        .find(att => att.attribute.id === QUESTION_TYPE_ATTRIBUTE)?.value==="7")
                                                        ?<LabelIcon sx={{marginRight: '0.5em'}}/>
                                                        :<QuizIcon sx={{marginRight: '0.5em'}}/>
                                                }
                                                {de.dataElement.formName}
                                            </div>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            )}
                        </div>
                    }

                </DialogContent>

                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => hideForm()} color="error" > Cancel </Button>
                    {!loading &&
                        <Button onClick={() => { submission() }} variant='outlined' disabled={!programData?.results} startIcon={<UpgradeIcon />}> Convert to HNQIS 2.0 </Button>
                    }
                </DialogActions>

            </CustomMUIDialog>
            <AlertDialogSlide
                open={dialogStatus}
                title={"Are you sure you want to convert this program to HNQIS 2.0?"}
                content={"A new program will be created re-using as many Data Elements as possible and assigning the same Organisation Units and Sharing Settings as the original. The program will not be available for conversion again after the process ends."}
                primaryText={"Yes, continue"}
                secondaryText={"Cancel"}
                color={"success"}
                actions={{
                    primary: function () { setDialogStatus(false); convertProgram() },
                    secondary: function () { setDialogStatus(false); }
                }}
            />
        </>
    );
}

export default H2Convert;