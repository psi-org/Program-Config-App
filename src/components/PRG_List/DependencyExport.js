import { useDataQuery } from "@dhis2/app-runtime";

//UI Elements
import { CircularLoader, MenuItem } from "@dhis2/ui";
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

// *** Routing ***
import { useState, useEffect } from "react";
import { DeepCopy, changeAttributeValue, getJSONKeyTree, removeKey, truncateString } from "../../configs/Utils";
import { DHIS2_KEY_MAP, DHIS2_PRIMARY_COLOR, EXPORT_PRESETS, EXTERNAL_IMPORT_REMOVE_KEYS, H2_ATTRIBUTES_TO_KEEP, JSON_ATTRIBUTE_SETTINGS, PROGRAM_TYPE_OPTIONS, PROGRAM_TYPE_OPTION_SET } from "../../configs/Constants";
import { Accordion, AccordionDetails, AccordionSummary, ButtonGroup, Checkbox, FormControl, FormControlLabel, FormGroup, InputLabel, Select, Switch } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AssignmentLate } from "@mui/icons-material";
import SelectOptions from "../UIElements/SelectOptions";

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const queryLegends = {
    results: {
        resource: 'legendSets',
        paging: false,
        params: {
            fields: ['name', 'id', 'attributeValues', 'legends', 'translations']
        }
    }
};

