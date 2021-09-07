import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import {DataTable,TableHead,DataTableRow,DataTableColumnHeader,TableBody,DataTableCell} from '@dhis2/ui';

const ProgramDetails = () => {

    const program = useSelector(state => state.program);
    console.log(program);
    const query = {
        results: {
            resource: 'programs',
            id: program,
            params: {
                fields: ['*']
            }
        },
    };

    if(!program) return <Redirect to="/"/>
    
    const { loading, error, data } = useDataQuery(query);
    
    if (error) { return <span>ERROR</span> }
    if (loading) { return <span>...</span> }

    return (
        <DataTable>
            <TableHead>
                <DataTableRow>
                    <DataTableColumnHeader>Property</DataTableColumnHeader>
                    <DataTableColumnHeader>Value</DataTableColumnHeader>
                </DataTableRow>
            </TableHead>
            <TableBody>
                <DataTableRow>
                    <DataTableCell>UID</DataTableCell>
                    <DataTableCell>{data.results.id}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                    <DataTableCell>Name</DataTableCell>
                    <DataTableCell>{data.results.displayName}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                    <DataTableCell>Program Type</DataTableCell>
                    <DataTableCell>{data.results.programType}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                    <DataTableCell>Last Updated</DataTableCell>
                    <DataTableCell>{data.results.lastUpdated}</DataTableCell>
                </DataTableRow>
            </TableBody>
        </DataTable>
    );
}

export default ProgramDetails;

