import React from 'react';
import { useState } from "react";
import {Modal, ModalTitle, ModalContent, ReactFinalForm, InputFieldFF, SwitchFieldFF, SingleSelectFieldFF, hasValue, InputField, ButtonStrip, Button} from "@dhis2/ui";
import { useDataQuery } from '@dhis2/app-runtime'
import { ProgramTemplate } from './../../configs/ProgramTemplate'
import styles from './Program.module.css'

const { Form, Field } = ReactFinalForm

const query = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['options[code,name]'],
            filter: ['id:eq:y752HEwvCGi']
        }
    }
};

const ProgramNew = (props) =>
{
    let optns = [{value: "none", label: "Select Health Area"}];
    const {loading, error, data, refetch } = useDataQuery(query);

    if(!loading) {
        data.results.optionSets[0].options.forEach((dt) => {
            optns.push({label: dt.name, value: dt.code});
        })
    }

    function hideForm()
    {
        props.setShowProgramForm(false);
    }

    function submission(values)
    {
        let prgrm = ProgramTemplate.programs;
        prgrm[0].name = values.programName;
        prgrm[0].shortName = values.shortName
        console.log("Program: ", prgrm);
    }

    return  <Modal onClose={() => hideForm()} position="middle">
                <ModalTitle>Create New Program</ModalTitle>
                <ModalContent>
                    <Form onSubmit={submission}>
                        {({handleSubmit}) => (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.row}>
                                    <Field
                                        required
                                        name="programName"
                                        label="Name"
                                        component={InputFieldFF}
                                        validate={hasValue}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <Field
                                    required
                                    name="shortName"
                                    label="Short Name"
                                    component={InputFieldFF}
                                    validate={hasValue}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <Field
                                    type="checkbox"
                                    name="useCompentencyClass"
                                    label="Use Competency Class"
                                    component={SwitchFieldFF}
                                    initialValue={false}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <Field
                                    name="prefix"
                                    label="DE Prefix"
                                    component={InputFieldFF}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <Field
                                    name="healthArea"
                                    label="Health Area"
                                    component={SingleSelectFieldFF}
                                    initialValue="none"
                                    options={optns}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <ButtonStrip end>
                                    <Button type="submit" primary> Submit </Button>
                                    <Button onClick={()=>hideForm()} destructive> Close </Button>
                                    </ButtonStrip>
                                </div>
                            </form>
                        )}
                    </Form>
                </ModalContent>
            </Modal>
}

export default ProgramNew;