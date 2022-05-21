import { useDataQuery } from "@dhis2/app-runtime";
import { Button, Chip, CircularLoader, NoticeBox, Pagination, IconAddCircle24, Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Input, InputField, SwitchField } from "@dhis2/ui";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProgramNew from './ProgramNew'
import download_svg from './../../images/i-download.svg';
import upload_svg from './../../images/i-upload.svg';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// ------------------
import ProgramItem from "./ProgramItem";
import DependencyExport from "./DependencyExport";
import SharingScreen from "../Sharing/SharingScreen";
import DataProcessor from "../Excel/DataProcessor";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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
    params: ({ pageSize, page, pgrTypeAttrId }) => ({
      pageSize,
      page,
      filter: "attributeValues.attribute.id:eq:" + pgrTypeAttrId,
      filter: "attributeValues.value:eq:HNQIS2",
      fields: ["id", "name", "displayName", "programStages"],
    }),
  }
};

// http://localhost:8080/api/programs/ZnEDZVRfsld/metadata.json?skipSharing=true
/*const queryProgramMetadata = {
  results: {
      resource: ({ program }) => 'programs/'+program+'/metadata.json?skipSharing=true'
  }
};*/

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProgramList = () => {

  // Export Program Metadata //
  const [exportProgramId, setExportProgramId] = useState(undefined)
  const [ sharingProgramId, setSharingProgramId] = useState(undefined)
  /*const exportQuery = useDataQuery(queryProgramMetadata,{/* lazy:true, variables:{program:exportProgramId}});*/

  /*useEffect(()=>{
    if(exportProgramId){
      
      console.log(exportQuery)
      
      exportQuery
      .refetch( {variables:{program:exportProgramId}} )
      .then(data => console.log(data))
    }
  },[exportProgramId])*/


  // *********************** //

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportToExcel, setExportToExcel] = useState(false);
  const [exportStatus, setExportStatus] = useState("Download");
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [notification, setNotification] = useState(undefined);
  const [snackSeverity, setSnackSeverity] = useState(undefined);

  useEffect(()=>{
    if(notification) setSnackSeverity(notification.severity)
  }, [notification])

  const [competencyClassParam, setCompetencyClassParam] = useState(false);

  const prgTypeQuery = useDataQuery(queryProgramType);
  const prgTypeId = prgTypeQuery.data?.results.attributes[0].id;

  const downloadMetadata = (program) => {
    setExportProgramId(program)
  }

  const shareProgram = (program) => {
    setSharingProgramId(program)
  }

  const deleteProgram = (program) => {

  }

  const { loading, error, data, refetch } = useDataQuery(query, { variables: { pageSize, page: currentPage, prgTypeId } });

  if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
  if (loading) return <CircularLoader />

  const configuration_download = () => {
    setExportToExcel(true);
    setExportStatus("Generating Configuration File...")
  };

  return (
    <div>
      <div className="sub_nav">
        <div className="cnt_p"><Chip>Home</Chip></div>
        <div className="c_srch"></div>
        <div className="c_btns">
          <Button icon={<AddCircleOutlineIcon />} onClick={() => setShowProgramForm(true)} disabled={showProgramForm}>Add Program</Button>
          {exportProgramId &&
            <DependencyExport program={exportProgramId} setExportProgramId={setExportProgramId} />
          }
          {
            sharingProgramId &&
            <SharingScreen element = "program" id={sharingProgramId} setSharingProgramId={setSharingProgramId}/>
          }
          {/*
            <Button loading={exportToExcel ? true : false} onClick={() => configuration_download()} disabled={exportToExcel}><img src={download_svg} /> Download Template</Button>
            <Button disabled={true}><img src={upload_svg} /> Import Template</Button>
          */}
        </div>
      </div>
      <div className="wrapper">
        {exportToExcel && <DataProcessor ps="null" isLoading={setExportToExcel} setStatus={setExportStatus} />}
        <div className="title">List of programs</div>
        <div className="layout_prgms_stages">
          <div className="list-ml_item">
            {
              data.results.programs.map((program) => {
                return <ProgramItem program={program} key={program.id} downloadMetadata={downloadMetadata} shareProgram={shareProgram} deleteProgram={deleteProgram} />
              })
            }
          </div>
        </div>
      </div>
      <div className="wrapper" >
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