const DependencyExport = ({ program, setExportProgramId }) => {

    const queryProgramMetadata = {
        results: {
            resource: 'programs/' + program + '/metadata.json'
        }
    };

    const legendsQuery = useDataQuery(queryLegends);
    const legends = legendsQuery.data?.results.legendSets;

    const prgExportQuery = useDataQuery(queryProgramMetadata);
    const exportError = prgExportQuery.error?.details;
    const prgMetadata = prgExportQuery.data?.results;

    const [documentReady, setDocumentReady] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [programMetadata, setProgramMetadata] = useState(undefined)
    const [tabValue, setTabValue] = useState(0)
    const [jsonKeyTree, setJsonKeyTree] = useState()
    const [downloadOriginal, setDownloadOriginal] = useState(false)
    const [jsonHeaders, setJsonHeaders] = useState([])

    const [attributeSettings, setAttributeSettings] = useState(DeepCopy(JSON_ATTRIBUTE_SETTINGS))
    const [selectedPreset, setSelectedPreset] = useState('local')

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const hideForm = () => {
        setDocumentReady(false)
        setExportProgramId(undefined)
    }

    if (prgMetadata && legends && !documentReady) {
        let programRuleActionsDict = {}
        prgMetadata.programRules?.forEach(pr => {
            pr.programRuleActions.forEach(pra => {
                programRuleActionsDict[pra.id] = pr.id
            })
        });
        prgMetadata.programRuleActions?.forEach(pra => {
            pra.programRule = {
                id: programRuleActionsDict[pra.id]
            }
        });

        let legendSets = []

        legends.forEach(legend => {
            if (prgMetadata.dataElements?.find(de => de.legendSets?.find(l => l.id == legend.id))) {
                legendSets.push(legend)
            }
        })

        prgMetadata.legendSets = legendSets
        prgMetadata.optionSets = prgMetadata.optionSets ?? []
        prgMetadata.optionSets.push(PROGRAM_TYPE_OPTION_SET);

        prgMetadata.options = prgMetadata.options ?? [];
        prgMetadata.options = prgMetadata.options.concat(PROGRAM_TYPE_OPTIONS);

        setProgramMetadata(prgMetadata)
        let keyTree = getJSONKeyTree(prgMetadata)
        let tabsList = Object.keys(keyTree).map(key => ({ key, selected: true }))

        setTabValue(tabsList[0].key)
        setJsonKeyTree(keyTree)
        setJsonHeaders(tabsList)

        setDocumentReady(true);
    }

    //* Apply changes to the file before downloading
    const downloadFile = () => {
        //https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react
        let metadata = DeepCopy(programMetadata);
        let cleanMetadata = {}
        let globalAttributesToRemove = []

        attributeSettings.forEach(setting => {
            if (setting.selected)
                globalAttributesToRemove = globalAttributesToRemove.concat(setting.affects)
        })

        let keep = []
        let remove = []

        jsonHeaders.forEach(header => {
            if (header.selected) {
                keep.push(header.key)
            } else {
                remove.push(header.key)
            }
        })

        //IGNORE PARENT KEYS NOT NEEDED
        Object.keys(metadata).forEach((key) => {
            if (!remove.includes(key)) {
                cleanMetadata[key] = metadata[key];
            }
        })

        //HNQIS2 ROUTINES
        if (selectedPreset === 'h2External') {
            //DELETE HNQIS 1.6 ATTRIBUTES NOT NEEDED
            let attributes = cleanMetadata.attributes

            //Because splice changes the array length, using forEach is not possible
            for (let i = attributes.length - 1; i >= 0; i--) {
                if (!H2_ATTRIBUTES_TO_KEEP.includes(attributes[i].id)) {
                    attributes.splice(attributes.findIndex(a => a.id === attributes[i].id), 1);
                }
            }

            //DELETE DE ATTRIBUTEVALUES ASSOCIATED WITH THE ONES REMOVED IN PREVIOUS STEP

            let de = cleanMetadata.dataElements;
            de?.forEach((element) => {

                let attrValues = element.attributeValues;

                for (let i = attrValues.length - 1; i >= 0; i--) {

                    if (!H2_ATTRIBUTES_TO_KEEP.includes(attrValues[i].attribute.id)) {
                        attrValues.splice(attrValues.findIndex(a => a.attribute.id === attrValues[i].attribute.id), 1);
                    }

                }
            });
        }

        //REMOVE SELECTED ATTRIBUTES ON EACH OBJECT
        keep?.forEach(objectKey =>
            jsonKeyTree[objectKey].forEach(attributeKey => {
                if (!attributeKey.selected) removeKey(cleanMetadata[objectKey], attributeKey.key)
            })
        )

        //REMOVE GLOBAL ATTRIBUTES
        globalAttributesToRemove?.forEach(key => removeKey(cleanMetadata, key))

        setDownloading(true);

        const blob = new Blob([JSON.stringify(cleanMetadata)], { type: 'text/json' });
        const a = document.createElement('a');
        a.download = (programMetadata?.programs[0].name) + '.json';
        a.href = window.URL.createObjectURL(blob);

        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        a.dispatchEvent(clickEvt);
        a.remove();

        if (downloadOriginal) {
            const blob2 = new Blob([JSON.stringify(programMetadata)], { type: 'text/json' });
            const a2 = document.createElement('a');
            a2.download = (programMetadata.programs[0].name) + ' [RAW].json';
            a2.href = window.URL.createObjectURL(blob2);

            const clickEvt2 = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });

            a2.dispatchEvent(clickEvt2);
            a2.remove();
        }

        setDownloading(false);
        hideForm();
    }

    const handleKeyCheckboxChange = (tabValue, key) => {
        jsonKeyTree[tabValue][key].selected = !jsonKeyTree[tabValue][key].selected
        setJsonKeyTree(DeepCopy(jsonKeyTree))
    }

    const changeSelectedHeader = (key, value) => {
        for (let i = 0; i < jsonHeaders.length; i++) {
            if (jsonHeaders[i].key === key) {
                jsonHeaders[i].selected = value
            }
            if (key === tabValue) setTabValue(0)
        }
        setJsonHeaders(DeepCopy(jsonHeaders))
    }

    const changeSelected = (value, object, setObject) => {
        changeAttributeValue(object, 'selected', value)
        setObject(DeepCopy(object))
    }

    const selectPreset = (event) => {
        let preset = event.target.value
        changeSelected(true, jsonHeaders, setJsonHeaders)
        switch (preset) {
            case '':
            case 'local':
                changeAttributeSettingsByKey('sharings', false)
                changeAttributeSettingsByKey('ous', false)
                changeAttributeSettingsByKey('redates', false)
                changeAttributeSettingsByKey('reuser', false)
                changeAttributeSettingsByKey('recats', false)
                changeAttributeSettingsByKey('relegends', false)
                break
            case 'external':
                changeAttributeSettingsByKey('sharings', true)
                changeAttributeSettingsByKey('ous', true)
                changeAttributeSettingsByKey('redates', true)
                changeAttributeSettingsByKey('reuser', true)
                changeAttributeSettingsByKey('recats', false)
                changeAttributeSettingsByKey('relegends', false)
                break
            case 'h2External':
                changeAttributeSettingsByKey('sharings', true)
                changeAttributeSettingsByKey('ous', true)
                changeAttributeSettingsByKey('redates', true)
                changeAttributeSettingsByKey('reuser', true)
                changeAttributeSettingsByKey('recats', true)
                changeAttributeSettingsByKey('relegends', true)
                EXTERNAL_IMPORT_REMOVE_KEYS.forEach(key => {
                    changeSelectedHeader(key, false);
                })
                break
        }
        setSelectedPreset(preset)
    };

    const changeAttributeSettings = (index, value) => {
        attributeSettings[index].selected = value
        setAttributeSettings(DeepCopy(attributeSettings))
    }

    const changeAttributeSettingsByKey = (key, value) => {
        let index = attributeSettings.map(e => e.key).indexOf(key)
        changeAttributeSettings(index, value)
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth='lg' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                    Download Metadata With Dependencies
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>
                    {!documentReady && !exportError &&
                        <div style={{ display: 'flex', alignItems: 'center' }}><CircularLoader small /><p>Exporting metadata and creating file...</p></div>
                    }

                    {exportError &&
                        <div style={{ lineHeight: '1.5em' }}>
                            <p style={{ color: '#AA0000' }}><strong>Something went wrong!</strong></p>
                            <p>{exportError?.httpStatus + " - Status " + exportError?.httpStatusCode}</p>
                            <p>{exportError?.message}</p>
                        </div>
                    }

                    {documentReady && prgMetadata && legends && !exportError && jsonKeyTree && jsonHeaders &&
                        <Box sx={{ width: '100%' }}>
                            <div style={{ lineHeight: '1.5em' }}>
                                <p><strong>Your file is ready!</strong></p>
                                <p>You can now download the metadata related to the program by clicking "Download Now".</p>

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p><strong>Program:</strong> <em>{prgMetadata.programs[0].name}</em></p>
                                    <SelectOptions
                                        label={"Export Preset and Routines"}
                                        useError={false}
                                        items={EXPORT_PRESETS}
                                        handler={selectPreset}
                                        value={selectedPreset}
                                        styles={{ width: '35%' }}
                                        defaultOption="No Preset"
                                        helperText={['h2External'].includes(selectedPreset) ? "This option performs special modifications to the file" : ""}
                                    />
                                </div>

                                <h3><br />JSON File Customization</h3>
                                <hr style={{ margin: '8px 0' }} />
                            </div>

                            <Accordion style={{ marginTop: '1em' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FFF' }} />} sx={{ backgroundColor: '#2c6693', color: '#FFF' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ verticalAlign: 'center' }}>JSON File Objects</span>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1em' }}>

                                        <ButtonGroup variant="outlined">
                                            <Button onClick={() => changeSelected(true, jsonHeaders, setJsonHeaders)}>Select All</Button>
                                            <Button onClick={() => { changeSelected(false, jsonHeaders, setJsonHeaders); setTabValue(0); }}>Deselect All</Button>
                                        </ButtonGroup>

                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', margin: '1em 0', padding: '0 1em', maxHeight: '100px', height: '100px', alignItems: 'start', overflow: 'scroll', overflowX: 'hidden' }}>
                                        {jsonHeaders.map((key, index) =>
                                            <FormControlLabel
                                                key={index}
                                                control={<Checkbox checked={key.selected}
                                                    onChange={() => changeSelectedHeader(key.key, !key.selected)}
                                                />}
                                                label={DHIS2_KEY_MAP[key.key]}
                                            />)
                                        }
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion style={{ marginTop: '1em' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#FFF' }} />} sx={{ backgroundColor: '#2c6693', color: '#FFF' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ verticalAlign: 'center' }}>JSON Attributes Settings</span>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <FormGroup style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        alignItems: 'center',
                                        width: '100%',
                                        marginBottom: '1em'
                                    }}>
                                        {attributeSettings.map((elem, index) => <FormControlLabel
                                            key={index}
                                            control={
                                                <Switch checked={elem.selected} onChange={() => changeAttributeSettings(index, !elem.selected)} name="" />
                                            }
                                            label={elem.label}
                                        />
                                        )}
                                    </FormGroup>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1em' }}>

                                        <label><strong>NOTE: </strong>These settings are prioritized over what's selected below.</label>

                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em', alignItems: 'center' }}>
                                <h4>JSON Attributes by Object</h4>
                                <ButtonGroup variant="outlined">
                                    <Button onClick={() => changeSelected(true, jsonKeyTree, setJsonKeyTree)}>Select All</Button>
                                    <Button onClick={() => changeSelected(false, jsonKeyTree, setJsonKeyTree)}>Deselect All</Button>
                                </ButtonGroup>

                            </div>

                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons
                                allowScrollButtonsMobile
                                sx={{
                                    [`& .${tabsClasses.scrollButtons}`]: {
                                        '&.Mui-disabled': { opacity: 0.3 },
                                    }
                                }}
                                TabIndicatorProps={{
                                    style: {
                                        backgroundColor: "#FFF"
                                    }
                                }}
                                textColor='inherit'
                                style={{ marginBottom: '1em', marginTop: '1em', backgroundColor: DHIS2_PRIMARY_COLOR, color: 'white' }}

                            >
                                {jsonHeaders.map((key, index) =>
                                    <Tab disabled={!key.selected} key={index} label={DHIS2_KEY_MAP[key.key]} value={key.key} />)
                                }
                            </Tabs>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', margin: '1em 0', padding: '0 1em', maxHeight: '250px', height: '250px', alignItems: 'start', overflow: 'scroll', overflowX: 'hidden' }}>
                                {tabValue !== 0 && jsonKeyTree[tabValue].map((elem, index) =>
                                    <FormControlLabel
                                        key={index}
                                        control={<Checkbox checked={elem.selected}
                                            onChange={() => handleKeyCheckboxChange(tabValue, index)}
                                        />}
                                        label={elem.key}
                                    />)
                                }
                            </div>

                            <p style={{ color: '#2c6693' }}><br /><strong>NOTE: </strong>Keep in mind that any <em>Option Groups</em> or <em>Option Group Sets</em> related to the program are <strong>NOT</strong> included in the downloaded file.</p>
                        </Box>
                    }
                </DialogContent>

                <DialogActions style={{ padding: '1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {documentReady && prgMetadata && legends &&
                        <FormControlLabel
                            control={<Checkbox checked={downloadOriginal}
                                onChange={() => setDownloadOriginal(!downloadOriginal)}
                            />}
                            label="Download both Original and Modified files"
                        />
                    }
                    <div>
                        <Button onClick={() => hideForm()} color="error" > Close </Button>
                        {documentReady && prgMetadata && legends &&
                            <Button onClick={() => downloadFile()} variant='outlined' disabled={downloading} startIcon={<FileDownloadIcon />}> Download Now {selectedPreset != '' ? 'with Selected Preset' : ''}</Button>
                        }
                    </div>
                </DialogActions>

            </CustomMUIDialog>
        </>
    );
}

export default DependencyExport;