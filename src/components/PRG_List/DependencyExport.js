import { useDataQuery } from "@dhis2/app-runtime";

//UI Elements
import { CircularLoader } from "@dhis2/ui";
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
import { useState } from "react";
import { getJSONKeyTree, truncateString } from "../../configs/Utils";
import { DHIS2_KEY_MAP } from "../../configs/Constants";
import { Checkbox, FormControlLabel } from "@mui/material";

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
            resource: 'programs/' + program + '/metadata.json?skipSharing=true'
        }
    };

    const legendsQuery = useDataQuery(queryLegends);
    const legends = legendsQuery.data?.results.legendSets;

    const prgExportQuery = useDataQuery(queryProgramMetadata);
    const exportError = prgExportQuery.error?.details;
    const programMetadata = prgExportQuery.data?.results;

    const [documentReady, setDocumentReady] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [cleanMetadata, setCleanMetadata] = useState(undefined)
    const [tabValue, setTabValue] = useState(0)
    const [jsonKeyTree, setJsonKeyTree] = useState()
    const [jsonHeaders, setJsonHeaders] = useState([])

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const hideForm = () => {
        setDocumentReady(false)
        setExportProgramId(undefined)
    }

    if (programMetadata && !documentReady) {
        let programRuleActionsDict = {}
        programMetadata.programRules?.forEach(pr => {
            pr.programRuleActions.forEach(pra => {
                programRuleActionsDict[pra.id] = pr.id
            })
        });
        programMetadata.programRuleActions?.forEach(pra => {
            pra.programRule = {
                id: programRuleActionsDict[pra.id]
            }
        });
        let keyTree = getJSONKeyTree(programMetadata)
        console.log(keyTree)
        setJsonKeyTree(keyTree)
        setJsonHeaders(Object.keys(keyTree))
        setDocumentReady(true);
    }

    const downloadFile = () => {
        //https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react
        let metadata = programMetadata;

        let legendSets = []

        legends.forEach(legend => {
            if (metadata.dataElements?.find(de => de.legendSets?.find(l => l.id == legend.id))) {
                legend.legends?.forEach(l => {
                    delete l.created;
                    delete l.lastUpdated;
                    delete l.access;
                })
                legendSets.push(legend)
            }
        })

        metadata.legendSets = legendSets
        metadata.optionSets = metadata.optionSets ?? []
        metadata.optionSets.push({
            "name": "DB - Program Type",
            "id": "TOcCuCN2CLm",
            "version": 7,
            "valueType": "TEXT",
            "attributeValues": [],
            "translations": [],
            "options": [
                { "id": "Ip3IqzzqgLN" },
                { "id": "Jz4YKD15lnK" },
                { "id": "QR0HHcQri91" },
                { "id": "v9XPATv6G3N" }
            ]
        });

        let prgTypeOptions = [
            {
                "code": "HNQIS",
                "name": "HNQIS",
                "id": "Ip3IqzzqgLN",
                "sortOrder": 1,
                "optionSet": { "id": "TOcCuCN2CLm" },
                "translations": []
            },
            {
                "code": "HNQIS2",
                "name": "HNQIS 2.0",
                "id": "Jz4YKD15lnK",
                "sortOrder": 2,
                "optionSet": { "id": "TOcCuCN2CLm" },
                "translations": []
            },
            {
                "code": "RDQA",
                "name": "RDQA",
                "id": "QR0HHcQri91",
                "sortOrder": 3,
                "optionSet": { "id": "TOcCuCN2CLm" },
                "translations": []
            },
            {
                "code": "EDS",
                "name": "EDS",
                "id": "v9XPATv6G3N",
                "sortOrder": 4,
                "optionSet": { "id": "TOcCuCN2CLm" },
                "translations": []
            }
        ];

        metadata.options = metadata.options ?? [];
        metadata.options = metadata.options.concat(prgTypeOptions);

        setDownloading(true);

        const blob = new Blob([JSON.stringify(metadata)], { type: 'text/json' });
        const a = document.createElement('a');
        a.download = (metadata.programs[0].name) + '.json';
        a.href = window.URL.createObjectURL(blob);

        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        a.dispatchEvent(clickEvt);
        a.remove();

        setDownloading(false);
        hideForm();
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

                    {documentReady && programMetadata && legends && !exportError && getJSONKeyTree &&
                        <Box sx={{ width: '100%' }}>
                            <div style={{ lineHeight: '1.5em' }}>
                                <p><strong>Your file is ready!</strong></p>
                                <p>You can now download the metadata related to the program by clicking "Download Now".</p>
                                <p><br /><strong>Program:</strong> <em>{programMetadata.programs[0].name}</em></p>
                                <p><br />Before downloading you can customize the JSON Metadata file by changing the settings below.</p>
                                <hr style={{ margin: '8px 0' }} />
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
                                style={{ marginBottom: '1em', marginTop: '1em' }}
                                
                            >
                                {jsonHeaders.map(key => <Tab label={DHIS2_KEY_MAP[key]} value={key}/>)}
                            </Tabs>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                                {tabValue !== 0 && jsonKeyTree[tabValue].map(elem => <FormControlLabel control={<Checkbox defaultChecked />} label={elem} />)}
                            </div>

                            <p style={{ color: '#2c6693' }}><br /><strong>NOTE: </strong>Keep in mind that any <em>Option Groups</em> or <em>Option Group Sets</em> related to the program are <strong>NOT</strong> included in the downloaded file.</p>
                        </Box>
                    }
                </DialogContent>

                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => hideForm()} color="error" > Close </Button>
                    {documentReady && programMetadata && legends &&
                        <Button onClick={() => downloadFile()} variant='outlined' disabled={downloading} startIcon={<FileDownloadIcon />}> Download Now </Button>
                    }
                </DialogActions>

            </CustomMUIDialog>
        </>
    );
}

export default DependencyExport;