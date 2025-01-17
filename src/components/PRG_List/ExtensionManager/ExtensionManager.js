import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React from "react"
import CustomMUIDialog from '../../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from '../../UIElements/CustomMUIDialogTitle.js'
import ExtensionSelector from "./ExtensionSelector.js";
import H2MetadataHandler from "./H2MetadataHandler.js";
import HMWIMetadataHandler from './HMWIMetadataHandler.js';

const ExtensionManager = (props) => {
    const h2Ready = localStorage.getItem('h2Ready') === 'true';
    const hMWIReady = localStorage.getItem('hMWIReady') === 'true';

    const [currentContent, setCurrentContent] = React.useState('main');

    const getPageContent = () => {
        switch (currentContent) {
            case 'h2Ready':
                return (<H2MetadataHandler />);
            case 'hMWIReady':
                return (<HMWIMetadataHandler />);
            default:
                return (<ExtensionSelector
                    onSelect={setCurrentContent}
                    status={{ h2Ready, hMWIReady }}
                />);
        }
    }

    return (
        <CustomMUIDialog
            open={props.packageModal}
            maxWidth='md'
            fullWidth={true}
            onClose={() => props.setPackageModal(false)}
        >
            <CustomMUIDialogTitle
                id="customized-dialog-title"
                onClose={() => props.setPackageModal(false)}
            >
                <strong>PCA Extension Manager</strong>
            </CustomMUIDialogTitle >
            <DialogContent
                dividers
                style={{
                    padding: '1em 2em',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1em'
                }}
            >
                {getPageContent()}
            </DialogContent>
            <DialogActions
                style={{
                    display: 'flex',
                    justifyContent: currentContent !== 'main'?'space-between':'flex-end',
                    alignItems: 'center',
                    padding: '0.5em'
                }}
            >
                {currentContent !== 'main' &&
                    <Button
                        onClick={() => setCurrentContent('main')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Return
                    </Button>
                }
                <Button
                    color={'error'}
                    variant={'outlined'}
                    onClick={() => props.setPackageModal(false)}
                >
                    Close
                </Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

ExtensionManager.propTypes = {
    packageModal: PropTypes.bool,
    setPackageModal: PropTypes.func
}

export default ExtensionManager