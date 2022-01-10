import React from 'react';
import { useState } from "react";
import {Modal, ModalTitle, ModalContent, ReactFinalForm, InputFieldFF, SwitchFieldFF, SingleSelectFieldFF, hasValue, InputField, ButtonStrip, Button} from "@dhis2/ui";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import styles from './Program.module.css'
import { Program, PS_AssessmentStage, PS_ActionPlanStage, PSS_CriticalSteps, PSS_Scores } from './../../configs/ProgramTemplate'

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

const queryId = {
    results: {
        resource: 'system/id.json',
        params: ({n}) => ({ limit: 5 })
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const METADATA = "haUflNqP85K",
    COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe",
    COMPETENCY_CLASS = "NAaHST5ZDTE",
    BUILD_VERSION = "1.0";

const ProgramNew = (props) =>
{
    // Create Mutation
    let metadataDM= useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate : metadataDM[0],
        loading : metadataDM[1].loading,
        error : metadataDM[1].error,
        data : metadataDM[1].data,
        called: metadataDM[1].called
    };

    const haQuery = useDataQuery(query);
    const haOptions = haQuery.data?.results.optionSets[0].options;

    const idsQuery = useDataQuery(queryId);
    const uidPool = idsQuery.data?.results.codes;
    if (uidPool)
    {
        const programId = uidPool.shift();
        const assessmentId = uidPool.shift();
        const actionPlanId = uidPool.shift();
        const stepsSectionId = uidPool.shift();
        const scoresSectionId = uidPool.shift();
    }

    let optns = [{value: "none", label: "Select Health Area"}];
    if(haOptions)
    {
        optns = optns.concat(haOptions.map(op => {
            return {label: op.name, value: op.code}
        }));
    }

    function hideForm()
    {
        props.setShowProgramForm(false);
    }

    function submission(values)
    {
        if (!metadataRequest.called) {
            let prgrm = Program;
            prgrm.name = values.programName;
            prgrm.shortName = values.shortName;
            prgrm.id = programId;

            createOrUpdateMetaData(prgrm.attributeValues, values);
            prgrm.programStages.push({id: assessmentId});
            prgrm.programStages.push({id: actionPlanId});

            let assessmentStage = PS_AssessmentStage;
            assessmentStage.id = assessmentId;
            assessmentStage.name = values.prefix +'_'+ assessmentStage.name;
            assessmentStage.programStageSections.push({id: stepsSectionId});
            assessmentStage.programStageSections.push({id: scoresSectionId});
            assessmentStage.program.id = programId;

            let actionPlanStage = PS_ActionPlanStage;
            actionPlanStage.id = actionPlanId;
            actionPlanStage.name = values.prefix +'_'+ actionPlanStage.name;
            actionPlanStage.program.id = programId;


            let criticalSteps = PSS_CriticalSteps;
            criticalSteps.id = stepsSectionId;
            criticalSteps.programStage.id = assessmentId;
            criticalSteps.name = criticalSteps.name

            let scores = PSS_Scores;
            scores.id = scoresSectionId;
            scores.name = scores.name;
            scores.programStage.id = assessmentId;

            if (!values.useCompentencyClass) {
                removeCompetencyAttribute(prgrm.programTrackedEntityAttributes);
                removeCompetencyClass(criticalSteps.dataElements);
            }

            let metadata = {
                programs: [prgrm],
                programStages: [assessmentStage, actionPlanStage],
                programStageSections: [criticalSteps, scores]
            }

            metadataRequest.mutate({data: metadata}).then(response => {
                if (response.status != 'OK')
                {
                    console.log("Error encountered");
                    return;
                }
                props.setShowProgramForm(false);
                props.programsRefetch();
            })
        }
    }

    function createOrUpdateMetaData(attributeValues, values)
    {
        let metaDataArray = attributeValues.filter(av=>av.attribute.id === METADATA);
        if (metaDataArray.length > 0)
        {

            let metaData_value = JSON.parse(metaDataArray[0].value);
            metaData_value.buildVersion = BUILD_VERSION;
            metaData_value.useCompetencyClass = values.useCompentencyClass?'Yes':'No';
            metaData_value.dePrefix = values.prefix;
            metaData_value.healthArea = values.healthArea;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        }
        else
        {
            let attr = {id: METADATA};
            let val = {buildVersion: BUILD_VERSION, useCompetencyClass: values.useCompentencyClass, dePrefix: values.prefix, healthArea: values.healthArea};
            let attributeValue = {attribute: attr, value: JSON.stringify(val)}
            attributeValues.push(attributeValue);
        }
    }

    function removeCompetencyAttribute(programTrackedEntityAttributes)
    {
        const index = programTrackedEntityAttributes.findIndex(attr => {
           return attr.trackedEntityAttribute.id === COMPETENCY_ATTRIBUTE
        });
        programTrackedEntityAttributes.splice(index, 1);
    }

    function removeCompetencyClass(dataElements)
    {
        const index = dataElements.findIndex(de => {
            return de.id === COMPETENCY_CLASS;
        })
        dataElements.splice(index,1);
    }

    return <>
            <Modal onClose={() => hideForm()} position="middle">
                <ModalTitle>Create New Program</ModalTitle>
                <ModalContent>
                    <Form onSubmit={submission}>
                        {({handleSubmit}) => (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.row}>
                                    <Field
                                        required
                                        name="prefix"
                                        label="DE Prefix"
                                        component={InputFieldFF}
                                    />
                                </div>
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
        </>
}

export default ProgramNew;