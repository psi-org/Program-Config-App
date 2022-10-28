import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { DeepCopy } from '../../configs/Utils';

const sharingQuery = {
    results: {
        resource: 'sharing',
        params: ({ element, id }) => ({
            id,
            type: element
        }),
    }
}
/**
 * @deprecated
 */
const VisualizationSharing = ({id, sharing}) => {
    const metadataMutation = {
        resource: `sharing?type=visualization&id=${id}`,
        type: 'update',
        data: ({data}) => data
    };
    const {loading, data} = useDataQuery(sharingQuery, { variables: {element: 'visualization', id: id}});
    let metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            console.error(err)
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };
    const dePermission = (permission) => {
        return permission.substring(0,2)+'------';
    }
    let payload;
    if(!loading)
    {
        payload = DeepCopy(data.results);
        payload.object.publicAccess = dePermission(sharing.object.publicAccess);
        payload.object.userAccesses = [];
        payload.object.userGroupAccesses = [];
        sharing.object.userAccesses.forEach((user) => {
            payload.object.userAccesses.push({id: user.id, access: dePermission(user.access)})
        });
        sharing.object.userGroupAccesses.forEach((userGroup) => {
            payload.object.userGroupAccesses.push({id: userGroup.id, access: dePermission(userGroup.access)})
        });
        if(!metadataRequest.called) {
            metadataRequest.mutate({data: payload }).then(response => {
                if(response?.status === "OK")
                    console.log("Visualization Updated successfully")
                else
                    console.log("Error Saving Visualization")
            });
        }
    }

    return null;
}

export default VisualizationSharing;