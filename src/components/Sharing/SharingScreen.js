import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, Modal, ModalContent, ModalTitle, NoticeBox, ModalActions, ButtonStrip, CenteredContent } from "@dhis2/ui";
import SharingItem from './SharingItem';
import { DeepCopy } from '../../configs/Utils';

import EditIcon from '@mui/icons-material/Edit';
import { useRef, useState } from "react";
import Suggestions from "./Suggestions";
import SharingOptions from "./SharingOptions";
import ViewIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from "@mui/material/IconButton";

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
    FormGroup, FormControlLabel, Checkbox
} from "@mui/material";

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
            fields: ['id', 'name', 'displayName']
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

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const btnOptions = ['Apply Only to Program', 'Apply to Program & Program Stages', 'Apply to Program, Program Stages & Data Elements'];

const SharingScreen = ({ element, id, setSharingProgramId }) => {

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
    const [selectedIndex, setSelectedIndex] = useState(2);
    const [content, setContent] = useState('form');
    const [overwrite, setOverwrite] = useState(true);
    const [deleted, setDeleted] = useState([]);

    const { loading, error, data, refetch } = useDataQuery(sharingQuery, { variables: { element: element, id: id } });
    const { loading: entityLoading, data: entities } = useDataQuery(entitiesQuery);
    const { loading: metadataLoading, data: prgMetaData } = useDataQuery(programMetadata);
    const metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }
    // const updateSharingSettings = useDataMutation(updateSharingMutation)[0];



    let payload, usersNGroups, metadata;
    const toggle = () => setOptionOpen(!optionOpen);

    if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
    if (loading) return <CircularLoader />
    if (!loading) {
        payload = data.results;
        if (!entityLoading) {
            usersNGroups = availableUserGroups();
        }
    }

    if (!metadataLoading && prgMetaData) {
        metadata = prgMetaData.results;
    }

    const hideForm = () => {
        setSharingProgramId(undefined)
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

    const handleClick = () => {
        apply(selectedIndex);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
        apply(index);
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
        obj.userAccesses.forEach((ua) => {
            e.userData.users.splice(e.userData.users.findIndex(u => { return u.id === ua.id }), 1);
        });
        obj.userGroupAccesses.forEach((uga) => {
            e.userGroupData.userGroups.splice(e.userGroupData.userGroups.findIndex(ug => { return ug.id === uga.id }), 1);
        })
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
        let payloadMetadata = {};
        payloadMetadata.programs = metadata.programs;
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
           applySharing(payloadMetadata[meta]);
        });

        console.log(payloadMetadata);
        metadataRequest.mutate({ data: payloadMetadata })
            .then(response => {
                if (response.status !== 'OK') {
                    setContent('status');
                    
                } else {
                    setContent('status');
                    let stats = response?.stats;
                    setImportStatus(stats);
                }
            });
    }

    const applySharing = (elements) => {
        elements.forEach((element) => {
            element.sharing.public = payload.object.publicAccess;
            payload.object.userAccesses.forEach((user) => {
                if (element.sharing.users.hasOwnProperty(user.id) && overwrite) {
                    element.sharing.users[user.id].access = user.access;
                }
                else {
                    element.sharing.users[user.id] = { id: user.id, access: user.access }
                }
            })
            payload.object.userGroupAccesses.forEach((userGroup) => {
                if (element.sharing.userGroups.hasOwnProperty(userGroup.id) && overwrite) {
                    element.sharing.userGroups[userGroup.id].access = userGroup.access;
                }
                else {
                    element.sharing.userGroups[userGroup.id] = { id: userGroup.id, access: userGroup.access }
                }
            })
            deleted.forEach(del => {
                if (element.sharing[del.type].hasOwnProperty(del.id)) {
                    delete element.sharing[del.type][del.id];
                }
            });
        });
    }

    return (
        <>
            <Modal onClose={hideForm} style={{ maxWidth: "800px", minWidth: "600px" }}>
                <ModalTitle>Sharing settings</ModalTitle>
                <ModalContent>
                    {content === 'loading' && <Box sx={{ display: 'inline-flex' }}><CircularProgress /></Box>}
                    {content === 'form' && <div>
                        <h2 style={{ fontSize: 24, fontWeight: 300, margin: 0 }}>{data.results?.object.displayName}</h2>
                        <div>Created by: {data.results?.object.user.name}</div>
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
                                    <input type={"text"} autoComplete={"off"} id={"userNGroup"} onChange={(e) => loadSuggestions(e.target.value)} value={usrGrp || ""} style={{ appearance: "textfield", padding: "0px", position: "relative", border: "none", outline: "none", backgroundColor: 'rgba(0,0,0,0)', color: 'rgba(0,0,0,0.87)', cursor: "inherit", opacity: 1, height: "100%", width: "100%" }} placeholder={"Enter Names"} />
                                </div>
                                {search && <Suggestions usersNGroups={JSON.parse(JSON.stringify(usersNGroups))} keyword={search} setSearch={setSearch} addEntity={addEntity} />}
                                <div id={'newPermission'} style={{ padding: "auto" }} onClick={() => { toggle(); }}>
                                    {userPermissionState()}
                                </div>
                                {optionOpen && <SharingOptions permission={usrPermission.split("")} reference={document.getElementById('newPermission')} setEntityPermission={setEntityPermission} toggle={toggle} />}

                                <Button onClick={() => assignRole()} variant="outlined">Assign</Button>

                            </div>
                        </div>
                        {(selectedIndex === 1 || selectedIndex === 2) &&
                            <FormGroup style={{ marginTop: "5px" }}>
                                <FormControlLabel control={<Checkbox checked={overwrite} onChange={handleCheckbox} inputProps={{ 'aria-label': 'controlled' }} />} label={"Overwrite Existing Behavior"} />
                            </FormGroup>
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
                                <Button onClick={handleClick}>{btnOptions[selectedIndex]}</Button>
                                <Button
                                    size="small"
                                    aria-controls={open ? 'split-button-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-label="select merge strategy"
                                    aria-haspopup="menu"
                                    onClick={handleToggle}
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