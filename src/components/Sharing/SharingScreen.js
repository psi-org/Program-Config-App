import { useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import {CircularLoader, Modal, ModalContent, ModalTitle, NoticeBox, ModalActions, ButtonStrip, Button} from "@dhis2/ui";
import SharingItem from './SharingItem';
import { DeepCopy } from '../../configs/Utils';

import EditIcon from '@mui/icons-material/Edit';
import {useState} from "react";
import Suggestions from "./Suggestions";
import SharingOptions from "./SharingOptions";
import ViewIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";

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

const updateSharingMutation = {
    resource: 'sharing',
    type: 'update',
    params: ({ element, id, data }) => ({
        id,
        type: element,
        data: data
    }),
};

const SharingScreen = ({ element, id, setSharingProgramId }) => {
    const [search, setSearch] = useState(undefined);
    const [usrGrp, setUsrGrp] = useState(undefined);
    const [open, setOpen] = useState(undefined);
    const [usrPermission, setUsrPermission] = useState('r-r-----');
    const [entityType, setEntityType] = useState(undefined);
    const [entity, setEntity] = useState({});

    const {loading, error, data, refetch} = useDataQuery(sharingQuery, { variables: { element: element, id: id } });
    const {loading: entityLoading, data: entities} = useDataQuery(entitiesQuery);
    const updateSharingSettings = useDataMutation(updateSharingMutation)[0];

    let payload, usersNGroups;
    const toggle = () => setOpen(!open);

    if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
    if (loading) return <CircularLoader />
    if ( !loading )
    {
        payload = data.results;
        if (!entityLoading)
        {
            usersNGroups = availableUserGroups();
        }
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

        let e = {...ent};
        e.access = usrPermission;
        setEntity(e);
    }

    const setEntityPermission = (permission) => {
        let e = {...entity};
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
        return (usrPermission[1] === "w") ? <EditIcon/> : (usrPermission[0] === "r" && usrPermission[1] !== "w") ? <ViewIcon/> : <BlockIcon/>
    }

    function availableUserGroups() {
        let obj = payload.object;
        let e = DeepCopy(entities);
        obj.userAccesses.forEach((ua)=> {
            e.userData.users.splice(e.userData.users.findIndex(u => { return u.id === ua.id}), 1);
        });
        obj.userGroupAccesses.forEach((uga) => {
            e.userGroupData.userGroups.splice(e.userGroupData.userGroups.findIndex(ug=> { return ug.id === uga.id}), 1);
        })
        return e;
    }

    const deleteUserPermission = (type, id) => {
        switch (type) {
            case 'publicAccess':
                payload.meta.allowPublicAccess = false;
                payload.object.publicAccess = "--------";
                break;
            case 'userAccesses':
                var userIndex = payload.object.userAccesses.findIndex(user => { return user.id === id});
                payload.object.userAccesses.splice(userIndex, 1);
                break;
            case 'userGroupAccesses':
                var userGroupIndex = payload.object.userGroupAccesses.findIndex(userGroup => { return userGroup.id === id});
                payload.object.userGroupAccesses.splice(userGroupIndex, 1);
                break;
            default:
                break;
        }
        console.log("Payload: ", payload);
        // data.refetch();
        // run(payload);
    }

    const updateUserPermission = (type, id, permission) => {
        switch (type) {
            case 'publicAccess':
                payload.meta.allowPublicAccess = (permission !== "--------");
                payload.object.publicAccess = permission;
                break;
            case 'userAccesses':
                var userIndex = payload.object.userAccesses.findIndex(user => { return user.id === id});
                payload.object.userAccesses[userIndex].access = permission;
                break;
            case 'userGroupAccesses':
                var userGroupIndex = payload.object.userGroupAccesses.findIndex(userGroup => { return userGroup.id === id});
                payload.object.userGroupAccesses[userGroupIndex].access = permission;
                break;
            default:
                break;
        }
        // data.refetch();
        // run(payload);
    }

    const apply = () => {
        updateSharingSettings({id: id, element: element, data: payload}).then((res) => {
           if (res.status === 'OK')
           {
               data.refetch();
           }
        });
    }

    return (
        <>
            <Modal>
                <ModalTitle>Sharing settings</ModalTitle>
                <ModalContent>
                    <h2 style={{fontSize: 24, fontWeight: 300, margin: 0}}>{data.results?.object.displayName}</h2>
                    <div>Created by: {data.results?.object.user.name}</div>
                    <div style={{boxSizing: "border-box", fontSize: 14, paddingLeft: 16, marginTop: 30, color: 'rgba(0, 0, 0, 0.54)', lineHeight: "48px"}}>Who has access</div>
                    <hr style={{ marginTop: -1, height: 1, border:"none", backgroundColor: "#bdbdbd"}}/>
                    <div style={{ height: "240px", overflowY: "scroll"}}>
                        <SharingItem key={"publicAccess"} type={"publicAccess"} element={{id: "publicAccess", displayName: "Public Access"}} permission={data.results?.object.publicAccess} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission}/>
                        {/*<SharingItem key={"externalAccess"} type={"externalAccess"} element={{id: "externalAccess", displayName: "External Access"}} permission={data.results?.object.externalAccess} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission}/>*/}
                        {
                            data.results?.object.userAccesses.map(function(userAccess) {
                                return <SharingItem key={userAccess.id} type={"userAccesses"} element={{id: userAccess.id, displayName: userAccess.displayName}} permission={userAccess.access} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission}/>
                            })
                        }
                        {
                            data.results?.object.userGroupAccesses.map(function(userGroupAccess) {
                                return <SharingItem key={userGroupAccess.id} type={"userGroupAccesses"} element={{id: userGroupAccess.id, displayName: userGroupAccess.displayName }} permission={userGroupAccess.access} updatePermission={updateUserPermission} deleteUserPermission={deleteUserPermission}/>
                            })
                        }
                    </div>
                    <div style={{ fontWeight: 400, padding: "16px", backgroundColor: 'rgb(245,245,245)', display: "flex", flexDirection: 'column', justifyContent: "center" }}>
                        <div style={{ color: 'rgb(129, 129, 129)', paddingBottom: "8px"}}>Add users and user groups</div>
                        <div style={{ display: "flex", flexDirection: "row", flex: "1 1 0"}}>
                            <div style={{ display: "inline-block", position: "relative", width: "100%", backgroundColor: "white", boxShadow: 'rgb(204,204,204) 2px 2px 2px', padding: "0px 16px", marginRight: "16px"}}>
                                <input type={"text"} autoComplete={"off"} id={"userNGroup"} onChange={(e) => loadSuggestions(e.target.value)} value={usrGrp || ""} style={{ appearance: "textfield", padding: "0px", position: "relative", border: "none", outline: "none", backgroundColor: 'rgba(0,0,0,0)', color: 'rgba(0,0,0,0.87)', cursor: "inherit", opacity: 1, height: "100%", width: "100%"}} placeholder={"Enter Names"}/>
                            </div>
                            {search && <Suggestions usersNGroups={JSON.parse(JSON.stringify(usersNGroups))} keyword={search} setSearch={setSearch} addEntity={addEntity}/>}
                            <div id={'newPermission'} style={{ paddingLeft: "6px", paddingRight: "6px", paddingTop: "6px"}} onClick={()=>{toggle(); }}>
                                { userPermissionState() }
                            </div>
                            { open && <SharingOptions permission={usrPermission.split("")} reference={document.getElementById('newPermission')} setEntityPermission={setEntityPermission} toggle={toggle}/> }
                            <div>
                                <Button onClick={() => assignRole()}>Assign</Button>
                            </div>
                        </div>
                    </div>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip end>
                        <Button onClick={()=>hideForm()} destructive>
                            Close
                        </Button>
                        <Button onClick={()=>apply()} primary>
                            Apply
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </>
    )
}

export default SharingScreen;