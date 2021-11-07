import { Button, ButtonStrip, AlertBar, AlertStack, ComponentCover, CenteredContent, CircularLoader, Card, Modal, ModalTitle, ModalContent, ModalActions, LinearLoader } from "@dhis2/ui";

const Form = ({props}) => {
    return (
        <div className='modal'>
            <p>Please Select File to upload</p>
            <input type="file" name="configuration_file"/>
            <Button primary></Button>
        </div>
    );
};

export default Form;