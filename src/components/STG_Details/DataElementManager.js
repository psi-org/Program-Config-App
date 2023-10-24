import { useDataQuery } from '@dhis2/app-runtime'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IconButton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from "@mui/material/InputAdornment";
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from "react";
import AlertDialogSlide from '../UIElements/AlertDialogSlide.js';
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'
import DataElementForm from "./DataElementForm.js";

const dataElementsSearchQuery = {
    results: {
        resource: 'dataElements',
        params: ({ token, page }) => ({
            //fields: ['id,valueType,displayName,lastUpdated'],
            fields: ['id,name,shortName,code,description,domainType,formName,valueType,aggregationType,optionSetValue,optionSet[id,name],legendSet[id,name],legendSets,attributeValues,displayName, lastUpdated'],
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
    index: PropTypes.number,
    value: PropTypes.number,
};

function a11yProps(index) {
    return {
        id: `de-tab-${index}`,
        'aria-controls': `de-tabpanel-${index}`,
    };
}

const DataElementManager = (props) => {

    const [newDataElements,setNewDataElements] = useState([])
    const [filterValue, setFilterValue] = useState('')
    const [saveDeFlag, setSaveDeFlag] = useState(false);
    const { loading: loadingSearch, refetch: search } = useDataQuery(dataElementsSearchQuery, { lazy: true, variables: { token: undefined, page: undefined } });
    
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event, newValue) => setTabValue(newValue)
    const handleChangeFilterValue = (event) => setFilterValue(event.target.value);

    const [dialogStatus, setDialogStatus] = useState(false)

    function hideForm() {
        props.setDeManager(false);
    }

    const craftDate = (params) => {
        const date = new Date(params.row.lastUpdated)
        return date.toLocaleString()
    }

    // DATA GRID //
    const [page, setPage] = useState(0)
    const [pageChanged,setPageChanged] = useState(false)
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)

    const [selectionModel, setSelectionModel] = useState([])
    const prevSelectionModel = useRef(selectionModel)

    const columns = [
        { field: "id", hide: true },
        { field: "displayName", headerName: "Name", flex: 7, editable: false },
        { field: "valueType", headerName: "Value Type", flex: 1, editable: false },
        { field: "lastUpdated", headerName: "Last Updated", flex: 2, editable: false, valueGetter: craftDate }
    ]

    const doSearch = async () => {
        const data = await search({ token: filterValue, page:page })
        if(data.results?.dataElements){
            setRows(data.results.dataElements)
            setTotalRows(data.results.pager.total)
            setSelectionModel(Array.from(prevSelectionModel.current))
        }
    }

    useEffect(()=>{
        if (page > 0) { doSearch() }
    },[page])

    useEffect(()=>{
        if( page > 0 ){
            if (pageChanged) {
                setPageChanged(false)
            } else {
                checkSelectedDE(selectionModel)
            }
        }
    },[selectionModel])
        
    useEffect(()=>{
    },[newDataElements])

    const checkSelectedDE = (model) => {
        setNewDataElements(model.map(id => {
            let deObject
            deObject = newDataElements.find(de => de.id === id)
            if (!deObject) { deObject = rows.find(de => de.id === id) }
            return deObject
        }))
    }
    // END DATA GRID //


    const handleNewDE = (dataElement) =>{
        dataElement.programStage = {
            id: props.deRef.stage
        }
        props.saveAdd({newDataElements:[dataElement],deRef:props.deRef})
        
    }

    function submission() {
        if(tabValue === 1){ //New DE
            setSaveDeFlag(true)
        }else{ //Existing DEs
            const newDEObjects = newDataElements.map(de => ({
                type:'added',
                displayInReports: false,
                compulsory: false,
                sortOrder: 1,
                programStage: {
                    id: props.deRef.stage
                },
                dataElement : de
            }))
            props.saveAdd({
                newDataElements: newDEObjects ,
                deRef:props.deRef
            })
            setSelectionModel([])
            setNewDataElements([])
            if (props.hnqisMode) { props.setSaveStatus('Validate & Save') }
        }
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth='xl' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => tabValue==0?hideForm(): setDialogStatus(true)}>
                    Add Data Element To Section [ {props.deRef.sectionName} ]
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="de tabs" variant="fullWidth">
                            <Tab icon={<SearchIcon />} iconPosition="start" label="Select Existing Data Elements" {...a11yProps(1)} />
                            <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Create New Data Element" {...a11yProps(0)} />
                        </Tabs>
                    </Box>
                </CustomMUIDialogTitle >
                <DialogContent style={{ padding: '0 2em 1em' }}>
                    

                    <Box sx={{ width: '100%' }}>

                        <TabPanel value={tabValue} index={0}>
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
                                    onKeyPress={event => {
                                        if (event.key === 'Enter' && filterValue!=='') {
                                            if (page === 1) {
                                                doSearch()
                                            } else { setPage(1) }
                                        }
                                    }}
                                    autoComplete='off'
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <Tooltip
                                                    title="Clear Search"
                                                    placement="left"
                                                >
                                                    <IconButton
                                                        onClick={() => {
                                                            setRows([]);
                                                            setTotalRows(0);
                                                            setPage(1);
                                                            setFilterValue('');
                                                        }}
                                                        style={{ marginRight: "0.5em" }}
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Button onClick={() => {
                                                    if (filterValue!=='') {
                                                        if (page === 1) {
                                                            doSearch()
                                                        } else { setPage(1) }
                                                    }
                                                }} 
                                                startIcon={<SearchIcon />} 
                                                variant='contained'
                                                color='primary'>
                                                    Search
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    page={page >= 1 ? page-1 : page}
                                    rows={rows}
                                    columns={columns}
                                    pagination
                                    checkboxSelection
                                    disableSelectionOnClick
                                    pageSize={50}
                                    rowsPerPageOptions={[50]}
                                    rowCount={totalRows}
                                    paginationMode="server"
                                    onPageChange={(newPage) => {
                                        setPageChanged(true)
                                        prevSelectionModel.current = selectionModel
                                        setPage(newPage+1)
                                    }}
                                    onSelectionModelChange={(newSelectionModel) => {
                                        setSelectionModel(newSelectionModel)
                                    }}
                                    selectionModel={selectionModel}
                                    loading={loadingSearch}
                                    isRowSelectable={
                                        (params) => !props.programStageDataElements.find(psde => psde.dataElement.id === params.row.id)
                                    }
                                    getRowClassName={
                                        (params) => props.programStageDataElements.find(psde => psde.dataElement.id === params.row.id) ? "opacity-5" : ""
                                    }
                                />
                            </div>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <DataElementForm
                                program={props.program}
                                programStageDataElement={{}}
                                section={{}}
                                setDeToEdit={undefined}
                                save={handleNewDE}
                                saveFlag={saveDeFlag}
                                setSaveFlag={setSaveDeFlag}
                                hnqisMode={props.hnqisMode}
                                setSaveStatus={props.setSaveStatus}
                            />
                        </TabPanel>
                    </Box>

                </DialogContent>
                <DialogActions style={{ margin:'0 1em', padding: '1em 0', borderTop: '1px solid', borderColor: 'rgba(0, 0, 0, 0.12)'}}>
                    <Button onClick={() => tabValue==0?hideForm(): setDialogStatus(true)} color="error"> Close </Button>
                    <AlertDialogSlide
                        open={dialogStatus}
                        title={"Do you really want to close the form?"}
                        icon={<WarningAmberIcon fontSize="large" color="warning" />}
                        content={"Warning: All unsaved changes will be discarded"}
                        primaryText={"Yes, close it"}
                        secondaryText={"No, keep me here"}
                        actions={{
                            primary: function () { setDialogStatus(false); hideForm() },
                            secondary: function () { setDialogStatus(false); }
                        }}
                    />
                    <Button disabled={tabValue==0 && newDataElements.length < 1} onClick={() => submission()} variant='contained' color="success" startIcon={<AddCircleOutlineIcon />}> {tabValue===0?'Add Selected Data Element(s)':'Create and Add Data Element'}</Button>
                </DialogActions>
            </CustomMUIDialog>
        </>
    )
}

DataElementManager.propTypes = {
    deRef: PropTypes.object,
    hnqisMode: PropTypes.bool,
    program: PropTypes.string,
    programStageDataElements: PropTypes.array,
    saveAdd: PropTypes.func,
    setDeManager: PropTypes.func,
    setSaveStatus: PropTypes.func,
}

export default DataElementManager;