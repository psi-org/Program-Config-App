import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

const Suggestions = ({ usersNGroups, keyword, setSearch, addEntity, posRef }) => {

    const [results,setResults] = useState([])

    useEffect(()=>{
        const keyVal = keyword.trim().toLowerCase();

        const nUsers = usersNGroups?.userData.users?.filter((user) => { 
            return String(user.displayName?.toLowerCase()||'').includes(keyVal) || String(user.userCredentials.username?.toLowerCase()||'').includes(keyVal)
        })?.map(user => (
            <MenuItem label={user.displayName} key={user.id} onClick={() => {selectUserOrGroup("userAccesses", user)}}/>
        ))||[];

        const nUserGroups = usersNGroups?.userGroupData.userGroups?.filter((userGroup) => { 
            return String(userGroup.displayName?.toLowerCase()||'').includes(keyVal)
        })?.map(userGroup => (
            <MenuItem label={userGroup.displayName} key={userGroup.id} onClick={()=>{selectUserOrGroup("userGroupAccesses", userGroup)}}/>
        ))||[];

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

Suggestions.propTypes = {
    addEntity: PropTypes.func,
    keyword: PropTypes.string,
    posRef: PropTypes.object,
    setSearch: PropTypes.func,
    usersNGroups: PropTypes.object,
}

export default Suggestions;