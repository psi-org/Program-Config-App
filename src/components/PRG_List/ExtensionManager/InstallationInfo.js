import { NoticeBox } from '@dhis2/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { DATE_FORMAT_OPTIONS } from '../../../configs/Constants.js';

const InstallationInfo = ({ isInstalled, versionValid, installDate }) => {
    return (
        <>
            <p><strong>Installation date: </strong>{new Date(installDate).toLocaleString("en-US", DATE_FORMAT_OPTIONS)} </p>
            <NoticeBox error={!isInstalled || !versionValid} title="Metadata Package Status">
                {isInstalled &&
                    <p>{
                        versionValid
                            ? "The Metadata Package is installed."
                            : "The Metadata Package is outdated, please install the latest version."
                    }</p>
                }
                {!isInstalled &&
                    <p>The required Metadata Package is incomplete or corrupted, please reinstall it.</p>
                }
            </NoticeBox>
        </>
    );
};

InstallationInfo.propTypes = {
    installDate: PropTypes.string.isRequired,
    isInstalled: PropTypes.bool.isRequired,
    versionValid: PropTypes.bool.isRequired
};

export default InstallationInfo;