import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, Modal, ModalContent, ModalTitle, NoticeBox, ModalActions, ButtonStrip, CenteredContent } from "@dhis2/ui";
import SharingItem from './SharingItem';
import { DeepCopy, parseErrors, truncateString } from '../../configs/Utils';

import EditIcon from '@mui/icons-material/Edit';
import { useRef, useState, useEffect } from "react";
import Suggestions from "./Suggestions";
import SharingOptions from "./SharingOptions";
import ViewIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from "@mui/material/IconButton";
import Alert from '@mui/material/Alert';
import HelpIcon from '@mui/icons-material/Help';

import {
    CircularProgress,
    Box,
    Button,
    ButtonGroup,
    Grow,
    Paper,
    Popper,
    MenuItem,
    MenuList,
    FormGroup, FormControlLabel, Checkbox, Tooltip
} from "@mui/material";
import ObjectSharing from "./ObjectSharing";

const sharingQuery = {
    results: {
        resource: 'sharing',
        params: ({ element, id }) => ({
            id,
            type: element
        }),
    }
}

const entitiesQuery = {
    userData: {
        resource: 'users',
        params: {
            paging: false,
            fields: ['id', 'name', 'displayName', 'userCredentials[username]']
        }
    },
    userGroupData: {
        resource: 'userGroups',
        params: {
            paging: false,
            fields: ['id', 'name', 'displayName']
        }
    }
}

const visualizationQuery = {
    result : {
        resource: 'visualizations',
        params: ({ id }) => ({
            filter: [`code:like:${id}_Scripted`],
            fields: ['id']
        }),
    }
}

const psDataElementAccess = {
    des: {
        resource: 'programs',
        id: ({id}) => id,
        params: {
            paging: false,
            fields: ['programStages[programStageDataElements[dataElement[id,name,access]]]']
        }
    }
};

