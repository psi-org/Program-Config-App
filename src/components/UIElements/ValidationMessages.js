import { ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import Messages from "./Messages";


const ValidationMessages = (props) => {
    return <Modal>
        <ModalTitle>Validation Messages</ModalTitle>
        <ModalContent>
            {props.objects.map((object, k) => object.errors && object.errors.errors?.length > 0 &&
                <Messages
                    key={k}
                    title={object.errors.title}
                    error={true}
                    messages={object.errors.errors}
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