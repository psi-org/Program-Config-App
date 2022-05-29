import { useDataQuery } from "@dhis2/app-runtime";

import {FlyoutMenu, MenuItem, MenuSectionHeader, Popper, Layer} from "@dhis2/ui";

import ApartmentIcon from '@mui/icons-material/Apartment';
import ExternalIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import ViewIcon from '@mui/icons-material/Visibility';
import {useState} from "react";

const userQuery = {
    results: {
        resource: 'users',
        params: ({id}) => ({
            filter: "id:eq:"+id,
            fields: ['displayName']
        }),
    }
}

const ugQuery = {
    results: {
        resource: 'userGroups',
        params: ({id}) => ({
            filter: "id:eq:"+id,
            fields: ['displayName']
        }),
    }
}

const SharingItem = ({ type, element, permission, updatePermission, deleteUserPermission }) => {

    let query = (type === "group") ? ugQuery : (type === "user") ? userQuery : null;
    const {loading, data} = useDataQuery(query, { variables: { id: element } });

    const [reference, setReference] = useState(undefined);
    const [open, setOpen] = useState(undefined);
    const toggle = () => setOpen(!open);

    const currentState = (permissionString) => {
        let state = <BlockIcon/>
        if (permissionString)
        {
            const permissionArray = permissionString.split("");
            if (permissionArray[0] === "r")
                state = <ViewIcon/>
            if (permissionArray[1] === "w")
                state = <EditIcon/>
        }
        return state;
    }

    const getPermissionInformation = (permissionString) => {
        let permission = "No access";
        if (permissionString)
        {
            const permissionArray = permissionString.split("");
            if (permissionArray[0] === "r")
            {
                permission = "Can find and view";
            }
            if (permissionArray[1] === "w")
            {
                permission = "Can find, view and edit"
            }
        }
        return permission;
    }

    return (
        <div id={"list_"+element}>
            <hr style={{ marginTop: -1, height: 1, border:"none", backgroundColor: "#bdbdbd"}}/>
            <div style={{ fontWeight: 400, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", paddingBottom: "4px", paddingRight: "8px", paddingLeft: "8px"}}>
                { (type === 'public') ? <ApartmentIcon/> : (type === 'external') ? <ExternalIcon/> : (type === 'group') ? <PeopleIcon/> : <PersonIcon/> }
                <div style={{ display: "flex", flexDirection: "column", flex: '1 1 0', paddingLeft: "16px"}}>
                    <div>{ (type === "group") ? !loading && data.results?.userGroups[0].displayName : (type === "user") ? !loading && data.results?.users[0].displayName : (element == "publicAccess") ? "Public Access" : "External Access"}</div>
                    <div style={{ color: 'rgba(129, 129, 129)', paddingTop: "4px" }}>{getPermissionInformation(permission)}</div>
                </div>
                <div id={'menu_'+element} style={{ paddingLeft: "12px", paddingRight: "6px"}} onClick={() => { setReference(document.getElementById('menu_'+element)); toggle(); }}>
                    { currentState(permission) }
                </div>
                {open &&
                    <Layer onClick={toggle}>
                        <Popper reference={reference} placement="bottom-end" style={{ zIndex: "9999900000"}}>
                            <FlyoutMenu>
                                <MenuSectionHeader label={"METADATA"}/>
                                <MenuItem label={"Can Edit and View"}/>
                                <MenuItem label={"Can view only"}/>
                                <MenuItem label={"No access"}/>
                                <MenuSectionHeader label={"DATA"}/>
                                <MenuItem label="Can Capture and View"/>
                                <MenuItem label="Can view only"/>
                                <MenuItem label="No access"/>
                            </FlyoutMenu>
                        </Popper>
                    </Layer>
                }
                <div style={{ paddingLeft: "6px", paddingRight: "12px"}}>
                    <DeleteIcon/>
                </div>
            </div>
        </div>
    )
}

export default SharingItem;