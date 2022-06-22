import { useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import { OrganisationUnitTree } from "@dhis2/ui";
import {useState, useEffect, useRef} from "react";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, FormControl, InputLabel, TextField, Select, ButtonGroup, Button, MenuItem, Box, CircularProgress } from "@mui/material";

const orgUnitsQuery = {
    userOrgUnits: {
        resource: 'me',
        params: {
            fields: ['organisationUnits[id, path]']
        }
    },
    orgUnitGroups: {
        resource: 'organisationUnitGroups',
        params: {
            paging: false,
            fields: ['id','displayName'],
            order: 'displayName'
        }
    },
    orgUnitLevels: {
        resource: 'organisationUnitLevels',
        params: {
            paging: false,
            fields: ['id','level','displayName'],
            order: 'level'
        }
    }
}

const ouQuery = {
    results: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: ({level}) => ({
            paging: false,
            fields: ['id','path'],
            level: [level]
        })
    }
}

const ouGroupQuery = {
    results: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: ({groupId}) => ({
            paging: false,
            fields: ['id','path'],
            includeDescendants: true,
            filter: ['organisationUnitGroups.id:eq:'+groupId]
        })
    }
}

const searchOrgUnitQuery = {
    results: {
        resource: 'organisationUnits',
        params: ({filterString}) => ({
            pageSize: 100,
            fields: ['id','path','displayName','children::isNotEmpty'],
            filter: [`displayName:ilike:${filterString}`],
            withinUserHierarchy: true
        })
    }

}

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({data}) => data
};

const programOrgUnitsQuery = {
    results: {
        resource: 'programs',
        id: ({ id }) => id,
        params: {
            fields: ['organisationUnits[id]','organisationUnits[path]']
        }
    },
};

