import {useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import { Button, Chip, CircularLoader, NoticeBox, Pagination, IconAddCircle24, Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Input, InputField, SwitchField } from "@dhis2/ui";

import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import SharingItem from './SharingItem';

import EditIcon from '@mui/icons-material/Edit';
import {useState} from "react";

const programQuery = {
    results: {
        resource: 'programs',
        params: ({ componentId }) => ({
            paging: false,
            filter: ["id:eq:"+componentId],
            fields: ['id', 'name', 'displayName', 'createdBy[displayName]', 'externalAccess', 'publicAccess','sharing']
        }),
    }
}

const userQuery = {
    results: {
        resource: "users",
        params: ({name}) => ({
            paging: false,
            filter: ["displayName:ilike:"+name],
            fields: ['id','displayName']
        })
    }
}

const userGroupQuery = {
    results: {
        resource: "userGroups",
        params: ({name}) => ({
            paging: false,
            filter: ["displayName:ilike:"+name],
            fields: ['id','displayName']
        })
    }
}

const SharingScreen = ({ component, componentId, setSharingProgramId }) => {
    const [suggestions, setSuggestions] = useState(undefined);
    const {loading, error, data, refetch} = useDataQuery(programQuery, { variables: { componentId } });
    if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
    if (loading) return <CircularLoader />


    const hideForm = () => {
        setSharingProgramId(undefined)
    }

    const loadSuggestions = (event) => {
        let suggestions = [];
        let name = event.target.value;
        const users = useDataQuery(userQuery, { variables: {name: name}});
        const userGroups = useDataQuery(userGroupQuery, { variables: {name: name}});
        suggestions.push(users);
        suggestions.push(userGroups);
        if(suggestions.length > 0)
        {
            console.log("Suggestions: ", suggestions);
            setSuggestions(suggestions);
        }
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                    Sharing settings
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>
                    <h2 style={{fontSize: 24, fontWeight: 300, margin: 0}}>{data.results?.programs[0].displayName}</h2>
                    <div>Created by: {data.results?.programs[0].createdBy.displayName}</div>
                    <div style={{boxSizing: "border-box", fontSize: 14, paddingLeft: 16, marginTop: 30, color: 'rgba(0, 0, 0, 0.54)', lineHeight: "48px"}}>Who has access</div>
                    <hr style={{ marginTop: -1, height: 1, border:"none", backgroundColor: "#bdbdbd"}}/>
                    <div style={{ height: "240px", overflowY: "scroll"}}>
                        <SharingItem type={"public"} element={"publicAccess"} permission={data.results?.programs[0].publicAccess} updatePermission={null} deleteUserPermission={null}/>
                        <SharingItem type={"external"} element={"externalAccess"} permission={data.results?.programs[0].externalAccess} updatePermission={null} deleteUserPermission={null}/>
                        {
                            Object.keys(data.results?.programs[0].sharing.users).map(function(id) {
                                return <SharingItem type={"user"} element={id} permission={data.results?.programs[0].sharing.users[id].access} updatePermission={null} deleteUserPermission={null}/>
                            })
                        }
                        {
                            Object.keys(data.results?.programs[0].sharing.userGroups).map(function(id) {
                                return <SharingItem type={"group"} element={id} permission={data.results?.programs[0].sharing.userGroups[id].access} updatePermission={null} deleteUserPermission={null}/>
                            })
                        }
                    </div>
                    <div style={{ fontWeight: 400, padding: "16px", backgroundColor: 'rgb(245,245,245)', display: "flex", flexDirection: 'column', justifyContent: "center" }}>
                        <div style={{ color: 'rgb(129, 129, 129)', paddingBottom: "8px"}}>Add users and user groups</div>
                        <div style={{ display: "flex", flexDirection: "row", flex: "1 1 0"}}>
                            <div style={{ display: "inline-block", position: "relative", width: "100%", backgroundColor: "white", boxShadow: 'rgb(204,204,204) 2px 2px 2px', padding: "0px 16px", marginRight: "16px"}}>
                                <input type={"text"} autoComplete={"off"} id={"userNGroup"} onChange={loadSuggestions} style={{ appearance: "textfield", padding: "0px", position: "relative", border: "none", outline: "none", backgroundColor: 'rgba(0,0,0,0)', color: 'rgba(0,0,0,0.87)', cursor: "inherit", opacity: 1, height: "100%", width: "100%"}} placeholder={"Enter Names"}/>
                            </div>
                            <div>
                                <EditIcon/>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </CustomMUIDialog>
        </>
    )
}

export default SharingScreen;