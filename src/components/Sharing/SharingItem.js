import { useState } from "react";
import SharingOptions from "./SharingOptions";

import ApartmentIcon from '@mui/icons-material/Apartment';
import ExternalIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import ViewIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton'

const SharingItem = ({ type, element, permission, updatePermission, deleteUserPermission }) => {
    const [permissionArray, setPermssionArray] = useState((!permission) ? Array(6).fill("-") : permission.split(""));
    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(undefined);
    const toggle = () => setOpen(!open);

    const currentState = () => {
        return (<IconButton color='inherit'>{(permissionArray[1] === "w") ? <EditIcon /> : (permissionArray[0] === "r" && permissionArray[1] !== "w") ? <ViewIcon /> : <BlockIcon />}</IconButton>)
    }

    const getPermissionInformation = () => {
        return (permissionArray[1] === "w") ? "Can find, view and edit" : (permissionArray[0] === "r" && permissionArray[1] !== "w") ? "Can find and view" : "No access";
    }

    const updateUnGPermission = (segment, permsn) => {
        let pArray = permissionArray;
        if (segment === 1) {
            pArray[0] = permsn[0];
            pArray[1] = permsn[1];
        }
        else if (segment === 2) {
            pArray[2] = permsn[0];
            pArray[3] = permsn[1];
        }
        setPermssionArray(pArray);
        updatePermission(type, element.id, pArray.join(''));
    }

    return (
        <div id={element.id}>
            <hr style={{ marginTop: -1, height: 1, border: "none", backgroundColor: "#bdbdbd" }} />
            <div style={{ fontWeight: 400, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", paddingBottom: "4px", paddingRight: "8px", paddingLeft: "8px" }}>
                {(type === 'publicAccess') ? <ApartmentIcon /> : (type === 'externalAccess') ? <ExternalIcon /> : (type === 'userGroupAccesses') ? <PeopleIcon /> : <PersonIcon />}
                <div style={{ display: "flex", flexDirection: "column", flex: '1 1 0', paddingLeft: "16px" }}>
                    <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 400 }}>{element.displayName}</div>
                    <div style={{ color: 'rgba(129, 129, 129)', paddingTop: "4px" }}>{getPermissionInformation()}</div>
                </div>
                <div id={'menu' + element.id} onClick={() => { setRef(document.getElementById('menu' + element.id)); toggle(); }}>
                    {currentState()}
                </div>
                {open && <SharingOptions permission={permissionArray} reference={ref} setEntityPermission={updateUnGPermission} toggle={toggle} />}
                <div onClick={() => deleteUserPermission(type, element.id)}>
                    <IconButton color='inherit'><DeleteIcon /></IconButton>
                </div>
            </div>
        </div>
    )
}

export default SharingItem;