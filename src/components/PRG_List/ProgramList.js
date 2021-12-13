import { useDataQuery } from "@dhis2/app-runtime";
import { Button, Chip, CircularLoader, NoticeBox, Pagination } from "@dhis2/ui";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import download_svg from './../../images/i-download.svg';
import upload_svg from './../../images/i-upload.svg';

// ------------------
import ProgramItem from "./ProgramItem";

const query = {
  results: {
    resource: "programs",
    paging: false,
    params: ({ pageSize, page }) => ({
      pageSize,
      page,
      // filter: "name:ilike:HNQIS",
      fields: ["id", "name", "displayName", "programStages"],
    }),
  },
};

const ProgramList = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { loading, error, data, refetch } = useDataQuery(query, { variables: { pageSize, page: currentPage } });

  if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
  if (loading) return <CircularLoader />
  console.log(data);
  return (
    <div>
      <div className="sub_nav">
        <div className="cnt_p"><Chip>Home</Chip></div>
        <div className="c_srch"></div>
        <div className="c_btns">
          <Button disabled={true}><img src={download_svg} /> Download Template</Button>
          <Button disabled={true}><img src={upload_svg} /> Import Template</Button>
        </div>
      </div>
      <div className="wrapper">
        <div className="title">List of programs</div>
        <div className="layout_prgms_stages">
          <div className="list-ml_item">
            {
              console.log(data.results.pager),
              data.results.programs.map((program) => {
                return <ProgramItem program={program} key={program.id} />
              })
            }
          </div>
        </div>

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
    </div>
  );
};

export default ProgramList;
