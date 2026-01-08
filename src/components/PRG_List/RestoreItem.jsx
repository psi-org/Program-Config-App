import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestoreIcon from '@mui/icons-material/Restore';
import { ListItem, ListItemText, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';

const RestoreItem = (props) => {

    const downloadBackupHandler = () => {
        const blob = new Blob([JSON.stringify(props.backup.metadata)], {type: 'text/json'});
        const link = document.createElement('a');
        link.download = (props.backup.name)+'.json';
        link.href = window.URL.createObjectURL(blob);

        const eventClick = new MouseEvent('click', { view: window, bubbles: true, cancelable: true});
        link.dispatchEvent(eventClick);
        link.remove();
    }

    return (
        <>
            <ListItem key={props.backup.id} secondaryAction={
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <Button color='primary' startIcon={<RestoreIcon />} onClick={() => { props.restoreHandler(props.backup) }}>
                            Restore
                        </Button>
                        <Button onClick={downloadBackupHandler} color='inherit' startIcon={<FileDownloadIcon />}>
                            Download
                        </Button>
                    </div>
            }>
                <ListItemText primary={props.backup.name+' (Version: '+props.backup.version+')'}  secondary={
                    <React.Fragment>
                        <Typography sx={{display: 'inline'}} component={"span"} variant={"body2"} color="text.primary">{props.backup.backup_date}</Typography>
                        <br/>{props.backup.comment.substring(0, 100)}
                    </React.Fragment>
                }/>
            </ListItem>
            {/*<Divider/>*/}
        </>
    )
}

RestoreItem.propTypes = {
    backup: PropTypes.object,
    restoreHandler: PropTypes.func
}

export default RestoreItem