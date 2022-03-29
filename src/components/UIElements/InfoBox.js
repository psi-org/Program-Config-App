import { useState } from "react"

import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import {Modal, ModalTitle, ModalContent, Button, ButtonStrip} from "@dhis2/ui";
import styles from './../PRG_List/Program.module.css'

const InfoBox = (props) => {

    const [showModal, setShowModal] = useState(false)

    return <div style={{display: 'flex', alignItems: 'center', margin: (props.margin || '0 1.5em 0 0'), alignItems: (props.alignment || 'center')}}>
        <div onClick={()=>setShowModal(true)} style={{cursor: 'pointer', color: '#909090', display: 'flex'}}>
            <HelpIcon/>
        </div>
        {showModal &&
            <Modal position="middle" onClose={()=>setShowModal(false)}>
                <ModalTitle>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <InfoIcon style={{marginRight: '0.25em'}}/>{props.title}
                    </div>
                </ModalTitle>
                <ModalContent>
                    <div className={styles.row}>
                        {props.message}
                    </div>
                    <div className={styles.row}>
                        <ButtonStrip end>
                            <Button primary onClick={()=>setShowModal(false)}>Close</Button>
                        </ButtonStrip>
                    </div>
                </ModalContent>
            </Modal>
        }
    </div>
}

export default InfoBox;