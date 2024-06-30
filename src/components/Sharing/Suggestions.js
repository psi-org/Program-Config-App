import { Popper, List, ListItem, ListItemText, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect, memo } from 'react';

const filterEntities = (entities, keyword, type, selectUserOrGroup) => {
  return entities.filter(entity => {
    const name = entity.displayName?.toLowerCase() || '';
    const username = entity.userCredentials?.username?.toLowerCase() || '';
    return name.includes(keyword) || username.includes(keyword);
  }).map(entity => (
    <ListItem button key={entity.id} onClick={() => selectUserOrGroup(type, entity)}>
      <ListItemText primary={entity.displayName} />
    </ListItem>
  ));
};

const Suggestions = memo(({ usersNGroups, keyword, setSearch, addEntity, inputRef }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const keyVal = keyword.trim().toLowerCase();
    if (!keyVal) {
      setResults([]);
      return;
    }

    const nUsers = filterEntities(usersNGroups?.userData?.users || [], keyVal, "userAccesses", selectUserOrGroup);
    const nUserGroups = filterEntities(usersNGroups?.userGroupData?.userGroups || [], keyVal, "userGroupAccesses", selectUserOrGroup);

    setResults(nUsers.concat(nUserGroups));
  }, [keyword, usersNGroups]);

  const selectUserOrGroup = (type, entity) => {
    addEntity(type, entity);
    setSearch(undefined);
  };

  return (
    <Popper open={results.length > 0} anchorEl={inputRef.current} placement="bottom-start" style={{ zIndex: 1300 }}>
      <Paper>
        <List>
          {results}
        </List>
      </Paper>
    </Popper>
  );
});

Suggestions.propTypes = {
  addEntity: PropTypes.func.isRequired,
  keyword: PropTypes.string,
  setSearch: PropTypes.func.isRequired,
  usersNGroups: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired
};

export default Suggestions;