import {useState, useEffect} from 'react';
import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";

const Suggestions = ({ usersNGroups, keyword, setSearch, addEntity, posRef }) => {

    let [results,setResults] = useState([])

    useEffect(()=>{
        let keyVal = keyword.trim().toLowerCase();

        let nUsers = usersNGroups.userData.users?.filter((user) => { 
            return String(user.displayName.toLowerCase()).includes(keyVal) || String(user.userCredentials.username.toLowerCase()).includes(keyVal)
        })?.map(user => (
            <MenuItem label={user.displayName} key={user.id} onClick={() => {selectUserOrGroup("userAccesses", user)}}/>
        ));

        let nUserGroups = usersNGroups.userGroupData.userGroups?.filter((userGroup) => { 
            return String(userGroup.displayName.toLowerCase()).includes(keyVal)
        })?.map(userGroup => (
            <MenuItem label={userGroup.displayName} key={userGroup.id} onClick={()=>{selectUserOrGroup("userGroupAccesses", userGroup)}}/>
        ));

        setResults([...nUsers].concat([...nUserGroups]));

    },[keyword])

    const selectUserOrGroup = (type, entity) => {
        addEntity(type, entity);
        setSearch(undefined);
    }

    return <>
        {
            (results?.length > 0) &&
                <Layer onClick={()=>setSearch(undefined)}>
                    <Popper reference={posRef} placement={"bottom-start"} style={{ width: 300 }}>
                        <FlyoutMenu width={"350px"}>
                            { results }
                        </FlyoutMenu>
                    </Popper>
                </Layer>
        }
            </>
}

export default Suggestions;