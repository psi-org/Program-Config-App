import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PublishIcon from '@mui/icons-material/Publish';
import { LoadingButton } from '@mui/lab';
import { Button, ButtonGroup } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

const ImportDownloadButton = ({ disabled = false, setImporterEnabled, setExportToExcel, size = 'regular' }) => {


    const configuration_download = (e) => {
        e.preventDefault();
        setExportToExcel(true);
    };

    return (
        <ButtonGroup
            disableElevation>
            <LoadingButton
                onClick={configuration_download}
                startIcon={<FileDownloadIcon />}
                size={size}
                variant="contained"
                color="success"
                disabled={disabled}
                loadingPosition="start"
                loading={disabled}
            >DOWNLOAD</LoadingButton>
            <Button
                style={{ marginLeft: '1px' }}
                onClick={() => setImporterEnabled(true)}
                startIcon={<PublishIcon />}
                size={size}
                variant="contained"
                color="success"
                disabled={disabled}
            >IMPORT</Button>
        </ButtonGroup>
    )
}

ImportDownloadButton.propTypes = {
    disabled: PropTypes.bool,
    setExportToExcel: PropTypes.func,
    setImporterEnabled: PropTypes.func,
    size: PropTypes.string
}

export default ImportDownloadButton
