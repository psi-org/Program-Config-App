import ProgramList from "./ProgramList";
import useFetch from "./useFetch";

const Home = () => {

  // 'json-server' - https://www.npmjs.com/package/json-server

  const url_programList = 'http://localhost:4000/programs';
  const { data: programs, isPending, error } = useFetch( url_programList );

  return (
    <div className="home">
      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { programs && <ProgramList programs={programs} /> }
    </div>
  );
}
 
export default Home;