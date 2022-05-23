import {useState} from "react";
import SharingOptions from "./SharingOptions";

import ApartmentIcon from '@mui/icons-material/Apartment';
import ExternalIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import ViewIcon from '@mui/icons-material/Visibility';

const SharingItem = ({ type, element, permission, updatePermission, deleteUserPermission }) => {
    let permissionArray = (!permission) ? Array(6).fill("-") : permission.split("");
    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(undefined);
    const toggle = () => setOpen(!open);

    const currentState = () => {
        return (permissionArray[1] === "w") ? <EditIcon/> : (permissionArray[0] === "r" && permissionArray[1] !== "w") ? <ViewIcon/> : <BlockIcon/>
    }

    const getPermissionInformation = () => {
        return (permissionArray[1] === "w") ? "Can find, view and edit" : (permissionArray[0] === "r" && permissionArray[1] !== "w") ? "Can find and view" : "No access";
    }

    const updateUnGPermission = (segment, permsn) => {
        if (segment === 1)
        {
            permissionArray[0] = permsn[0];
            permissionArray[1] = permsn[1];
        }
        else if(segment === 2)
        {
            permissionArray[2] = permsn[0];
            permissionArray[3] = permsn[1];
        }
        updatePermission(type, element.id, permissionArray.join(''));
    }

    return (
        <div id={element.id}>
            <hr style={{ marginTop: -1, height: 1, border:"none", backgroundColor: "#bdbdbd"}}/>
            <div style={{ fontWeight: 400, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", paddingBottom: "4px", paddingRight: "8px", paddingLeft: "8px"}}>
                { (type === 'publicAccess') ? <ApartmentIcon/> : (type === 'externalAccess') ? <ExternalIcon/> : (type === 'userGroupAccesses') ? <PeopleIcon/> : <PersonIcon/> }
                <div style={{ display: "flex", flexDirection: "column", flex: '1 1 0', paddingLeft: "16px"}}>
                    <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 400}}>{ element.displayName }</div>
                    <div style={{ color: 'rgba(129, 129, 129)', paddingTop: "4px" }}>{getPermissionInformation()}</div>
                </div>
                <div id={'menu'+element.id} style={{ paddingLeft: "12px", paddingRight: "6px"}} onClick={()=>{setRef(document.getElementById('menu'+element.id)); toggle(); }}>
                    { currentState() }
                </div>
                {open && <SharingOptions permission={permissionArray} reference={ref} setEntityPermission={updateUnGPermission} toggle={toggle}/> }
                <div style={{ paddingLeft: "6px", paddingRight: "12px"}} onClick={() => deleteUserPermission(type, element.id)}>
                    <DeleteIcon/>
                </div>
            </div>
        </div>
    )
}

export default SharingItem;