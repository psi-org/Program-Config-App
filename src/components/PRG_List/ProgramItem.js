import { FlyoutMenu, MenuItem, Popper, Layer, MenuSectionHeader } from "@dhis2/ui";
import BackupIcon from '@mui/icons-material/Backup';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PublicIcon from '@mui/icons-material/Public';
import RestoreIcon from '@mui/icons-material/Restore';
import ShareIcon from '@mui/icons-material/Share';
import StorageIcon from '@mui/icons-material/Storage';
import UpgradeIcon from '@mui/icons-material/SwitchAccessShortcutAdd';
import {  IconButton, Slide, Snackbar, Tooltip } from "@mui/material";
import Popover from '@mui/material/Popover';
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { bindActionCreators } from "redux";
import tinycolor from 'tinycolor2';
import { BUILD_VERSION, DATE_FORMAT_OPTIONS, METADATA } from "../../configs/Constants.js";
import actionCreators from "../../state/action-creators";
import { versionIsValid } from "../../utils/Utils.js";
import move_vert_svg from './../../images/i-more_vert_black.svg';
import ProgramNew from "./ProgramNew.js";


// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const ProgramItem = ({
    program,
    downloadMetadata,
    shareProgram,
    assignOrgUnit,
    backupProgram,
    restoreProgram,
    deleteProgram,
    prgTypeId,
    refetch,
    setNotification,
    doSearch,
    convertToH2,
    transferDataH2,
    setSearchLocalStorage
}) => {

    const [showNotification, setShowNotification] = useState(false);

    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [showProgramForm, setShowProgramForm] = useState(false);

    const h2Ready = localStorage.getItem("h2Ready") === "true";

    const [anchorEl, setAnchorEl] = useState(null);

    const toggle = () => setOpen(!open);

    const history = useHistory();

    const dispatch = useDispatch();
    const { setProgram } = bindActionCreators(actionCreators, dispatch);
    const programType =
        program.attributeValues.find((av) => av.attribute.id === prgTypeId)
            ?.value || (!program.withoutRegistration ? "Tracker" : "Event");
    const pcaMetadata = JSON.parse(
        program.attributeValues.find((av) => av.attribute.id === METADATA)
            ?.value || "{}"
    );
    const typeTag = {
        HNQIS2: { color: "#03a9f4", text: "HNQIS 2.0" },
        HNQIS: { color: "#00deff", text: "HNQIS 1.X" },
        RDQA: { color: "#00acc1", text: "RDQA" },
        EDS: { color: "#607d8b", text: "EDS" },
        Tracker: { color: "#2c6693", text: "TRACKER" },
        Event: { color: "#6e8ea6", text: "EVENT" },
    };

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openPop = Boolean(anchorEl);
    const id = openPop ? "simple-popover" : undefined;

    return (
        <>
            <div className="ml_item" style={{ color: "#333333", backgroundColor: "#F8F8F8", border: "0.5px solid #D5DDE5", borderRadius: "4px", padding: '5px', width: '100%', maxWidth: '100%' }}>
                <div className="ml_list-icon" style={{ cursor: 'pointer' }} onClick={() => { setProgram(program.id); history.push('/program/' + program.id); }}>
                    <div className="ml_item-desc" style={{ width: '3.2em' }}>
                        <div style={{ backgroundColor: (program.style?.color || '#e0e0e0'), width: '3em', height: '3em', minWidth: '3em', minHeight: '3em', border: '1px solid #DDD', borderRadius: '10%', padding: '0' }}>
                            <img
                                src={`${(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)}/api/icons/${program.style?.icon || 'clinical_fe_outline'}/icon.svg`}
                                style={{ width: '100%', height: 'auto', borderRadius: '10%', zIndex: '999', filter: `brightness(0) invert(${tinycolor(program.style?.color || '#e0e0e0').isDark() ? 1 : 0})`, objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="ml_item-title" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setProgram(program.id); history.push('/program/' + program.id); setSearchLocalStorage();}}>
                    <Tooltip title={program.name} placement="bottom-start" arrow>
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            width: '100%'
                        }}>{program.name}</span>
                    </Tooltip>
                </div>


                <div className="ml_item-desc">
                    {programType !== 'HNQIS' && pcaMetadata.buildVersion && !versionIsValid(pcaMetadata.buildVersion, BUILD_VERSION, BUILD_VERSION) &&
                        <Tooltip title={`This Program's logic was built in version ${pcaMetadata.buildVersion}, please ${programType === 'HNQIS2' ?"'Set Up Program'":"'Build Program Rules'"} again to update it.`}>
                            <NewReleasesIcon color="error" style={{ marginRight: "0.5em", cursor: 'pointer' }} />
                        </Tooltip>
                    }
                    {programType !== 'HNQIS' && !pcaMetadata.buildVersion &&
                        <Tooltip title={"This Program's logic hasn't been built yet."}>
                            <NewReleasesIcon color="error" style={{ marginRight: "0.5em", cursor: 'pointer' }} />
                        </Tooltip>
                    }
                    <IconButton
                        style={{ marginRight: "0.5em" }}
                        onClick={handleOpen}
                        aria-describedby={id}
                    >
                        <InfoIcon />
                    </IconButton>
                    <div>{program.programStages.length} Program Stages</div>
                    <div
                        style={{
                            backgroundColor: typeTag[programType].color,
                            width: "85px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        {typeTag[programType].text}
                    </div>
                </div>
                <div className="ml_item-cta">
                    <img
                        src={move_vert_svg}
                        id={"menu" + program.id}
                        alt="menu"
                        onClick={() => {
                            setRef(document.getElementById("menu" + program.id));
                            toggle();
                        }}
                        style={{ cursor: "pointer" }}
                    />
                    {open && (
                        <Layer onClick={toggle}>
                            <Popper reference={ref} placement="bottom-end">
                                {programType !== "HNQIS" &&
                                    <FlyoutMenu>
                                        <MenuItem
                                            label="Edit Program"
                                            icon={<EditIcon />}
                                            onClick={() => {
                                                toggle();
                                                setShowProgramForm(true);
                                            }}
                                        />
                                        <MenuItem
                                            label="Sharing Settings"
                                            icon={<ShareIcon />}
                                            onClick={() => {
                                                toggle();
                                                shareProgram(
                                                    program.id,
                                                    programType === "HNQIS2"
                                                        ? "hnqis"
                                                        : "tracker"
                                                );
                                            }}
                                        />
                                        <MenuItem
                                            label={"Assign Organisation Units"}
                                            icon={<PublicIcon />}
                                            onClick={() => {
                                                toggle();
                                                assignOrgUnit(program.id, !program.access.update);
                                            }}
                                        />

                                        <MenuItem
                                            label="Backup/Restore"
                                            icon={<StorageIcon />}
                                        >
                                            <MenuSectionHeader label="In Current Device" />
                                            <MenuItem
                                                label="Export JSON Metadata"
                                                icon={<DownloadIcon />}
                                                onClick={() => {
                                                    toggle();
                                                    downloadMetadata({ id: program.id, type: programType });
                                                }}
                                            />
                                            <MenuSectionHeader label="In Server" />
                                            <MenuItem
                                                label="Backup Program"
                                                icon={<BackupIcon />}
                                                onClick={() => {
                                                    toggle();
                                                    backupProgram(program);
                                                }}
                                            />
                                            <MenuItem
                                                label="Restore Program"
                                                icon={<RestoreIcon />}
                                                onClick={() => {
                                                    toggle();
                                                    restoreProgram(program);
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem
                                            disabled={true}
                                            destructive
                                            label="Delete Program"
                                            icon={<DeleteIcon />}
                                            onClick={() => {
                                                toggle();
                                                deleteProgram(program.id);
                                            }}
                                        />
                                    </FlyoutMenu>
                                }
                                {programType === "HNQIS" &&
                                    <FlyoutMenu>
                                        {h2Ready &&
                                            <MenuItem
                                                label={
                                                    pcaMetadata.h2Reworked !== "Yes"
                                                        ? "Convert to HNQIS 2.0 Program"
                                                        : "Already Converted to HNQIS 2.0"
                                                }
                                                disabled={
                                                    pcaMetadata.h2Reworked === "Yes"
                                                }
                                                icon={<UpgradeIcon />}
                                                onClick={() => {
                                                    toggle();
                                                    convertToH2(program.id);
                                                }}
                                            />
                                        }
                                        {
                                            pcaMetadata.dataConverted !== "Yes" && h2Ready &&
                                            <MenuItem
                                                label={
                                                    "Transfer Assessment Data to HNQIS 2.0"
                                                }
                                                disabled={
                                                    pcaMetadata.h2Reworked !==
                                                    "Yes"
                                                }
                                                icon={<MoveDownIcon />}
                                                onClick={() => {
                                                    toggle();
                                                    transferDataH2(program);
                                                }}
                                            />
                                        }
                                        <MenuItem
                                            disabled={true}
                                            destructive
                                            label="Delete Program"
                                            icon={<DeleteIcon />}
                                            onClick={() => {
                                                toggle();
                                                deleteProgram(program.id);
                                            }}
                                        />
                                    </FlyoutMenu>
                                }
                            </Popper>
                        </Layer>
                    )}
                    {showProgramForm && (
                        <ProgramNew
                            setShowProgramForm={setShowProgramForm}
                            programsRefetch={refetch}
                            setNotification={setNotification}
                            doSearch={doSearch}
                            data={program}
                            programType={
                                programType === "HNQIS2" ? "hnqis" : (program.withoutRegistration ? "event" : "tracker")
                            }
                            pcaMetadata={pcaMetadata}
                            readOnly={!program.access.update}
                        />
                    )}

                </div>
                <Popover
                    id={id}
                    open={openPop}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "center",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <div
                        style={{
                            padding: "1em",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1em",
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'space-between' }}>
                            <div>
                                <strong>Program ID</strong>
                                <br />
                                <span>{program.id}</span>
                            </div>
                            <div >
                                <span style={{ cursor: 'pointer' }} onClick={() => {
                                    navigator.clipboard.writeText(program.id)
                                    setShowNotification(true)
                                }}>
                                    <ContentCopyIcon fontSize={'small'} />
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'space-between' }}>
                            <div>
                                <strong>Program Name</strong>
                                <br />
                                <span>{program.name}</span>
                            </div>
                            <div >
                                <span style={{ cursor: 'pointer' }} onClick={() => {
                                    navigator.clipboard.writeText(program.name)
                                    setShowNotification(true)
                                }}>
                                    <ContentCopyIcon fontSize={'small'} />
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'space-between' }}>
                            <div>
                                <strong>Program Short Name</strong>
                                <br />
                                <span>{program.shortName}</span>
                            </div>
                            <div >
                                <span style={{ cursor: 'pointer' }} onClick={() => {
                                    navigator.clipboard.writeText(program.shortName)
                                    setShowNotification(true)
                                }}>
                                    <ContentCopyIcon fontSize={'small'} />
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'space-between' }}>
                            <div>
                                <strong>Program Code</strong>
                                <br />
                                <span>{program.code || '-'}</span>
                            </div>
                            <div >
                                {program.code &&
                                    <span style={{ cursor: 'pointer' }} onClick={() => {
                                        navigator.clipboard.writeText(program.code)
                                        setShowNotification(true)
                                    }}>
                                        <ContentCopyIcon fontSize={'small'} />
                                    </span>
                                }
                            </div>
                        </div>
                        <div>
                            <strong>Created</strong>
                            <br />
                            {new Date(program.created).toLocaleString(
                                "en-US",
                                DATE_FORMAT_OPTIONS
                            )}
                        </div>
                        <div>
                            <strong>Last Updated</strong>
                            <br />
                            {new Date(program.lastUpdated).toLocaleString(
                                "en-US",
                                DATE_FORMAT_OPTIONS
                            )}
                        </div>
                        <div>
                            <strong>Save Version</strong>
                            <br />
                            {pcaMetadata.saveVersion || 'N/A'}
                        </div>
                        {programType !== 'HNQIS' &&
                            <div>
                                <strong>Build Version</strong>
                                <br />
                                {pcaMetadata.buildVersion || 'N/A'}
                            </div>
                        }
                        <div>
                            <strong>API URL</strong>
                            <br />
                            <a href={program.href + ".json"} target="_blank" rel="noreferrer">
                                {program.href}
                            </a>
                        </div>
                    </div>
                </Popover>
            </div>
            <Snackbar
                message={'Value copied to clipboard'}
                open={showNotification}
                autoHideDuration={2000}
                onClose={() => { setShowNotification(!showNotification) }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Slide}
            />

        </>
    );
};

ProgramItem.propTypes = {
    assignOrgUnit: PropTypes.func,
    backupProgram: PropTypes.func,
    convertToH2: PropTypes.func,
    deleteProgram: PropTypes.func,
    doSearch: PropTypes.func,
    downloadMetadata: PropTypes.func,
    prgTypeId: PropTypes.string,
    program: PropTypes.object,
    refetch: PropTypes.func,
    restoreProgram: PropTypes.func,
    setNotification: PropTypes.func,
    setSearchLocalStorage: PropTypes.func,
    shareProgram: PropTypes.func,
    transferDataH2: PropTypes.func
}

export default ProgramItem;