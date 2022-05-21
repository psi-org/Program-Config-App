import {FlyoutMenu, MenuItem, Popper, Layer, MenuSectionHeader} from "@dhis2/ui";

import DoneIcon from '@mui/icons-material/Done';

const SharingOptions = ({ permission, reference, setEntityPermission, toggle }) => {

    const updatePermission = (segment, permsn) => {
        if (segment === 1)
        {
            permission[0] = permsn[0];
            permission[1] = permsn[1];
        }
        else if(segment === 2)
        {
            permission[2] = permsn[0];
            permission[3] = permsn[1];
        }
        setEntityPermission(permission.join(''));
    }

    return (
        <Layer onClick={toggle}>
            <Popper reference={reference} placement={"bottom-end"}>
                <FlyoutMenu>
                    <MenuSectionHeader label={"METADATA"}/>
                        <MenuItem icon={(permission[1] === "w") ? <DoneIcon/> : <span/>} label={"Can Edit and View"} onClick={() => { updatePermission(1, ['r','w']); toggle(); }}/>
                        <MenuItem icon={(permission[0] === "r" && permission[1] != "w") ? <DoneIcon/> : <span/>} label={"Can view only"} onClick={() => { updatePermission(1, ['r','-']); toggle(); }}/>
                        <MenuItem icon={(permission[0] != "r") ? <DoneIcon/> : <span/>} label={"No access"} onClick={() => { updatePermission(1, ['-','-']); toggle(); }}/>
                    <MenuSectionHeader label={"DATA"}/>
                        <MenuItem icon={(permission[3] === "w") ? <DoneIcon/> : <span/>} label="Can Capture and View" onClick={() => { updatePermission(2, ['r','w']); toggle(); }}/>
                        <MenuItem icon={(permission[2] === "r" && permission[3] != "w") ? <DoneIcon/> : <span/>} label="Can view only" onClick={() => { updatePermission(2, ['r','-']); toggle(); }}/>
                        <MenuItem icon={(permission[2] != "r") ? <DoneIcon/> : <span/>} label="No access" onClick={() => { updatePermission(2, ['-','-']); toggle(); }}/>
                </FlyoutMenu>
            </Popper>
        </Layer>
    )
}

export default SharingOptions