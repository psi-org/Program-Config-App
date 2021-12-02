import { useDataQuery } from "@dhis2/app-runtime";
import { Chip, CircularLoader, NoticeBox} from "@dhis2/ui";
import { Link } from "react-router-dom";

// ------------------
import ProgramItem from "./ProgramItem";

const query = {
  results: {
    resource: "programs",
    paging: false,
    params: {
      // filter: "name:ilike:HNQIS",
      fields: ["id", "name", "displayName","programStages"],
    },
  },
};

const ProgramList = () => {
  const { loading, error, data } = useDataQuery(query);

  if (error) return <NoticeBox title="Error retrieving programs list"> <span>{JSON.stringify(error)}</span> </NoticeBox>
  if (loading) return <CircularLoader />

  return (
    <div className="wrapper">
      <div>
          <Link to={'/'}><Chip>Home</Chip></Link>
      </div>
      <div className="layout_prgms_stages">
        <div className="list-ml_item">
          {
            data.results.programs.map((program) => {
              return <ProgramItem program={program} key={program.id}/>
            })
          }
        </div>
      </div>
    </div>
  );
};

export default ProgramList;
