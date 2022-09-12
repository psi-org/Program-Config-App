// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

//UI Elements
import { FlyoutMenu, MenuItem, Popper, Layer, MenuSectionHeader } from "@dhis2/ui";
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PublicIcon from '@mui/icons-material/Public';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import StorageIcon from '@mui/icons-material/Storage';
import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import UpgradeIcon from '@mui/icons-material/SwitchAccessShortcutAdd';
import MoveDownIcon from '@mui/icons-material/MoveDown';

// *** Routing ***
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

// *** IMAGES ***
import move_vert_svg from './../../images/i-more_vert_black.svg';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import tinycolor from 'tinycolor2';
import ProgramNew from "./ProgramNew";
import { DATE_FORMAT_OPTIONS, METADATA } from "../../configs/Constants";
import { IconButton, Typography } from "@mui/material";

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
}) => {
    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [showProgramForm, setShowProgramForm] = useState(false);

    const h2Ready = localStorage.getItem("h2Ready") === "true";

    const [anchorEl, setAnchorEl] = useState(null);

    const toggle = () => setOpen(!open);

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
        RDQA: { color: "#00acc1", text: "RDQA PRG" },
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
        <div className="ml_item" style={{ color: "#333333", backgroundColor: "#F8F8F8", border: "0.5px solid #D5DDE5", borderRadius: "4px", padding: '5px' }}>
            <div className="ml_list-icon"> {/* REMOVED ml_item-icon ... ml_item-icon TO delete cursor:move */}
                <div className="ml_item-desc" style={{ width: '3.2em' }}>
                    <div style={{ backgroundColor: (program.style?.color || '#e0e0e0'), width: '3em', height: '3em', minWidth: '3em', minHeight: '3em', border: '1px solid #DDD', borderRadius: '10%', padding: '0' }}>
                        <img
                            src={`${(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)}/api/icons/${program.style?.icon || 'clinical_fe_outline'}/icon.svg`}
                            style={{ width: '100%', height: 'auto', borderRadius: '10%', zIndex: '999', filter: `brightness(0) invert(${tinycolor(program.style?.color || '#e0e0e0').isDark() ? 1 : 0})`, objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
            <div className="ml_item-title">{program.name}</div>
            <div className="ml_item-desc">
                <IconButton
                    style={{ marginRight: "0.5em" }}
                    onClick={handleOpen}
                    aria-describedby={id}
                >
                    <InfoIcon />
                </IconButton>
                <div>{program.programStages.length} program stages</div>
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
                            {!program.withoutRegistration && (
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
                                            assignOrgUnit(program.id);
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
                                                downloadMetadata(program.id);
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
                            )}
                            {program.withoutRegistration && (
                                <FlyoutMenu>
                                    {programType === "HNQIS" && h2Ready && (
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
                                    )}
                                    {programType === "HNQIS" &&
                                        pcaMetadata.dataConverted !== "Yes" &&
                                        h2Ready && (
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
                                        )}
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
                            )}
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
                            programType === "HNQIS2" ? "hnqis" : "tracker"
                        }
                        pcaMetadata={pcaMetadata}
                    />
                )}
                {!program.withoutRegistration && (
                    <Link
                        to={"/program/" + program.id}
                        style={{ color: "#333333" }}
                    >
                        <div
                            style={{ display: "flex", alignItems: "center" }}
                            onClick={() => setProgram(program.id)}
                        >
                            <NavigateNextIcon />
                        </div>
                    </Link>
                )}
                {program.withoutRegistration && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#AAAAAA",
                            cursor: "not-allowed",
                        }}
                    >
                        <NavigateNextIcon />
                    </div>
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
                    <p>
                        <strong>Program ID</strong>
                        <br />
                        {program.id}
                    </p>
                    <p>
                        <strong>Program Short Name</strong>
                        <br />
                        {program.shortName}
                    </p>
                    <p>
                        <strong>Created</strong>
                        <br />
                        {new Date(program.created).toLocaleString(
                            "en-US",
                            DATE_FORMAT_OPTIONS
                        )}
                    </p>
                    <p>
                        <strong>Last Updated</strong>
                        <br />
                        {new Date(program.lastUpdated).toLocaleString(
                            "en-US",
                            DATE_FORMAT_OPTIONS
                        )}
                    </p>
                    <p>
                        <strong>API URL</strong>
                        <br />
                        <a href={program.href + ".json"} target="_blank">
                            {program.href}
                        </a>
                    </p>
                </div>
            </Popover>
        </div>
    );
};

export default ProgramItem;