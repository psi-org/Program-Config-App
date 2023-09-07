import { useDataQuery } from "@dhis2/app-runtime";
import { NoticeBox, CircularLoader } from "@dhis2/ui";
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";
import { DeepCopy } from "../../utils/Utils.js"
import StageSections from "./StageSections.js";

const query = {
    results: {
        resource: 'programStages',
        id: ({ programStage }) => programStage,
        params: {
            fields: [
                'id', 'name', 'allowGenerateNextVisit', 'publicAccess', 'reportDateToUse', 'formType', 'generatedByEnrollmentDate', 'displayFormName', 'sortOrder', 'hideDueDate', 'enableUserAssignment', 'minDaysFromStart', 'favorite', 'executionDateLabel', 'preGenerateUID', 'displayName', 'externalAccess', 'openAfterEnrollment', 'repeatable', 'remindCompleted', 'displayGenerateEventBox', 'validationStrategy', 'autoGenerateEvent', 'blockEntryForm', 'program[id,name,shortName,attributeValues,withoutRegistration]', 'style', 'access', 'user', 'translations', 'userGroupAccesses', 'attributeValues', 'userAccesses', 'favorites', 'notificationTemplates',
                'programStageDataElements[id,name,compulsory,displayInReports,programStage,dataElement[id,name,shortName,style,code,description,sharing,domainType,formName,valueType,aggregationType,optionSetValue,optionSet[id,name],legendSet[id,name],legendSets,attributeValues,displayName],sortOrder,style,categoryCombo]',
                'programStageSections[id,name,displayName,sortOrder,dataElements[id,name,shortName,style,code,description,sharing,domainType,formName,valueType,aggregationType,optionSetValue,optionSet[id,name],legendSet[id,name],legendSets,attributeValues,displayName]]'
            ]
        }
    }
};

const ProgramStage = () => {

    const h2Ready = localStorage.getItem('h2Ready') === 'true'

    const { id } = useParams();

    if (id && id.length == 11) {
        const dispatch = useDispatch();
        const { setProgramStage } = bindActionCreators(actionCreators, dispatch);
        setProgramStage(id);
    }

    const programStage = useSelector(state => state.programStage);
    const { error, data, refetch } = useDataQuery(query, { lazy: true, variables: { programStage } });

    useEffect(() => {
        refetch()
    }, [])

    if (!id && !programStage) {
        return (
            <NoticeBox title="Missing Program Stage ID" error>
                No program stage ID was provided, please try again! <Link to="/program">Go to program stages</Link>
            </NoticeBox>
        )
    }

    if (error) {
        return (
            <NoticeBox title="Error retrieving program stage details" error>
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }

    if (data) {
        const hnqisMode = !!data.results.program.attributeValues.find(av => av.value === "HNQIS2")
        const readOnly = !!data.results.program.attributeValues.find(av => av.value === "HNQIS")

        if (hnqisMode && !h2Ready) {
            return (
                <div style={{ margin: '2em' }}>
                    <NoticeBox title="HNQIS 2.0 Metadata is missing or out of date" error>
                        <span>First go to the <Link to="/">Home Screen</Link> and Install the latest HNQIS 2.0 Metadata to continue.</span>
                    </NoticeBox>
                </div>
            )
        }

        const programStageData = DeepCopy({ ...data.results })

        return <StageSections programStage={programStageData} stageRefetch={refetch} hnqisMode={hnqisMode} readOnly={readOnly || (hnqisMode && programStageData.name.includes('Action Plan'))} />
    }

    return <span><CircularLoader /></span>


}

export default ProgramStage;