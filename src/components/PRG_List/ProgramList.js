import { useDataQuery } from "@dhis2/app-runtime";
import { Button, Chip, CircularLoader, NoticeBox, Pagination, IconAddCircle24, Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Input, InputField, SwitchField } from "@dhis2/ui";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProgramNew from './ProgramNew'
import download_svg from './../../images/i-download.svg';
import upload_svg from './../../images/i-upload.svg';

// ------------------
import ProgramItem from "./ProgramItem";
import DependencyExport from "./DependencyExport";
import DataProcessor from "../Excel/DataProcessor";

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
      filter: "attributeValues.attribute.id:eq:"+pgrTypeAttrId,
      filter: "attributeValues.value:eq:HNQIS2",
      fields: ["id", "name", "displayName","programStages"],
    }),
  }
};

// http://localhost:8080/api/programs/ZnEDZVRfsld/metadata.json?skipSharing=true
/*const queryProgramMetadata = {
  results: {
      resource: ({ program }) => 'programs/'+program+'/metadata.json?skipSharing=true'
  }
};*/

const ProgramList = () => {

  // Export Program Metadata //
  const [exportProgramId,setExportProgramId] = useState(undefined)
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
  const [ exportStatus, setExportStatus] = useState("Download");
  const [ showProgramForm, setShowProgramForm ] = useState(false);

  const [competencyClassParam,setCompetencyClassParam] = useState(false);

  const prgTypeQuery = useDataQuery(queryProgramType);
  const prgTypeId = prgTypeQuery.data?.results.attributes[0].id;

  const downloadMetadata = (program) => {
    setExportProgramId(program)
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
          <Button onClick={()=>setShowProgramForm(true)} disabled={showProgramForm}><IconAddCircle24></IconAddCircle24>   Add Program</Button>
          {exportProgramId &&
            <DependencyExport program={exportProgramId} setExportProgramId={setExportProgramId}/>
          }
          {/*
            <Button loading={exportToExcel ? true : false} onClick={() => configuration_download()} disabled={exportToExcel}><img src={download_svg} /> Download Template</Button>
            <Button disabled={true}><img src={upload_svg} /> Import Template</Button>
          */}
        </div>
      </div>
      <div className="wrapper">
        {exportToExcel && <DataProcessor ps="null" isLoading={setExportToExcel} setStatus={setExportStatus}/>}
        <div className="title">List of programs</div>
        <div className="layout_prgms_stages">
          <div className="list-ml_item">
            {
              data.results.programs.map((program) => {
                return <ProgramItem program={program} key={program.id} downloadMetadata={downloadMetadata} deleteProgram={deleteProgram}/>
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
      {showProgramForm && <ProgramNew setShowProgramForm={setShowProgramForm} programsRefetch={refetch}/>}
    </div>
  );
};

export default ProgramList;
