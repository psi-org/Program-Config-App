import { useDataQuery } from "@dhis2/app-runtime";
import { Chip, CircularLoader, NoticeBox, Pagination } from "@dhis2/ui";
import { useState, useEffect } from "react";
import ProgramNew from './ProgramNew'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import TextField from '@mui/material/TextField';
import InputAdornment from "@mui/material/InputAdornment";

import SearchIcon from '@mui/icons-material/Search';

import ProgramItem from "./ProgramItem";
import DependencyExport from "./DependencyExport";
import SharingScreen from "../Sharing/SharingScreen";
import OunitScreen from "../Org_Units/OunitScreen";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';

import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';

import About from "./About";
import H2Metadata from "./H2Metadata";


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
        paging: false,
        params: ({ token, pageSize, page, pgrTypeAttrId }) => {
            let paramsObject = {
                pageSize,
                page,
                fields: ["code", "id", "name", "shortName", "completeEventsExpiryDays", "description", "ignoreOverdueEvents", "skipOffline", "featureType", "minAttributesRequiredToSearch", "displayFrontPageList", "enrollmentDateLabel", "onlyEnrollOnce", "programType", "accessLevel", "sharing", "version", "maxTeiCountToReturn", "selectIncidentDatesInFuture", "incidentDateLabel", "expiryPeriodType", "displayIncidentDate", "selectEnrollmentDatesInFuture", "expiryDays", "useFirstStageDuringRegistration", "relatedProgram", "categoryCombo[id,name]", "trackedEntityType[id,name]", "style", "programTrackedEntityAttributes", "notificationTemplates", "translations", "organisationUnits", "programSections", "attributeValues", "programStages[id,name,programStageSections[*]]"],
                filter: ['withoutRegistration:eq:false']
            }

            if (token !== "") paramsObject.filter.push(`identifiable:token:${token}`)

            return paramsObject
        }
    }
};

