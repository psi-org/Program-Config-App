// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";

import {NoticeBox, CircularLoader} from "@dhis2/ui";
import { Link, useParams } from "react-router-dom";
import StageSections from "./StageSections";
import { ajax } from "jquery";

const query = {
    results: {
        resource: 'programStages',
        id: ({programStage}) => programStage,
        params: {
            fields:[
                'id','name','allowGenerateNextVisit','publicAccess','reportDateToUse','formType','generatedByEnrollmentDate','displayFormName','sortOrder','hideDueDate','enableUserAssignment','minDaysFromStart','favorite','executionDateLabel','preGenerateUID','displayName','externalAccess','openAfterEnrollment','repeatable','remindCompleted','displayGenerateEventBox','validationStrategy','autoGenerateEvent','blockEntryForm','program[id,name,shortName,attributeValues]','style','access','user','translations','userGroupAccesses','attributeValues','userAccesses','favorites','notificationTemplates',
                'programStageDataElements[id,name,compulsory,programStage,dataElement[id,name,shortName,code,domainType,formName,valueType,aggregationType,optionSetValue,optionSet[id,name],legendSet[id,name],attributeValues,displayName],sortOrder]',
                'programStageSections[id,name,displayName,sortOrder,dataElements[id,name,shortName,code,domainType,formName,valueType,aggregationType,optionSetValue,optionSet[id,name],legendSet[id,name],attributeValues,displayName]]',
            ]
        }
    }
};

const ProgramStage = () => {

    const {id} = useParams();

    if(id && id.length==11){
        const dispatch = useDispatch();
        const { setProgramStage } = bindActionCreators(actionCreators, dispatch);
        setProgramStage(id);
    }
    
    const programStage = useSelector(state => state.programStage);

    if(!programStage){
        return (
            <NoticeBox title="Missing Program Stage ID" error>
                No program stage ID was given, please try again! <Link to="/program">Go to program stages</Link>
            </NoticeBox>
        )
    }

    const { loading, error, data, refetch } = useDataQuery(query, {variables : {programStage}});

    if (error) {
        return (
            <NoticeBox title="Error retrieving program stage details" error>
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }

    if (loading) {
        return <span><CircularLoader /></span> 
    }

    return <StageSections programStage={data.results} stageRefetch={refetch}/>
    
}

export default ProgramStage;