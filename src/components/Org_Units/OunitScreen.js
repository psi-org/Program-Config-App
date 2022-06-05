import { useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import { OrganisationUnitTree } from "@dhis2/ui";
import {useState, useEffect} from "react";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, FormControl, InputLabel, TextField, Select, ButtonGroup, Button, MenuItem } from "@mui/material";

const ouQuery = {
    results: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: (level) => ({
            paging: false,
            fields: ['id','path'],
            level: [level]
        })
    }
}

const searchOrgUnitQuery = {
    results: {
        resource: 'organisationUnits',
        params: ({filterString}) => ({
           paging: 100,
            fields: ['id', 'displayName','path','children::isNotEmpty'],
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

const OunitScreen = ({id, orgUnitMetaData, setOrgUnitProgramId}) => {
    console.log("User Metadata: ", orgUnitMetaData);
    const programMetadata = {
        results: {
            resource: 'programs/' + id + '/metadata.json'
        }
    }
    const programOrgUnitsQuery = {
        results: {
            resource: 'programs/'+id+'.json',
            params: {
                fields: ['organisationUnits[id,path]']
            }
        },
    }
    let level, filterString;
    const [ orgUnitLevel, setOrgUnitLevel ] = useState(undefined);
    const [ orgUnitGroup, setOrgUnitGroup ] = useState('');
    const [ hasChanges, setHasChanges ] = useState(false);
    const [ selectedOrgUnits, setSelectedOrgUnits ] = useState([]);
    const [ orgUnitPathSelected, setOrgUnitPathSelected ] = useState([]);
    const [ orgUnitTreeRoot, setOrgUnitTreeRoot ] = useState(orgUnitMetaData.userOrgUnits?.organisationUnits.map(ou => ou.id))

    const oUnits = useDataQuery(ouQuery, {lazy: true, variables: {id: id, level:level}});
    const searchOunits = useDataQuery(searchOrgUnitQuery, {variables: {filterString: filterString}});
    const {loading: metadataLoading, data: prgMetaData} = useDataQuery(programMetadata);
    const {loading: poLoading, data: prgOrgUnitData} = useDataQuery(programOrgUnitsQuery);
    const metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }
    useEffect(()=> {
        if (!poLoading)
        {
            setSelectedOrgUnits([...prgOrgUnitData.results?.organisationUnits.map(ou => ou.id)]);
            setOrgUnitPathSelected([...prgOrgUnitData.results?.organisationUnits.map(ou => ou.path)]);
        }
    }, [prgOrgUnitData])


    let userOrgUnits = orgUnitMetaData.userOrgUnits?.organisationUnits.map(ou => ou.id);

    const hideForm = () => {
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

    const organisationUnitFilterHandler = (event) => {
        if (event.target.value.length > 0)
        {
            searchOunits.refetch({filterString: event.target.value}).then(data => {
                setOrgUnitTreeRoot(data.results?.organisationUnits.map(ou => ou.id));
                console.log("Data: ", data);
            });
        }
        else {
            setOrgUnitTreeRoot(userOrgUnits);
        }
    }

    const handleLevelChange = (event) => {
        level = event.target.value;
        setOrgUnitLevel(level);
        let id = userOrgUnits[0];
        oUnits.refetch({id: id, level: level}).then(data => {
           if (data) {
               console.log("Data: ", data);

           }
        }, [id, level]);
        console.log("OUtside");
    };

    const handleGroupChange = (event) => {
        setOrgUnitGroup(event.target.value);
    };

    const orgUnitAssignmentHandler = () => {
        if (!metadataLoading)
        {
            let metadata = {};
            metadata.programs = prgMetaData.results?.programs;
            metadata.programs[0].organisationUnits = selectedOrgUnits.map((ounit) => { return { id: ounit }});
            console.log("program: ", metadata.program);
            metadataRequest.mutate({data: metadata})
                .then(response=>{
                    console.log("Response: ", response);
                    if(response.status !== 'OK')
                    {
                        console.log("Somethign went wrong");
                    }
                    else {
                        console.log("Success");
                    }
                })
        }
    }



    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle onClose={()=>hideForm()} id={"orgUnit_assignemnt_dialog_title"}>Assign Organisation Unit</CustomMUIDialogTitle>
                <DialogContent dividers style={{ padding: '1em 2em'}}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ position: "relative", minWidth: "850px"}}>
                            <TextField id={"filterOrgUnitName"} label={"Filtering Organisation unit by Name"} onChange={organisationUnitFilterHandler} variant={"standard"} style={{ width: "100%"}}/>
                            <div style={{ marginTop: "10px"}}> { selectedOrgUnits.length } Organisation units selected </div>
                            {!poLoading &&
                                <div style={{ minHeight: "300px", maxHeight: "450px", minWidth: "300px", maxWidth: "480px", overflow: "auto", border: "1px solid rgb(189, 189, 189)", borderRadius: "3px", padding: "4px", margin: "4px 0px", display: "inline-block", verticalAlign: "top"}}>
                                    <OrganisationUnitTree name={"Root org unit"} roots={orgUnitTreeRoot} onChange={orgUnitSelectionHandler} selected={ orgUnitPathSelected }/>
                                </div>
                            }
                            <div style={{width: "400px", background: "white", marginLeft: "1rem", marginTop: "1rem", display: "inline-block"}}>
                                <span>For Organisation units within</span>
                                <div style={{ flexDirection: "row"}}>
                                    <FormControl variant={"standard"} style={{ width: "200px"}}>
                                        <InputLabel id={"organisation-unit-level-label"}>Organisation Unit Level</InputLabel>
                                        <Select labelId={"orgUnitLevelId"} value={orgUnitLevel} onChange={handleLevelChange} label={"Organisation Unit Level"}>
                                            <MenuItem value={undefined} key={undefined}>None</MenuItem>
                                            {
                                                orgUnitTreeRoot.orgUnitLevels?.organisationUnitLevels.map(function(ouLevel){
                                                    return <MenuItem value={ouLevel.level} key={ouLevel.id}><em>{ouLevel.displayName}</em></MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <ButtonGroup variant="outlined" style={{ marginTop: "12px", marginLeft: "10px"}}>
                                        <Button disabled={(!orgUnitLevel)}>SELECT</Button>
                                        <Button disabled={(!orgUnitLevel)}>DESELECT</Button>
                                    </ButtonGroup>
                                </div>
                                <div style={{ flexDirection: "row"}}>
                                    <FormControl variant={"standard"} style={{ width: "200px"}}>
                                        <InputLabel id={"organisation-unit-Group-label"}>Organisation Unit Group</InputLabel>
                                        <Select labelId={"orgUnitGroupId"} value={orgUnitGroup} onChange={handleGroupChange} label={"Organisation Unit Group"}>
                                            <MenuItem value={undefined} key={undefined}>None</MenuItem>
                                            {
                                                orgUnitTreeRoot.orgUnitGroups?.organisationUnitGroups.map(function(ouGroup){
                                                    return <MenuItem value={ouGroup.id} key={ouGroup.id}><em>{ouGroup.displayName}</em></MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <ButtonGroup variant="outlined" style={{ marginTop: "12px", marginLeft: "10px"}}>
                                        <Button disabled={(!orgUnitGroup)}>SELECT</Button>
                                        <Button disabled={(!orgUnitGroup)}>DESELECT</Button>
                                    </ButtonGroup>

                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '1em'}}>
                    <Button onClick={() => hideForm()} color={"error"}>Close</Button>
                    {hasChanges && <Button onClick={()=> orgUnitAssignmentHandler()} color={"primary"}>Apply</Button>}
                </DialogActions>
            </CustomMUIDialog>
        </>
    )
}

export default OunitScreen;