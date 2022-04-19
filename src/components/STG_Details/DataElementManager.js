import React from 'react';
import { useState, useRef } from "react";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import SendIcon from '@mui/icons-material/Send';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import DataElementForm from "./DataElementForm";

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

import { height } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import InputAdornment from "@mui/material/InputAdornment";

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};
//api/dataElements.json?&filter=identifiable:token:{PARAMETRO}&filter=name:ne:default&fields=displayName,id,lastUpdated&filter=domainType:eq:TRACKER

const dataElementsSearchQuery = {
    results: {
        resource: 'dataElements',
        params: ({ token, page }) => ({
            fields: ['id,valueType,displayName,lastUpdated'],
            filter: [`identifiable:token:${token}`, 'name:ne:default', 'domainType:eq:TRACKER'],
            page: page
        })
    }
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`de-tabpanel-${index}`}
            aria-labelledby={`de-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `de-tab-${index}`,
        'aria-controls': `de-tabpanel-${index}`,
    };
}

const DataElementManager = (props) => {

    /* const [section, setSection] = useState(props.sections[props.sectionIndex] || {})
    const [sectionName, setSectionName] = useState(section.name || '')
    const [sentForm, setSentForm] = useState(false);

    const idsQuery = useDataQuery(queryId);
    const sectionId = idsQuery.data?.results.codes[0]; */

    const { data: dataElements, loading:loadingSearch, refetch: search } = useDataQuery(dataElementsSearchQuery, { lazy: true, variables: { token: undefined, page:undefined } });
    const [tabValue, setTabValue] = useState(0);

    /**
     *  search({ token:'X' }).then(data => {
            if (data) {
                setUidPool(data.results.codes)
            }
        })
     */

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangeFilterValue = (event) => {
        setFilterValue(event.target.value);
    };

    function hideForm() {
        props.setDeManager(false);
    }

    const [filterValue, setFilterValue] = useState('')

    const [page, setPage] = useState(1)
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [selectionModel, setSelectionModel] = useState([])
    const [loading, setLoading] = useState(false)
    const prevSelectionModel = useRef(selectionModel)

    const craftDate = (params) => {
        let date = new Date(params.row.lastUpdated)
        return date.toLocaleString()
    }

    const columns = [
        { field: "id", hide: true },
        { field: "displayName", headerName: "Name", flex: 7, editable: false, resizable: true },
        { field: "valueType", headerName: "Value Type", flex: 1, editable: false },
        { field: "lastUpdated", headerName: "Last Updated", flex: 2, editable: false, valueGetter: craftDate }
    ]

    const initSearch = (nextPage=1) => {
        setPage(nextPage)
        search({ token: filterValue, page:nextPage }).then(data => {
            if (data?.results?.dataElements) {
                setRows(data.results.dataElements)
                setTotalRows(data.results.pager.total)
                setSelectionModel(prevSelectionModel.current)
            }
        })
    }

    function submission() {
        /* setSentForm(true)
        if (formDataIsValid()) {
            section.name = sectionName
            section.displayName = sectionName
            if(props.sectionIndex!==undefined){
                props.sections[props.sectionIndex] = section
            }else if(props.newSectionIndex!==undefined){
                section.dataElements = []
                section.id = sectionId
                props.sections.splice(props.newSectionIndex, 0, section);
            }
            console.log(props.sections)
            props.refreshSections(props.sections)
            props.notify(<span>Section {props.newSectionIndex!==undefined?'created':'edited'}! <strong>Remember to Validate and Save!</strong></span>)
            hideForm()
        } */
        console.log(selectionModel)
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth='xl' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                    Add Data Element
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>

                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="de tabs" variant="fullWidth">
                                <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Create New Data Element" {...a11yProps(0)} />
                                <Tab icon={<SearchIcon />} iconPosition="start" label="Select Existing Data Element" {...a11yProps(1)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0}>
                            <DataElementForm
                                programStageDataElement={{
                                    "id": "j5opfj5JoOK",
                                    "displayInReports": false,
                                    "compulsory": false,
                                    "sortOrder": 1,
                                    "programStage": {
                                        "id": "WbN5QwSKusT"
                                    },
                                    "dataElement": {
                                        "code": "SO HNQIS2 FP__S13Q1",
                                        "name": "SO HNQIS2 FP__S13Q1_Ensures correct vial and dosage; expiration date is not passed",
                                        "id": "YdQ3U6rWO6C",
                                        "shortName": "SO HNQIS2 FP__S13Q1_Ensures correct vial and dosag",
                                        "aggregationType": "SUM",
                                        "domainType": "TRACKER",
                                        "displayName": "SO HNQIS2 FP__S13Q1_Ensures correct vial and dosage; expiration date is not passed",
                                        "formName": "Ensures correct vial and dosage; expiration date is not passed",
                                        "valueType": "NUMBER",
                                        "optionSetValue": true,
                                        "optionSet": {
                                            "name": "HNQIS - Yes1No0",
                                            "id": "v6QYyj8ihWn"
                                        },
                                        "attributeValues": [
                                            {
                                                "value": "{\"isCompulsory\":\"No\",\"isCritical\":\"No\",\"elemType\":\"question\",\"varName\":\"_S13Q1\",\"scoreNum\":1,\"scoreDen\":1,\"parentQuestion\":\"P3h2eI0Sqd2\",\"parentValue\":1}",
                                                "attribute": {
                                                    "id": "haUflNqP85K"
                                                }
                                            },
                                            {
                                                "value": "12.1",
                                                "attribute": {
                                                    "id": "LP171jpctBm"
                                                }
                                            }
                                        ],
                                        "legendSets": []
                                    }
                                }}
                                section={{}}
                                setDeToEdit={undefined}
                                save={undefined}
                            />
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    margin="normal"
                                    id="name"
                                    label="Filter Data Elements by Name, Short Name, Code..."
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={filterValue}
                                    onChange={handleChangeFilterValue}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment>
                                                <Button onClick={() => initSearch()} startIcon={<SearchIcon />} variant='contained' color='primary'>
                                                    Search
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pagination
                                    checkboxSelection
                                    pageSize={50}
                                    rowsPerPageOptions={[50]}
                                    rowCount={totalRows}
                                    paginationMode="server"
                                    onPageChange={(newPage) => {
                                        prevSelectionModel.current = selectionModel
                                        initSearch(newPage+1)
                                    }}
                                    onSelectionModelChange={(newSelectionModel) => {
                                        console.log(newSelectionModel)
                                        setSelectionModel(newSelectionModel)
                                    }}
                                    selectionModel={selectionModel}
                                    loading={loadingSearch}
                                />
                            </div>
                        </TabPanel>
                    </Box>

                </DialogContent>
                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => hideForm()} color="error" > Close </Button>
                    <Button onClick={() => submission()} variant='contained' color="success" startIcon={<AddCircleOutlineIcon />}> Add </Button>
                </DialogActions>
            </CustomMUIDialog>
        </>
    )
}


export default DataElementManager;