import ProgramList from "./ProgramList";
import useFetch from "./useFetch";
import { useSelector, useDispatch } from 'react-redux'

const Home = () => {

  const url_programList = 'http://localhost:4000/programs'; // 'json-server' - https://www.npmjs.com/package/json-server
  const { data: programs, isPending, error } = useFetch( url_programList );

  const propVal = useSelector( state => state.value );
  const dispatch = useDispatch();

  return (
    <div className="home">

      <div className="fontBold">StateVal: {propVal}</div>
      <button onClick={() => dispatch({ type: 'valInc' })} >ValInc</button>

      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { programs && <ProgramList programs={programs} /> }
    </div>
  );
}

export default Home;