const OunitScreen = ({id, setOrgUnitProgramId, setNotification}) => {
    const programMetadata = {
        results: {
            resource: 'programs/' + id + '/metadata.json'
        }
    }
    let level, filterString, groupId;
    const filterRef = useRef();
    const [ orgUnitLevel, setOrgUnitLevel ] = useState(undefined);
    const [ orgUnitGroup, setOrgUnitGroup ] = useState('');
    const [ hasChanges, setHasChanges ] = useState(false);
    const [ content, setContent ] = useState('form');
    const [ importStatus, setImportStatus ] = useState({});
    const [ selectedOrgUnits, setSelectedOrgUnits ] = useState([]);
    const [ orgUnitPathSelected, setOrgUnitPathSelected ] = useState([]);
    const [ orgUnitTreeRoot, setOrgUnitTreeRoot ] = useState([]);

    const {loading: ouMetadataLoading, data: ouMetadata} = useDataQuery(orgUnitsQuery);
    const oUnits = useDataQuery(ouQuery, {variables: {id: id, level:level}});
    const oUnitsByGroups = useDataQuery(ouGroupQuery, {variables: {id: id, groupId: groupId}});
    const searchOunits = useDataQuery(searchOrgUnitQuery, {variables: {filterString: filterString}});
    const {loading: metadataLoading, data: prgMetaData} = useDataQuery(programMetadata);
    const {loading: poLoading, data: prgOrgUnitData} = useDataQuery(programOrgUnitsQuery, {variables: {id: id}});
    const metadataDM = useDataMutation(metadataMutation);

    let userOrgUnits;

    useEffect(() => {
        if (!ouMetadataLoading) {
            setOrgUnitTreeRoot([...ouMetadata.userOrgUnits?.organisationUnits.map(ou => ou.id)]);
        }
    }, [ouMetadata]);

    useEffect(()=> {
        if (!poLoading)
        {
            setSelectedOrgUnits([...prgOrgUnitData.results?.organisationUnits.map(ou => ou.id)]);
            setOrgUnitPathSelected([...prgOrgUnitData.results?.organisationUnits.map(ou => ou.path)]);
        }
    }, [prgOrgUnitData])

    if (!ouMetadataLoading)
    {
        userOrgUnits = ouMetadata.userOrgUnits?.organisationUnits.map(ou => ou.id);
    }

    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }

    const hideFormHandler = () => {
        setOrgUnitProgramId(undefined)
    };

    const orgUnitSelectionHandler = (event) => {
        if (event.checked)
        {
            setSelectedOrgUnits(prevState => [...prevState, event.id]);
            setOrgUnitPathSelected(prevState => [...prevState, event.path]);
        }
        else {
            setSelectedOrgUnits(prevState => prevState.filter(function (e) {
                return e !== event.id
            }))
            setOrgUnitPathSelected(orgUnitPathSelected.filter(function (e) {
                return e !== event.path
            }));
        }
        setHasChanges(true);
    };
    //TODO: Organisation Units filter not 100% working. Missing search by Code, shortName
    const organisationUnitFilterHandler = (event) => {
        if (event.target.value.length > 0)
        {
            let filterString = document.getElementById("filterOrgUnitName").value;
            searchOunits.refetch({filterString: filterString}).then(data => {
                if (typeof data.results !== "undefined") {
                    setOrgUnitTreeRoot([]);
                    setOrgUnitTreeRoot([...data.results?.organisationUnits.map(ou => ou.id)]);
                    // const rootOrgUnits = orgUnits.results.organisationUnits.filter(ou=>(new RegExp(`${filterString}`)).test(ou.displayName)).map(ou=> ou.id);
                    // setOrgUnitTreeRoot([...rootOrgUnits]);;
                }
            });
        }
        else {
            setOrgUnitTreeRoot(userOrgUnits);
        }
    }

    const ouLevelAssignmentHandler = () => {
        let id = userOrgUnits[0];
        let oulevel = parseInt(orgUnitLevel)-1; //TODO: not sure why i am substracting it over here
        oUnits.refetch({id: id, level: oulevel}).then(data => {
           if (data) {
               selectOrgUnits(data);
           }
        });
    };

    const ouLevelRemovalHandler = () => {
        let id = userOrgUnits[0];
        let oulevel = parseInt(orgUnitLevel)-1; //TODO: not sure why i am substracting it over here
        oUnits.refetch({id: id, level: oulevel}).then(data => {
            if (data) {
                deselectOrgUnits(data);
            }
        });
    }

    const ouGroupAssignmentHandler = () => {
        let id = userOrgUnits[0];
        oUnitsByGroups.refetch({id: id, groupId: orgUnitGroup}).then(data => {
            if(data) {
                selectOrgUnits(data);
            }
        })
    };

    const ouGroupRemovalHandler = () => {
        let id = userOrgUnits[0];
        oUnitsByGroups.refetch({id: id, groupId: orgUnitGroup}).then(data => {
            if(data) {
                deselectOrgUnits(data);
            }
        })
    };

    const selectOrgUnits = (data) => {
        setSelectedOrgUnits(prevState => [...prevState, ...data.results?.organisationUnits.map(ou => ou.id)]);
        setOrgUnitPathSelected(prevState => [...prevState, ...data.results?.organisationUnits.map(ou => ou.path)]);
        setHasChanges(true);
    }

    const deselectOrgUnits = (data) => {
        const ounits = data.results?.organisationUnits;
        setSelectedOrgUnits(prevState => prevState.filter(ou => !ounits.find(ou2 => (ou2.id === ou))));
        setOrgUnitPathSelected(prevState => prevState.filter(ou => !ounits.find(ou2 => (ou2.path === ou))))
        setHasChanges(true);
    }

    const orgUnitAssignmentHandler = () => {
        setContent('loading');
        if (!metadataLoading)
        {
            let metadata = {};
            metadata.programs = prgMetaData.results?.programs;
            metadata.programs[0].organisationUnits = selectedOrgUnits.map((ounit) => { return { id: ounit }});
            metadataRequest.mutate({data: metadata})
                .then(response=>{
                    console.log("Response: ", response);
                    if(response.status !== 'OK')
                    {
                        setContent('status');
                    }
                    else {
                        setContent('status');
                        setNotification({ 
                            message: `Organisation Units assigned successfully! (Total: ${selectedOrgUnits.length})`, 
                            severity: 'success' 
                        })
                        hideFormHandler()
                    }
                })
        }
    }



    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle onClose={hideFormHandler} id={"orgUnit_assignemnt_dialog_title"}>Assign Organisation Units</CustomMUIDialogTitle>
                <DialogContent dividers style={{ padding: '1em 2em'}}>
                    {content === 'loading' && <Box sx={{ display: 'inline-flex' }}><CircularProgress /></Box>}
                    {content === 'form' &&
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ position: "relative", minWidth: "850px"}}>
                            <TextField id={"filterOrgUnitName"} label={"Filtering Organisation unit by Name"} /*onChange={organisationUnitFilterHandler}*/ variant={"standard"} ref={filterRef} style={{ width: "100%"}}/>
                            <div style={{ marginTop: "10px"}}> { selectedOrgUnits.length } Organisation units selected </div>
                            {!poLoading &&
                                <div style={{ minHeight: "300px", maxHeight: "450px", minWidth: "300px", maxWidth: "480px", overflow: "auto", border: "1px solid rgb(189, 189, 189)", borderRadius: "3px", padding: "4px", margin: "4px 0px", display: "inline-block", verticalAlign: "top"}}>
                                    <OrganisationUnitTree name={"Root org unit"} roots={orgUnitTreeRoot} onChange={orgUnitSelectionHandler} selected={ orgUnitPathSelected } initiallyExpanded={ selectedOrgUnits }/>
                                </div>
                            }
                            <div style={{width: "400px", background: "white", marginLeft: "1rem", marginTop: "1rem", display: "inline-block"}}>
                                <span>For Organisation units within</span>
                                <div style={{ flexDirection: "row"}}>
                                    <FormControl variant={"standard"} style={{ width: "200px"}}>
                                        <InputLabel id={"organisation-unit-level-label"}>Organisation Unit Level</InputLabel>
                                        <Select labelId={"orgUnitLevelId"} label={"Organisation Unit Level"} onChange={(event) => setOrgUnitLevel(event.target.value)}>
                                            <MenuItem value={undefined} key={undefined}>None</MenuItem>
                                            {!ouMetadataLoading &&
                                                ouMetadata.orgUnitLevels?.organisationUnitLevels.map(function(ouLevel){
                                                    return <MenuItem value={ouLevel.level} key={ouLevel.id}><em>{ouLevel.displayName}</em></MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <ButtonGroup variant="outlined" style={{ marginTop: "12px", marginLeft: "10px"}}>
                                        <Button disabled={(!orgUnitLevel)} onClick={ouLevelAssignmentHandler}>SELECT</Button>
                                        <Button disabled={(!orgUnitLevel)} onClick={ouLevelRemovalHandler}>DESELECT</Button>
                                    </ButtonGroup>
                                </div>
                                <div style={{ flexDirection: "row"}}>
                                    <FormControl variant={"standard"} style={{ width: "200px"}}>
                                        <InputLabel id={"organisation-unit-Group-label"}>Organisation Unit Group</InputLabel>
                                        <Select labelId={"orgUnitGroupId"} label={"Organisation Unit Group"} onChange={(event) => setOrgUnitGroup(event.target.value)}>
                                            <MenuItem value={undefined} key={undefined}>None</MenuItem>
                                            { !ouMetadataLoading &&
                                                ouMetadata.orgUnitGroups?.organisationUnitGroups.map(function(ouGroup){
                                                    return <MenuItem value={ouGroup.id} key={ouGroup.id}><em>{ouGroup.displayName}</em></MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <ButtonGroup variant="outlined" style={{ marginTop: "12px", marginLeft: "10px"}}>
                                        <Button disabled={(!orgUnitGroup)} onClick={ouGroupAssignmentHandler}>SELECT</Button>
                                        <Button disabled={(!orgUnitGroup)} onClick={ouGroupRemovalHandler}>DESELECT</Button>
                                    </ButtonGroup>

                                </div>
                            </div>
                        </div>
                    </div>
                    }
                    {content === 'status' &&
                    <div>
                        <b>Import Status</b><hr />
                        <p>Created: {importStatus.created}</p>
                        <p>Updated: {importStatus.updated}</p>
                        <p>Deleted: {importStatus.deleted}</p>
                        <p>Ignored: {importStatus.ignored}</p>
                        <p>Total: {importStatus.total}</p>
                    </div>}
                </DialogContent>
                <DialogActions style={{ padding: '1em'}}>
                    <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                    {hasChanges && <Button onClick={orgUnitAssignmentHandler} color={"primary"}>Apply</Button>}
                </DialogActions>
            </CustomMUIDialog>
        </>
    )
}

export default OunitScreen;