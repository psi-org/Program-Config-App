import { useDataQuery } from "@dhis2/app-runtime";
import {useEffect, useState} from "react";
import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";

const Suggestions = ({ usersNGroups, keyword, setSearch, setEntity }) => {
    const regex = new RegExp(keyword.trim().toLowerCase());
    var users = usersNGroups.userData.users?.filter(function(user) { return String(user.displayName.toLowerCase()).match(regex)});
    var userGroups = usersNGroups.userData.userGroups?.filter(function(userGroup) { return String(userGroup.displayName.toLowerCase()).match(regex)});

    const selectUserOrGroup = (type, entity) => {
        setEntity(type, entity);
        setSearch(undefined);
    }

    return <>
        {
            // !loading &&
                <Layer>
                    <Popper reference={document.getElementById("userNGroup")} placement={"bottom-start"} style={{ width: "100%"}}>
                        <FlyoutMenu>
                            { users?.map(user=>(<MenuItem label={user.displayName} key={user.id} onClick={() => {selectUserOrGroup("users", user)}}/>)) }
                            { userGroups?.map(userGroup=>(<MenuItem label={userGroup.displayName} key={userGroup.id} onClick={()=>{selectUserOrGroup("userGroups", userGroup)}}/>)) }
                        </FlyoutMenu>
                    </Popper>
                </Layer>
        }
            </>
}

export default Suggestions;