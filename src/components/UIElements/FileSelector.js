import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';

const FileSelector = ({ fileName, setFile, acceptedFiles }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button variant="contained" component="label" style={{ width: '30%', maxWidth: '30%', minWidth: '30%' }}>
                Select File
                <input
                    type="file"
                    accept={ acceptedFiles }
                    hidden
                    onChange={(e) => setFile(e.target.files)}
                />
            </Button>
            <span
                style={{
                    width: '65%',
                    maxWidth: '65%',
                    minWidth: '65%',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}>{fileName}</span>
        </div>
    )
}

FileSelector.propTypes = {
    acceptedFiles: PropTypes.string,
    fileName: PropTypes.string,
    setFile: PropTypes.func
}

export default FileSelector