const orgUnitsQuery = {
    userOrgUnits: {
        resource: 'me',
        params: {
            fields: ['organisationUnits[id, path]']
        }
    },
    orgUnitGroups: {
        resource: 'organisationUnitGroups',
        params: {
            paging: false,
            fields: ['id','displayName'],
            order: 'displayName'
        }
    },
    orgUnitLevels: {
        resource: 'organisationUnitLevels',
        params: {
            paging: false,
            fields: ['id','level','displayName'],
            order: 'level'
        }
    }
}

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProgramList = () => {

    // Export Program Metadata //
    const [exportProgramId, setExportProgramId] = useState(undefined)
    const [sharingProgramId, setSharingProgramId] = useState(undefined);
    const [orgUnitProgramId, setOrgUnitProgramId] = useState(undefined);

    // *********************** //

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [notification, setNotification] = useState(undefined);
    const [snackSeverity, setSnackSeverity] = useState(undefined);

    const [filterValue, setFilterValue] = useState('')

    const [settingsMenu,setSettingsMenu] = useState(false)
    const [ref, setRef] = useState();

    const [aboutModal,setAboutModal] = useState(false);
    const [H2Modal,setH2Modal] = useState(false);

    useEffect(() => {
        if (notification) setSnackSeverity(notification.severity)
    }, [notification])

    const prgTypeQuery = useDataQuery(queryProgramType);
    const orgUnitMetaData = useDataQuery(orgUnitsQuery);
    const prgTypeId = prgTypeQuery.data?.results.attributes[0].id;

    const downloadMetadata = (program) => {
        setExportProgramId(program)
    }

    const shareProgram = (program) => {
        setSharingProgramId(program)
    }

    const assignOrgUnit = (program) => {
        setOrgUnitProgramId(program)
    }

    const deleteProgram = (program) => {

    }

    const { loading, error, data, refetch } = useDataQuery(query, { variables: { token: filterValue, pageSize, page: currentPage, prgTypeId } });

    if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
    if (loading) return <CircularLoader />

    const doSearch = (filter) => {
        if (filter) setFilterValue(filter)
        setCurrentPage(1)
        refetch({ token: filter ?? filterValue, page: 1, pageSize })
    }

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p"><Chip>Home</Chip></div>
                <div className="c_srch"></div>
                <div className="c_btns">
                    <MuiButton
                        variant="outlined"
                        color='inherit'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setShowProgramForm(true)}
                        disabled={showProgramForm}>
                        Add Program
                    </MuiButton>
                    <IconButton color="inherit" onClick={()=>{setRef(document.getElementById('settingsMenu')); setSettingsMenu(!settingsMenu);}} id={'settingsMenu'}>
                        <SettingsIcon/>
                    </IconButton>
                    {settingsMenu &&
                        <Layer onClick={()=>setSettingsMenu(!settingsMenu)}>
                            <Popper reference={ref} placement="bottom-end">
                                <FlyoutMenu>
                                    <MenuItem label="About PCA" icon={<InfoIcon />} onClick={() => { setSettingsMenu(false); setAboutModal(true); }} />
                                    <MenuItem label="HNQIS 2.0 Status" icon={<InstallDesktopIcon />} onClick={()=>{ setSettingsMenu(false); setH2Modal(true) ;}}/>
                                </FlyoutMenu>
                            </Popper>
                        </Layer>
                    }
                    {exportProgramId &&
                        <DependencyExport program={exportProgramId} setExportProgramId={setExportProgramId} />
                    }
                    {
                        sharingProgramId &&
                        <SharingScreen element="program" id={sharingProgramId} setSharingProgramId={setSharingProgramId} />
                    }
                    {
                        orgUnitProgramId &&
                            <OunitScreen id={orgUnitProgramId} orgUnitMetaData={orgUnitMetaData.data}  setOrgUnitProgramId={setOrgUnitProgramId}/>
                    }
                </div>
            </div>
            <div style={{ margin: '0px 16px 8px' }}>
                <div className="title">List of programs</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        margin="dense"
                        id="name"
                        label="Filter Programs by UID, Name, Short Name, Code..."
                        type="text"
                        variant="outlined"
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        onKeyPress={event => {
                            if (event.key === 'Enter') { doSearch() }
                        }}
                        sx={{ width: '100%' }}
                        autoComplete='off'
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <MuiButton
                                        onClick={() => {doSearch() }}
                                        startIcon={<SearchIcon />}
                                        variant='contained'
                                        color='primary'>
                                        Search
                                    </MuiButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </div>
            </div>
            <div className="wrapper">
                <div className="layout_prgms_stages">
                    <div className="list-ml_item">
                        {
                            data.results.programs.map((program) => {
                                return <ProgramItem
                                    program={program}
                                    key={program.id}
                                    downloadMetadata={downloadMetadata}
                                    shareProgram={shareProgram}
                                    assignOrgUnit={assignOrgUnit}
                                    deleteProgram={deleteProgram}
                                    prgTypeId={prgTypeId}
                                    refetch={refetch}
                                    setNotification={setNotification}
                                    doSearch={doSearch}
                                />
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="wrapper">
                <Pagination
                    page={data.results.pager.page}
                    pageSize={data.results.pager.pageSize}
                    pageCount={data.results.pager.pageCount}
                    total={data.results.pager.pageCount}
                    pageSizes={["5", "10", "15", "20", "25", "50", "100"]}
                    onPageSizeChange={(pageSize) => { setPageSize(pageSize); refetch({ pageSize, page: 1 }) }}
                    onPageChange={(page) => { setCurrentPage(page); refetch({ page, pageSize }) }}
                />
            </div>
            {showProgramForm && <ProgramNew setShowProgramForm={setShowProgramForm} programsRefetch={refetch} setNotification={setNotification} doSearch={doSearch} />}

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={notification !== undefined}
                key={'topcenter'}
            >
                <Alert onClose={() => setNotification(undefined)} severity={notification?.severity || snackSeverity} sx={{ width: '100%' }}>
                    {notification?.message}
                </Alert>
            </Snackbar>

            {aboutModal && <About aboutModal={aboutModal} setAboutModal={setAboutModal} /> }
            {H2Modal && <H2Metadata H2Modal={H2Modal} setH2Modal={setH2Modal} /> }
        </div>
    );
};

export default ProgramList;