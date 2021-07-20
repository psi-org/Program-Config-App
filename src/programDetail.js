
const ProgramDetail = ( { program } ) => {
  return ( <div className="divProgramDetail">
    <div className="fontBold">NAME: {program.name}</div>
    <div>{JSON.stringify( program)}</div>
  </div> );
}
 
export default ProgramDetail;