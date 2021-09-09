import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";

import {Button, DataTable, DataTableBody, DataTableHead, NoticeBox, CircularLoader, DataTableRow, DataTableCell} from "@dhis2/ui";
import { Link } from "react-router-dom";

const ProgramStage = () => {

    const programStage = useSelector(state => state.programStage);

    if(!programStage){
        return (
        <NoticeBox title="Missing Program Stage ID" error>
            No program stage ID was given, please try again! <Link to="/program">Go to program stages</Link>
        </NoticeBox>
        )
    }

    const query = {
        results: {
            resource: 'programStages',
            id: programStage,
            params: {
                fields: ['id','displayName','formType','programStageSections[id,displayName,dataElements[id,displayName,formName]]','programStageDataElements[dataElement[id,displayName,formName]]']
            }
        }
    };

    const { loading, error, data } = useDataQuery(query);

    if (error) {
        return (
            <NoticeBox title="Error retrieving program stage details" error>
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }

    if (loading) { return <span><CircularLoader /></span> }

    if(data.results.formType=="SECTION"){
        return (
            <DataTable layout="fixed" width="100%" scrollWidth="500px" scrollHeight="400px">
                <DataTableBody>
                    {data.results.programStageSections.map(pss => {
                        return (
                            [
                            <DataTableRow>
                                <DataTableCell colSpan="2" tag="th" muted>{pss.displayName}</DataTableCell>
                            </DataTableRow>,
                            pss.dataElements.map(de => {
                                return (
                                    <DataTableRow draggable>
                                        <DataTableCell>{de.formName}</DataTableCell>
                                    </DataTableRow>
                                )
                            })
                            ]
                        )
                    })}
                </DataTableBody>
            </DataTable>
        )
    }else if(data.results.formType=="DEFAULT"){
        return ([
            <NoticeBox title="DEFAULT Form" warning>
                The program stage: <em>{data.results.displayName}</em> uses a <strong>DEFAULT</strong> form type. Listing Data Elements in their current order.
            </NoticeBox>,
            <br/>,
            <DataTable>
                <DataTableBody>
                    {data.results.programStageDataElements.map(psde => {
                        return (
                            <DataTableRow>
                                <DataTableCell>{psde.dataElement.formName}</DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </DataTableBody>
            </DataTable>
        ])
    }else{
        return (
            <NoticeBox title="Form Type not supported in this app" error>
                <span>CUSTOM Forms are not supported</span>
            </NoticeBox>
        )
    }


}

export default ProgramStage;