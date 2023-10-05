import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import React, { useState } from "react";

const InfoBox = (props) => {

    const [showModal, setShowModal] = useState(false)

    return <div style={{ display: 'flex', margin: (props.margin || '0 1.5em 0 0'), alignItems: (props.alignment || 'center') }}>
        <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer', color: '#909090', display: 'flex' }}>
            <HelpIcon />
        </div>
        {showModal &&
            <Dialog
                open={showModal}
                onClose={() => setShowModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InfoIcon style={{ marginRight: '0.25em' }} />{props.title}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className='info-box-content'>
                        {props.message}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button primary onClick={() => setShowModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        }
    </div>
}

InfoBox.propTypes = {
    alignment: PropTypes.string,
    margin: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string
}

export default InfoBox;