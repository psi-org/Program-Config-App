import { ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import Messages from "./Messages";


const ValidationMessages = (props) => {
    return  <Modal>
                <ModalTitle>Validation Messages</ModalTitle>
                <ModalContent>
                    {props.dataElements.map(dataElement => dataElement.errors && dataElement.errors.length > 0 &&
                        <Messages title = {dataElement.formName} code={dataElement.code} error = "true" messages={dataElement.errors}/>
                    )}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip right>
                        <Button destructive onClick={()=>props.showValidationMessage(false)}>Close</Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
}

export default ValidationMessages;