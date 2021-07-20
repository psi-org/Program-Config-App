import { useState } from "react";
import Modal from 'react-modal';
import ProgramDetail from "./programDetail";

const ProgramRow = ( { program } ) => {
  const [isOpen, setIsOpen ] = useState( false );

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  }

  return ( <div>
      <div className="divProgram" key={program.id} onClick={openModal}>
        <span>{ program.name }</span> 
        <span className="programNameSpliter">|</span> 
        <span> ( { program.programStages.length } ) program stages</span>
      </div>
      <Modal 
        isOpen={isOpen}
        contentLabel="Minimal Modal Example"
      >
        <button onClick={closeModal}>Close Modal</button>
        <ProgramDetail program={program}></ProgramDetail>
      </Modal>      
    </div>
  );
}
 
export default ProgramRow;