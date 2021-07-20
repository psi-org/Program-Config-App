import { useState, useEffect } from "react";
import ProgramList from "./ProgramList";
import useFetch from "./useFetch";

const Home = () => {

  const { data: programs, isPending, error } = useFetch( 'http://localhost:4000/programs' );

  return (
    <div className="home">
      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { programs && <ProgramList programs={programs} /> }
    </div>
  );
}
 
export default Home;