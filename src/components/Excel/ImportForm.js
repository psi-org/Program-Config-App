import { ButtonStrip, FileInput, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";

const ImportForm = (props) =>{

    function handleChange(files)
    {
        props.setFile(files[0])
    }
    
    function hideForm() {
        props.showForm(false);
    }

    return  <Modal small>
                <ModalTitle>Select Configuration File</ModalTitle>
                <ModalContent>
                    <input type="file" onChange={ (e) => handleChange(e.target.files) } />
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