const queryMaps = {
    results: {
        resource: 'maps',
        params: _ref7 => {
            let {
                programId
            } = _ref7;
            return {
                filter: ["code:like:".concat(programId, "_Scripted")],
                fields: ['id']
            };
        }
    }
};
const queryEventReport = {
    results: {
        resource: 'eventReports',
        params: _ref9 => {
            let {
                programId
            } = _ref9;
            return {
                filter: ["code:like:".concat(programId, "_Scripted")],
                fields: ['id']
            };
        }
    }
};
const queryDashboards = {
    results: {
        resource: 'dashboards',
        params: _ref11 => {
            let {
                programId
            } = _ref11;
            return {
                fields: ['id'],
                filter: ["code:like:".concat(programId)]
            };
        }
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const btnOptions = ['Apply Only to Program', 'Apply to Program & Program Stages', 'Apply to Program, Program Stages & Data Elements'];

const SharingScreen = ({ element, id, setSharingProgramId, type, setType, readOnly, setNotification }) => {

    const programMetadata = {
        results: {
            resource: 'programs/' + id + '/metadata.json'
        }
    }

    const [search, setSearch] = useState(undefined);
    const [usrGrp, setUsrGrp] = useState(undefined);
    const [optionOpen, setOptionOpen] = useState(undefined);
    const [usrPermission, setUsrPermission] = useState('r-r-----');
    const [entityType, setEntityType] = useState(undefined);
    const [entity, setEntity] = useState({});
    const [open, setOpen] = useState(false);
    const [importStatus, setImportStatus] = useState({});
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(type==='hnqis'?2:0);
    const [content, setContent] = useState('form');
    const [overwrite, setOverwrite] = useState(false);
    const [deleted, setDeleted] = useState([]);
    const [ restrictions, setRestrictions ] = useState([]);
    const [ restrictedDEs, setRestrictedDEs] = useState([]);
    const [ runAdditionalSharing, setRunAdditionalSharing] = useState(false);
    const [ additionalElements, setAdditionalElements ] = useState([]);

    const { loading, error, data } = useDataQuery(sharingQuery, { variables: { element: element, id: id } });
    const { loading: entityLoading, data: entities, error: entityErrors } = useDataQuery(entitiesQuery);
    const { loading: metadataLoading, data: prgMetaData } = useDataQuery(programMetadata);
    const { loading: prgDELoading, data: prgDEData } = useDataQuery(psDataElementAccess, {variables: {id: id}});
    const { loading: visualizerLoading, data: vData } = useDataQuery(visualizationQuery, {variables: {id: id}});
    const mapsDQ = useDataQuery(queryMaps, { variables: { programId: id}});
    const eventReportDQ = useDataQuery(queryEventReport, { variables: { programId: id}});
    const dashboardsDQ = useDataQuery(queryDashboards, { variables: { programId: id}});

    const metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }

    let payload, usersNGroups, metadata;
    let userAccessRestricted = false;
    let errorStates = [];
    let hnqisElements = [];
    const exclusionDataElements = ["NAaHST5ZDTE", "VqBfZjZhKkU", "pzWDtDUorBt" , "F0Qcr8ANr7t", "DIoqtxbSJIL", "nswci5V4j0d"]; //Excluding HNQIS2 specific data elements from sharing update

    useEffect(()=> {
        if(readOnly) {
            setRestrictions(prev => [...prev, "You don't have access to update this program"]);
        }
    }, [readOnly])

    if (!loading) {
        payload = data.results;
        if (!entityLoading && !entityErrors) {
            usersNGroups = availableUserGroups();
        } else if(entityErrors) {
            userAccessRestricted = true;
        }
    }

    useEffect(() => {
        if (!entityLoading && entityErrors) {
            setRestrictions(prev => [...prev, "You don't have access to Users List"]);
        }
    }, [entityLoading, entityErrors])

    useEffect(()=> {
        if (!prgDELoading && prgDEData) {
            const prgStages = prgDEData.des?.programStages;
            let restrictedDataElements = [];
            prgStages.forEach(ps => {
                ps.programStageDataElements.forEach(de => {
                    if (!de.dataElement.access.update && !exclusionDataElements.includes(de.dataElement.id)) {
                        restrictedDataElements.push({"id": de.dataElement.id, "name": de.dataElement.name});
                    }
                });
            });
            if (restrictedDataElements.length > 0) {
                setSelectedIndex(1);
                setRestrictions(prev => [...prev, "You don't have update access to Data Elements Listed below"]);
                setRestrictedDEs(restrictedDataElements);
            }
        }
    }, [prgDEData])


    const toggle = () => setOptionOpen(!optionOpen);

    if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
    if (loading) return <CircularLoader />


    if (!metadataLoading && prgMetaData) {
        metadata = prgMetaData.results;
        let psde = metadata.programStages?.map(ps => ps.programStageDataElements.map(psde => psde.dataElement.id))?.flat()
        metadata.dataElements = metadata.dataElements?.filter(de => psde.includes(de.id))
    }


    const hideForm = () => {
        setSharingProgramId(undefined)
        setType(undefined)
    }

    const loadSuggestions = (search) => {
        setUsrGrp(search);
        setSearch(search);
    }

    const addEntity = (type, ent) => {
        setUsrGrp(ent.displayName);
        setEntityType(type);

        let e = { ...ent };
        e.access = usrPermission;
        setEntity(e);
    }

    const setEntityPermission = (permission) => {
        let e = { ...entity };
        setUsrPermission(permission);
        e.access = permission;
        setEntity(e);
    }

    const assignRole = () => {
        payload.object[entityType].push(entity);
        usersNGroups = availableUserGroups();
        setUsrGrp(undefined);
    }

    const userPermissionState = () => {
        return (<IconButton color='inherit' style={{marginRight: '1em'}}>{(usrPermission[1] === "w") ? <EditIcon /> : (usrPermission[0] === "r" && usrPermission[1] !== "w") ? <ViewIcon /> : <BlockIcon />}</IconButton>)
    }

    const handleSuggestions = (e) => {
        loadSuggestions(e.target.value)
    }

    const handleClick = () => {
        apply(selectedIndex);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
     };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const handleCheckbox = (event) => {
        setOverwrite(event.target.checked);
    }

    function availableUserGroups() {
        let obj = payload.object;
        let e = DeepCopy(entities);
        if (e !== null) {
            obj.userAccesses.forEach((ua) => {
                e.userData.users.splice(e.userData.users.findIndex(u => {
                    return u.id === ua.id
                }), 1);
            });
            obj.userGroupAccesses.forEach((uga) => {
                e.userGroupData.userGroups.splice(e.userGroupData.userGroups.findIndex(ug => {
                    return ug.id === uga.id
                }), 1);
            })
        }
        return e;
    }

    const deleteUserPermission = (type, id) => {
        switch (type) {
            case 'publicAccess':
                data.results.meta.allowPublicAccess = false;
                data.results.object.publicAccess = "--------";
                break;
            case 'userAccesses':
                var userIndex = data.results.object.userAccesses.findIndex(user => { return user.id === id });
                data.results.object.userAccesses.splice(userIndex, 1);
                setDeleted(deleted => [...deleted, { id: id, type: "users" }]);
                // setDeleted(deleted => deleted.userAccesses.push(id));
                break;
            case 'userGroupAccesses':
                var userGroupIndex = data.results.object.userGroupAccesses.findIndex(userGroup => { return userGroup.id === id });
                data.results.object.userGroupAccesses.splice(userGroupIndex, 1);
                setDeleted(deleted => [...deleted, { id: id, type: "userGroups" }]);
                // setDeleted(deleted => deleted.userGroupAccesses.push(id));
                break;
            default:
                break;
        }
    }

    const updateUserPermission = (type, id, permission) => {
        switch (type) {
            case 'publicAccess':
                payload.meta.allowPublicAccess = (permission !== "--------");
                payload.object.publicAccess = permission;
                break;
            case 'userAccesses':
                var userIndex = payload.object.userAccesses.findIndex(user => { return user.id === id });
                payload.object.userAccesses[userIndex].access = permission;
                break;
            case 'userGroupAccesses':
                var userGroupIndex = payload.object.userGroupAccesses.findIndex(userGroup => { return userGroup.id === id });
                payload.object.userGroupAccesses[userGroupIndex].access = permission;
                break;
            default:
                break;
        }

        usersNGroups = availableUserGroups();
    }

    const apply = (level) => {
        setContent('loading');

        const programTypeId = metadata.attributes.filter((attribute) => {
            return attribute.code === "PROGRAM_TYPE"
        })[0]?.id;
        const programType = programTypeId?metadata.programs[0].attributeValues.filter((av) => { return av.attribute.id === programTypeId})[0].value:'Tracker';

        if (programType === "HNQIS2")
        {
            addHNQISElement4Sharing();
            if (hnqisElements.length > 0)
                setAdditionalElements([...hnqisElements]);
                setRunAdditionalSharing(true);
        }

        let payloadMetadata = {};
        payloadMetadata.programs = metadata.programs;
        payloadMetadata.programIndicators = metadata.programIndicators;
        switch (level) {
            case 2:
                payloadMetadata.dataElements = metadata.dataElements;
            case 1:
                payloadMetadata.programStages = metadata.programStages;
                break;
            default:
                break;
        }
        Object.keys(payloadMetadata).forEach(meta => {
            applySharing(payloadMetadata[meta],meta);
        });
        metadataRequest.mutate({ data: payloadMetadata })
            .then(response => {
                if(response?.status === "OK"){
                    setNotification({
                        message: `Chages to the Sharing Settings applied successfully`,
                        severity: 'success'
                    })
                }else{
                    setNotification({
                        message: parseErrors(response),
                        severity: 'error'
                    })
                }
                hideForm()
            });
    }
    const applySharing = (elements, meta) => {
        let DE_Sharing = deSharing(payload.object);
        elements?.forEach((element) => {
            if (!exclusionDataElements.includes(element.id)) {
                if (meta === "dataElements" && overwrite) //Overwrite all the permission for dataElements if checked
                {
                    element.sharing.public = DE_Sharing.public;
                    element.sharing.users = DE_Sharing.users;
                    element.sharing.userGroups = DE_Sharing.userGroups;
                } else {
                    element.sharing.public = (meta==='dataElements' || meta==='programIndicators')?dePermission(payload.object.publicAccess):payload.object.publicAccess;
                    payload.object.userAccesses.forEach((user) => {

                        if (element.sharing.users.hasOwnProperty(user.id) && overwrite) {
                            element.sharing.users[user.id].access = (meta==='dataElements' || meta==='programIndicators')?dePermission(user.access):user.access; //update permission if user exist
                        } else {
                            element.sharing.users[user.id] = {id: user.id, access: (meta==='dataElements' || meta==='programIndicators')?dePermission(user.access):user.access} //Add user with permission if doesn't exist
                        }
                    })
                    payload.object.userGroupAccesses.forEach((userGroup) => {
                        if (element.sharing.userGroups.hasOwnProperty(userGroup.id) && overwrite) {
                            element.sharing.userGroups[userGroup.id].access = (meta==='dataElements' || meta==='programIndicators')?dePermission(userGroup.access):userGroup.access;
                        } else {
                            element.sharing.userGroups[userGroup.id] = {id: userGroup.id, access: (meta==='dataElements' || meta==='programIndicators')?dePermission(userGroup.access):userGroup.access}
                        }
                    })
                }
                if (meta !== "dataElements" || overwrite) //Overwrite all the permission for dataElements if checked
                {
                    deleted.forEach(del => {
                        if (element.sharing[del.type].hasOwnProperty(del.id)) {
                            delete element.sharing[del.type][del.id];
                        }
                    });
                }
            }
        });
    }

    const deSharing = (obj) => {
        const temp = {public:"", users: {}, userGroups: {}};
        temp.public = dePermission(obj.publicAccess);
        obj.userAccesses.forEach((user) => {
           temp.users[user.id] = {id: user.id, access: dePermission(user.access)};
        });
        obj.userGroupAccesses.forEach((userGroup) => {
           temp.userGroups[userGroup.id] = {id: userGroup.id, access: dePermission(userGroup.access)};
        });
        return temp;
    }

    const addHNQISElement4Sharing = (hnqisElements) => {
        if(mapsDQ.data.results?.maps) {
            addElement("map", mapsDQ.data.results.maps, hnqisElements);
        }
        if(dashboardsDQ.data?.results.dashboards) {
            addElement("dashboard", dashboardsDQ.data?.results.dashboards, hnqisElements);
        }
        if(vData.result?.visualizations) {
            addElement("visualization", vData.result?.visualizations, hnqisElements);
        }
        if(eventReportDQ.data.results?.eventReports) {
            addElement("eventReport", eventReportDQ.data.results?.eventReports, hnqisElements);
        }
    }

    const addElement = (element, items) => {
        let elements = items.map(item=> ({element: element, id: item.id}));
        hnqisElements = hnqisElements.concat(elements);
    }

    const dePermission = (permission) => {
        return permission.substring(0,2)+'------';
    }

    return (
        <>
            {runAdditionalSharing && additionalElements.length > 0 && additionalElements.map(function(v) {
                return <ObjectSharing key={v.id} id={v.id} element={v.element} sharing={payload}/>
            })}
            <Modal onClose={hideForm}>
                <ModalTitle>Sharing settings</ModalTitle>
                <ModalContent>
                    {content === 'loading' && <Box sx={{ display: 'inline-flex' }}><CircularProgress /></Box>}
                    {content === 'form' && <div>
                        <h2 style={{ fontSize: 24, fontWeight: 300, margin: 0 }}>{truncateString(data.results?.object.displayName,40)}</h2>
                        <div>Created by: {data.results?.object.user.name}</div>
                        {restrictions.length > 0 && <Alert severity="error" style={{ marginTop: "10px", maxHeight: "100px", overflow: 'auto'}}>Limited Access:
                            <ul>
                                {restrictions.map((restriction, index) => {
                                    return <li key={index}>{restriction}</li>
                                })}
                            </ul>
                            {restrictedDEs.length > 0 &&
                            <ul style={{ marginLeft: "25px"}}>
                                {restrictedDEs.map((de, index) => {
                                    return <li key={index}>{de.name}</li>
                                })}
                            </ul> }
                        </Alert>}
                        <div style={{ boxSizing: "border-box", fontSize: 14, paddingLeft: 16, marginTop: 30, color: 'rgba(0, 0, 0, 0.54)', lineHeight: "48px" }}>Who has access</div>
                        <hr style={{ marginTop: -1, height: 1, border: "none", backgroundColor: "#bdbdbd" }} />
                        <div style={{ height: "240px", overflowY: "scroll" }}>
                            <SharingItem key={"publicAccess"} type={"publicAccess"} element={{ id: "publicAccess", displayName: "Public Access" }} permission={data.results?.object.publicAccess} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission} />
                            {/*<SharingItem key={"externalAccess"} type={"externalAccess"} element={{id: "externalAccess", displayName: "External Access"}} permission={data.results?.object.externalAccess} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission}/>*/}
                            {
                                data.results?.object.userAccesses.map(function (userAccess) {
                                    return <SharingItem key={userAccess.id} type={"userAccesses"} element={{ id: userAccess.id, displayName: userAccess.displayName }} permission={userAccess.access} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission} />
                                })
                            }
                            {
                                data.results?.object.userGroupAccesses.map(function (userGroupAccess) {
                                    return <SharingItem key={userGroupAccess.id} type={"userGroupAccesses"} element={{ id: userGroupAccess.id, displayName: userGroupAccess.displayName }} permission={userGroupAccess.access} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission} />
                                })
                            }
                        </div>
                        <div style={{ fontWeight: 400, padding: "16px", backgroundColor: 'rgb(245,245,245)', display: "flex", flexDirection: 'column', justifyContent: "center" }}>
                            <div style={{ color: 'rgb(129, 129, 129)', paddingBottom: "8px" }}>Add users and user groups</div>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', flex: "1 1 0"}}>

                                <div style={{ display: "inline-block", position: "relative", width: "100%", backgroundColor: "white", boxShadow: 'rgb(204,204,204) 2px 2px 2px', padding: "0 16px", marginRight: "16px", height: '3em' }}>
                                    <input type={"text"} autoComplete={"off"} id={"userNGroup"} onChange={handleSuggestions} value={usrGrp || ""} style={{ appearance: "textfield", padding: "0px", position: "relative", border: "none", outline: "none", backgroundColor: 'rgba(0,0,0,0)', color: 'rgba(0,0,0,0.87)', cursor: "inherit", opacity: 1, height: "100%", width: "100%" }} placeholder={"Enter Names"} disabled={userAccessRestricted} />
                                </div>

                                {search && 
                                    <Suggestions
                                        usersNGroups={DeepCopy(usersNGroups)}
                                        keyword={search}
                                        setSearch={setSearch}
                                        addEntity={addEntity}
                                        posRef={document.getElementById("userNGroup")}
                                    />
                                }
                                
                                <div id={'newPermission'} style={{ padding: "auto" }} onClick={() => { toggle(); }}>
                                    {userPermissionState()}
                                </div>
                                {optionOpen && <SharingOptions permission={usrPermission.split("")} reference={document.getElementById('newPermission')} setEntityPermission={setEntityPermission} toggle={toggle} />}

                                <Button onClick={() => assignRole()} variant="outlined" disabled={userAccessRestricted}>Assign</Button>
                            </div>
                        </div>
                        {(selectedIndex === 2) &&
                        <div style={{display: 'flex', alignItems: 'center', margin: "1em 0 0 1em"}}>
                            <FormGroup>
                                <FormControlLabel control={<Checkbox checked={overwrite} onChange={handleCheckbox} inputProps={{ 'aria-label': 'controlled' }} />} label={"Overwrite Existing Settings in Data Elements"} />
                            </FormGroup>
                            <Tooltip title="Replaces the current Sharing Settings of the Data Elements contained in the Program" placement="top-start">
                                <HelpIcon color="disabled" style={{cursor: 'pointer'}}/>
                            </Tooltip>
                        </div>
                        }
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
                </ModalContent>
                {content === 'form' &&
                    <ModalActions>
                        <ButtonStrip end>
                            {/*<Button onClick={()=>hideForm()} variant="outlined" startIcon={<CloseIcon />}>Close</Button>*/}
                            <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                                <Button onClick={handleClick} disabled={readOnly}>{btnOptions[selectedIndex]}</Button>
                                <Button
                                    size="small"
                                    aria-controls={open ? 'split-button-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-label="select merge strategy"
                                    aria-haspopup="menu"
                                    onClick={handleToggle}
                                    disabled={readOnly}
                                >
                                    <ArrowDropDownIcon />
                                </Button>
                            </ButtonGroup>
                            <Popper
                                open={open}
                                anchorEl={anchorRef.current}
                                role={undefined}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom' ? 'center top' : 'center bottom',
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList id="split-button-menu" autoFocusItem>
                                                    {btnOptions.map((option, index) => (
                                                        <MenuItem
                                                            key={option}
                                                            selected={index === selectedIndex}
                                                            onClick={(event) => handleMenuItemClick(event, index)}
                                                            disabled={index === 2 && restrictedDEs.length > 0}
                                                        >
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </ButtonStrip>
                    </ModalActions>
                }
            </Modal>
        </>
    )
}

export default SharingScreen;