import { ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, Button } from "@dhis2/ui";
import PropTypes from 'prop-types';
import React from 'react';
import Messages from "./Messages.js";


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
            <p><strong>Please Note:</strong> Row numbers do NOT include blank or unstructured rows.</p>
        </ModalContent>
        <ModalActions>
            <ButtonStrip right>
                <Button destructive onClick={() => props.showValidationMessage(false)}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
}

ValidationMessages.propTypes = {
    objects: PropTypes.array,
    showValidationMessage: PropTypes.func
}

export default ValidationMessages;