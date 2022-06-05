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
                fields: ["id", "name", "shortName", "displayName", "ignoreOverdueEvents", "skipOffline", "enrollmentDateLabel", "onlyEnrollOnce", "version", "maxTeiCountToReturn", "selectIncidentDatesInFuture", "selectEnrollmentDatesInFuture", "useFirstStageDuringRegistration", "completeEventsExpiryDays", "minAttributesRequiredToSearch", "displayFrontPageList", "programType", "accessLevel", "displayIncidentDate", "expiryDays", "style", "trackedEntityType", "translations", "attributeValues", "programTrackedEntityAttributes", "notificationTemplates", "organisationUnits", "programSections", "programStages"],
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
    const [ sharingProgramId, setSharingProgramId] = useState(undefined);
    const [ orgUnitProgramId, setOrgUnitProgramId] = useState(undefined);

    // *********************** //

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showProgramForm, setShowProgramForm] = useState(false);
    const [notification, setNotification] = useState(undefined);
    const [snackSeverity, setSnackSeverity] = useState(undefined);

    const [filterValue, setFilterValue] = useState('')

    useEffect(() => {
        if (notification) setSnackSeverity(notification.severity)
    }, [notification])

    const [competencyClassParam, setCompetencyClassParam] = useState(false);

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

    const doSearch = () => {
        setCurrentPage(1)
        refetch({ token: filterValue, page: 1, pageSize })
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
                    {exportProgramId &&
                    <DependencyExport program={exportProgramId} setExportProgramId={setExportProgramId} />
                    }
                    {
                        sharingProgramId &&
                        <SharingScreen element="program" id={sharingProgramId} setSharingProgramId={setSharingProgramId}/>
                    }
                    {
                        orgUnitProgramId &&
                            <OunitScreen id={orgUnitProgramId} orgUnitMetaData={orgUnitMetaData.data}  setOrgUnitProgramId={setOrgUnitProgramId}/>
                    }
                </div>
            </div>
            <div style={{margin: '0px 16px 8px'}}>
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
                            if (event.key === 'Enter' /* && filterValue!=='' */) {
                                /* if(currentPage===1)  */doSearch()
                                /* else setCurrentPage(1) */
                            }
                        }}
                        sx={{width: '100%'}}
                        autoComplete='off'
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <MuiButton onClick={() => {
                                        doSearch()
                                        /* if (filterValue!=='') {
                                            if(currentPage===1) doSearch()
                                            else setCurrentPage(1)
                                        } */
                                    }}
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
                                return <ProgramItem program={program} key={program.id} downloadMetadata={downloadMetadata} shareProgram={shareProgram} assignOrgUnit={assignOrgUnit} deleteProgram={deleteProgram} prgTypeId={prgTypeId} serverVersion={window.localStorage.SERVER_VERSION ?? "2.35"} />
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
            {showProgramForm && <ProgramNew setShowProgramForm={setShowProgramForm} programsRefetch={refetch} setNotification={setNotification} />}

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={notification !== undefined}
                key={'topcenter'}
            >
                <Alert onClose={() => setNotification(undefined)} severity={notification?.severity || snackSeverity} sx={{ width: '100%' }}>
                    {notification?.message}
                </Alert>
            </Snackbar>

        </div>
    );
};

export default ProgramList;