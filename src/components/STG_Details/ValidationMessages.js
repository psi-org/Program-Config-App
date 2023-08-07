import { ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import Messages from "./Messages";


const ValidationMessages = (props) => {
    return <Modal>
        <ModalTitle>Validation Messages</ModalTitle>
        <ModalContent>
            {props.dataElements.map((dataElement, k) => dataElement.errors && dataElement.errors.errors?.length > 0 &&
                <Messages
                    key={k}
                    title={dataElement.errors.title}
                    error={true}
                    messages={dataElement.errors.errors}
                />
            )}
        </ModalContent>
        <ModalActions>
            <ButtonStrip right>
                <Button destructive onClick={() => props.showValidationMessage(false)}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
}

export default ValidationMessages;