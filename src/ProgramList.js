import { useState } from "react";
import ProgramRow from "./programRow";

const ProgramList = ( { programs, title } ) => {

  return ( 
    <div className="divProgramList">
      { programs.map( (program) => (
        <ProgramRow program={program}></ProgramRow>
      )) }
    </div>
   );
}
 
export default ProgramList;