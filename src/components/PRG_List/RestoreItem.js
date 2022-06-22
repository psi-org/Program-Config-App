import * as React from 'react';
import { ListItem, ListItemText, Typography, Divider, IconButton  } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

const RestoreItem = (props) => {
    return (
        <>
            <ListItem key={props.backup.id} secondaryAction={
                <IconButton edge={"end"} aria-label={"restore"} onClick={() => { props.restoreHandler(props.backup) }}>
                    <RestoreIcon />
                </IconButton>
            }>
                <ListItemText primary={props.backup.name+' (_Version: '+props.backup.version+')'}  secondary={
                    <React.Fragment>
                        <Typography sx={{display: 'inline'}} component={"span"} variant={"body2"} color="text.primary">{props.backup.backup_date}</Typography>
                        <br/>{props.backup.comment.substring(0, 100)}
                    </React.Fragment>
                }/>
            </ListItem>
            <Divider/>
        </>
    )
}

export default RestoreItem