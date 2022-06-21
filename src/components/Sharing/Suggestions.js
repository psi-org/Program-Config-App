import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";

const Suggestions = ({ usersNGroups, keyword, setSearch, addEntity }) => {
    const regex = new RegExp(keyword.trim().toLowerCase());
    let users = usersNGroups.userData.users?.filter(function(user) { return String(user.displayName.toLowerCase()).match(regex) || String(user.userCredentials.username.toLowerCase()).match(regex)});
    let userGroups = usersNGroups.userGroupData.userGroups?.filter(function(userGroup) { return String(userGroup.displayName.toLowerCase()).match(regex)});

    const selectUserOrGroup = (type, entity) => {
        addEntity(type, entity);
        setSearch(undefined);
    }

    return <>
        {
            (users?.length >0 || userGroups?.length > 0) &&
                <Layer onClick={()=>setSearch(undefined)}>
                    <Popper reference={document.getElementById("userNGroup")} placement={"bottom-start"} style={{ width: 300 }}>
                        <FlyoutMenu width={"350px"}>
                            { users?.map(user=>(<MenuItem label={user.displayName} key={user.id} onClick={() => {selectUserOrGroup("userAccesses", user)}}/>)) }
                            { userGroups?.map(userGroup=>(<MenuItem label={userGroup.displayName} key={userGroup.id} onClick={()=>{selectUserOrGroup("userGroupAccesses", userGroup)}}/>)) }
                        </FlyoutMenu>
                    </Popper>
                </Layer>
        }
            </>
}

export default Suggestions;