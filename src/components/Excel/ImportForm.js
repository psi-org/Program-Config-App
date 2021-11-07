import { ButtonStrip, FileInput, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import SelectedFile from "./SelectedFile";

const ImportForm = (props) =>{

    function selectedFile(e) 
    {
        console.log("Import Form: ", e);
    }

    const handleChange = (e) => 
    {
        // e.preventDefault();
        let file = e.target.files[0];
        console.log("file: ", file);
    }

    function hideForm() {
        props.showForm(false);
    }

    return  <Modal small>
                <ModalTitle>Select Configuration File</ModalTitle>
                <ModalContent>
                    <FileInput buttonLabel="Browse a File" name="import" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleChange}>
                    </FileInput>
                    {/* {props.file && <SelectedFile fileName={props.file}/>} */}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip middle>
                        <Button primary onClick={() => props.import()}>Import</Button>
                        <Button warning onClick={hideForm}>Cancel</Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>

}

export default ImportForm;