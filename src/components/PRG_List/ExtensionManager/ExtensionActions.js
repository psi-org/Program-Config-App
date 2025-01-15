import DescriptionIcon from '@mui/icons-material/Description';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button } from "@mui/material";
import PropTypes from 'prop-types';
import React from 'react';

const ExtensionActions = ({ runInstall, loading, extensionVersion, currentExtensionVersion, docsUrl }) => {
    return (<div
        style={{
            display: 'flex',
            justifyContent: docsUrl?'space-between':'flex-end',
            alignItems: 'center',
            marginTop: '1em'
        }}
    >
        {docsUrl &&
            <Button
                variant='text'
                target='_blank'
                href={docsUrl}
                startIcon={<DescriptionIcon />}
            >
                Extension documentation
            </Button>
        }
        <LoadingButton
            onClick={runInstall}
            startIcon={<InstallDesktopIcon />}
            loading={loading}
            loadingPosition="start"
            variant="contained"
        >
            {!loading &&
                `${currentExtensionVersion === extensionVersion
                    ? 'Repair'
                    : 'Install'} Metadata (v${extensionVersion})`}
            {loading && `Installing...`}
        </LoadingButton>
    </div>);
}

ExtensionActions.propTypes = {
    currentExtensionVersion: PropTypes.string.isRequired,
    extensionVersion: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    runInstall: PropTypes.func.isRequired,
    docsUrl: PropTypes.string
};

export default ExtensionActions;