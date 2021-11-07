import ImportForm from "./ImportForm";
import { useState } from "react";

const Importer = (props) => {

    const { file, setFile } = useState(null);
    const { validationErrors, setValidationErrors}= useState(null);

    const selectedFile = (e) => {
        console.log("File: ", e);
        setFile(e.target.files[0]);
    }

    const startImport = () =>
    {
        console.log("Testing");
        console.log("importfile: ", importFile);
        if(importFile !== null)
        {
            
        }
        else
        {
            setValidationMessage(["Please select the file"]);
        }

    }

    return <ImportForm showForm={props.displayForm} file={file} import={startImport} selectedFile={selectedFile}/>
}

export default Importer;