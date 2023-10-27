import { useDataQuery } from "@dhis2/app-runtime";
import { Chip, CircularLoader, NoticeBox, Pagination, FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import React, { useState, useEffect } from "react";
import { formatAlert } from "../../utils/Utils.js";
import OunitScreen from "../Org_Units/OunitScreen.js";
import BackupScreen from "../PRG_List/BackupScreen.js";
import RestoreScreen from "../PRG_List/RestoreScreen.js";
import SharingScreen from "../Sharing/SharingScreen.js";
import About from "./About.js";
import DependencyExport from "./DependencyExport.js";
import H2Convert from "./H2Convert.js";
import H2Metadata from "./H2Metadata.js";
import H2Transfer from "./H2Transfer.js";
import ProgramItem from "./ProgramItem.js";
import ProgramNew from './ProgramNew.js'

const queryProgramType = {
    results: {
        resource: 'attributes',
        params: {
            fields: ['id'],
            filter: ['code:eq:PROGRAM_TYPE']
        }
    }
};

const query = {
    results: {
        resource: "programs",
        params: ({ token, pageSize, page }) => {
            const paramsObject = {
                pageSize,
                page,
                fields: ["code", "id", "name", "shortName", "created", "lastUpdated", "href", "completeEventsExpiryDays", "description", "ignoreOverdueEvents", "skipOffline", "featureType", "minAttributesRequiredToSearch", "displayFrontPageList", "enrollmentDateLabel", "onlyEnrollOnce", "programType", "accessLevel", "sharing", "version", "maxTeiCountToReturn", "selectIncidentDatesInFuture", "incidentDateLabel", "expiryPeriodType", "displayIncidentDate", "selectEnrollmentDatesInFuture", "expiryDays", "useFirstStageDuringRegistration", "relatedProgram", "categoryCombo[id,name]", "trackedEntityType[id,name,trackedEntityTypeAttributes[trackedEntityAttribute[id]]]", "style", "programTrackedEntityAttributes[id,name,displayInList,sortOrder,mandatory,allowFutureDate,renderOptionAsRadio,searchable,valueType,trackedEntityAttribute[id,name],renderType]", "notificationTemplates", "translations", "organisationUnits", "attributeValues", "programSections[id,name,trackedEntityAttributes,sortOrder,program,renderType]","programStages[id, name, allowGenerateNextVisit, formType, generatedByEnrollmentDate, sortOrder, hideDueDate, enableUserAssignment, minDaysFromStart, openAfterEnrollment, repeatable, remindCompleted, displayGenerateEventBox, validationStrategy, autoGenerateEvent, blockEntryForm, program, sharing, programStageDataElements, translations, attributeValues, programStageSections[*]]", "access", "withoutRegistration"],
                filter: []
            }

            if (token !== "") {
                paramsObject.filter.push(`name:$ilike:${token}`)
                paramsObject.filter.push(`identifiable:token:${token}`)
                paramsObject.rootJunction = 'OR'
            }
            //Original: if (token !== "") paramsObject.filter.push(`identifiable:token:${token}`)

            return paramsObject
        }
    }
};

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProgramList = () => {

    //console.log(semverCoerce("2.37-SNAPSHOT"))
    // Export Program Metadata //
    const [exportProgramId, setExportProgramId] = useState(undefined)
    const [sharingProgramId, setSharingProgramId] = useState(undefined);
    const [sharingProgramType, setSharingProgramType] = useState(undefined);
    const [backupProgramId, setBackupProgramId] = useState(undefined);
    const [restoreProgramId, setRestoreProgramId] = useState(undefined);
    const [readOnlyPermission, setReadOnlyPermission] = useState(false);
    const [orgUnitProgram, setOrgUnitProgram] = useState(undefined);
    const [conversionH2ProgramId, setConversionH2ProgramId] = useState(undefined);
    const [transferH2Program, setTransferH2Program] = useState(undefined);

    // *********************** //

    const [pageSize, setPageSize] = useState(Number(localStorage.getItem('programsListPageSize')) || 10);
    const [currentPage, setCurrentPage] = useState(Number(localStorage.getItem('programsListPage')) || 1);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [notification, setNotification] = useState(undefined);
    const [snackSeverity, setSnackSeverity] = useState(undefined);

    const [filterValue, setFilterValue] = useState(localStorage.getItem('programsListFilter') || '')

    const [settingsMenu, setSettingsMenu] = useState(false)
    const [ref, setRef] = useState();

    const [aboutModal, setAboutModal] = useState(false);
    const [H2Modal, setH2Modal] = useState(false);

    useEffect(() => {
        if (notification) { setSnackSeverity(notification.severity) }
    }, [notification])

    useEffect(() => {
        if (pageSize && currentPage && filterValue) {
            setSearchLocalStorage('');
        }
    }, [])

    const prgTypeQuery = useDataQuery(queryProgramType);
    const prgTypeId = prgTypeQuery.data?.results?.attributes[0]?.id;

    const downloadMetadata = (program) => {
        setExportProgramId(program)
    }

    const shareProgram = (program, prgType) => {
        const prg = data.results?.programs?.filter(p => { return p.id === program });
        setReadOnlyPermission(!prg[0]?.access?.update);
        setSharingProgramId(program)
        setSharingProgramType(prgType)
    }

    const assignOrgUnit = (program, readOnly) => {
        setOrgUnitProgram({ program, readOnly })
    }

    const backupProgram = (program) => {
        setBackupProgramId(program)
    }

    const convertToH2 = (program) => {
        setConversionH2ProgramId(program)
    }

    const transferDataH2 = (program) => {
        setTransferH2Program(program);
    };

    const restoreProgram = (program) => {
        setRestoreProgramId(program)
    }

    const deleteProgram = () => {
        
    }

    const setSearchLocalStorage = (filter, page = 1, pageSize = 10) => {
        localStorage.setItem('programsListPage', page);
        localStorage.setItem('programsListPageSize', pageSize);
        localStorage.setItem('programsListFilter', filter || '');

    }

    const setSearchLocalStorageWithCurrentValues = () => {
        setSearchLocalStorage(filterValue, currentPage, pageSize);
    }

    const { loading, error, data, refetch } = useDataQuery(query, { variables: { token: filterValue, pageSize, page: currentPage } });

    if (error) { return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox> }
    if (loading) { return <CircularLoader /> }

    const doSearch = (filter) => {
        if (filter) { setFilterValue(filter) }
        setCurrentPage(1);
        setSearchLocalStorage(filterValue, currentPage, pageSize)
        refetch({ token: filter ?? filterValue, page: 1, pageSize })
    }

    const resetSearch = () => {
        setFilterValue("")
        setCurrentPage(1)
        setSearchLocalStorage("", 1, 10);
        refetch({ token: "", page: 1, pageSize })
    }
    

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p" onClick={() => { resetSearch(); }}>
                    <Chip>Home</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns">
                    <MuiButton
                        variant="outlined"
                        color="inherit"
                        size="large"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setShowProgramForm(true)}
                        disabled={showProgramForm}
                        sx={{verticalAlign: 'center'}}
                    >
                        Add Program
                    </MuiButton>
                    <MuiButton
                        variant="text"
                        color="inherit"
                        size="large"
                        startIcon={<SettingsIcon />}
                        onClick={() => {
                            setRef(document.getElementById("settingsMenu"));
                            setSettingsMenu(!settingsMenu);
                        }}
                        id={"settingsMenu"}
                    >
                        Settings
                    </MuiButton>
                    {settingsMenu && (
                        <Layer onClick={() => setSettingsMenu(!settingsMenu)}>
                            <Popper reference={ref} placement="bottom-end">
                                <FlyoutMenu>
                                    <MenuItem
                                        label="System Objects"
                                        disabled={true}
                                        icon={<BuildIcon />}
                                        onClick={() => {
                                        }}
                                    />
                                    <MenuItem
                                        label="About PCA"
                                        icon={<InfoIcon />}
                                        onClick={() => {
                                            setSettingsMenu(false);
                                            setAboutModal(true);
                                        }}
                                    />
                                    <MenuItem
                                        label="HNQIS 2.0 Status"
                                        icon={<InstallDesktopIcon />}
                                        onClick={() => {
                                            setSettingsMenu(false);
                                            setH2Modal(true);
                                        }}
                                    />
                                </FlyoutMenu>
                            </Popper>
                        </Layer>
                    )}
                    {exportProgramId && (
                        <DependencyExport
                            program={exportProgramId.id}
                            programType={exportProgramId.type}
                            setExportProgramId={setExportProgramId}
                        />
                    )}
                    {sharingProgramId && (
                        <SharingScreen
                            element="program"
                            id={sharingProgramId}
                            setSharingProgramId={setSharingProgramId}
                            type={sharingProgramType}
                            setType={setSharingProgramType}
                            readOnly={readOnlyPermission}
                            setNotification={setNotification}
                        />
                    )}
                    {orgUnitProgram && (
                        <OunitScreen
                            id={orgUnitProgram.program}
                            readOnly={orgUnitProgram.readOnly}
                            setOrgUnitProgram={setOrgUnitProgram}
                            setNotification={setNotification}
                        />
                    )}
                    {backupProgramId && (
                        <BackupScreen
                            program={backupProgramId}
                            setBackupProgramId={setBackupProgramId}
                            setNotification={setNotification}
                        />
                    )}
                    {conversionH2ProgramId && (
                        <H2Convert
                            program={conversionH2ProgramId}
                            setConversionH2ProgramId={setConversionH2ProgramId}
                            setNotification={setNotification}
                            doSearch={doSearch}
                        />
                    )}
                    {transferH2Program && (
                        <H2Transfer
                            programConfig={transferH2Program}
                            setTransferH2Program={setTransferH2Program}
                            setNotification={setNotification}
                            doSearch={doSearch}
                        />
                    )}
                    {restoreProgramId && (
                        <RestoreScreen
                            program={restoreProgramId}
                            setRestoreProgramId={setRestoreProgramId}
                            setNotification={setNotification}
                        />
                    )}
                </div>
            </div>
            <div>
                <div className="title" style={{ padding: '1.5em 1em 0'}}>
                    <span>List of Programs</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", padding: '0 1.2em' }}>
                    <TextField
                        margin="dense"
                        id="name"
                        label="Filter Programs by UID, Name, Short Name, Code..."
                        type="text"
                        variant="outlined"
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        onKeyPress={(event) => {
                            if (event.key === "Enter") {
                                doSearch();
                            }
                        }}
                        sx={{ width: "100%"}}
                        autoComplete="off"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip
                                        title="Clear Search"
                                        placement="left"
                                    >
                                        <IconButton
                                            onClick={() => {
                                                resetSearch();
                                            }}
                                            style={{ marginRight: "0.5em" }}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <MuiButton
                                        onClick={() => {
                                            doSearch();
                                        }}
                                        startIcon={<SearchIcon />}
                                        variant="contained"
                                        color="info"
                                    >
                                        Search
                                    </MuiButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>

            </div>

            <div className="wrapper" style={{ padding: '1em  1.2em 0' }}>
                <div className="layout_prgms_stages">
                    {data.results?.programs?.length === 0 &&
                        <div className="title" style={{ padding: '1.5em', display: 'flex', justifyContent: 'center' }}>No Programs Found</div>
                    }
                    <div className="list-ml_item">
                        {data.results?.programs?.map((program) => {
                            return (
                                <ProgramItem
                                    program={program}
                                    key={program.id}
                                    downloadMetadata={downloadMetadata}
                                    shareProgram={shareProgram}
                                    assignOrgUnit={assignOrgUnit}
                                    backupProgram={backupProgram}
                                    restoreProgram={restoreProgram}
                                    deleteProgram={deleteProgram}
                                    prgTypeId={prgTypeId}
                                    refetch={refetch}
                                    setNotification={setNotification}
                                    doSearch={doSearch}
                                    convertToH2={convertToH2}
                                    transferDataH2={transferDataH2}
                                    setSearchLocalStorage={setSearchLocalStorageWithCurrentValues}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            {data.results?.programs?.length > 0 &&
                <div className="wrapper" style={{ padding: '0 1.2em', marginTop: '0.5em' }}>
                    <Pagination
                        page={data.results?.pager?.page}
                        pageSize={data.results?.pager?.pageSize}
                        pageCount={data.results?.pager?.pageCount}
                        total={data.results?.pager?.pageCount}
                        pageSizes={["5", "10", "15", "20", "25", "50", "100"]}
                        onPageSizeChange={(pageSize) => {
                            setPageSize(pageSize);
                            refetch({ pageSize, page: 1 });
                            setSearchLocalStorage(filterValue, 1, pageSize);
                        }}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            refetch({ page, pageSize });
                            setSearchLocalStorage(filterValue, page, pageSize);
                        }}
                    />
                </div>
            }
            {showProgramForm && (
                <ProgramNew
                    setShowProgramForm={setShowProgramForm}
                    programsRefetch={refetch}
                    setNotification={setNotification}
                    doSearch={doSearch}
                />
            )}

            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={notification !== undefined}
                key={"topcenter"}
            >
                <Alert
                    onClose={() => setNotification(undefined)}
                    severity={notification?.severity || snackSeverity}
                    sx={{ width: "100%" }}
                >
                    {formatAlert(notification?.message)}
                </Alert>
            </Snackbar>

            {aboutModal && (
                <About aboutModal={aboutModal} setAboutModal={setAboutModal} />
            )}
            {H2Modal && (
                <H2Metadata H2Modal={H2Modal} setH2Modal={setH2Modal} />
            )}
        </div>
    );
};

export default ProgramList;