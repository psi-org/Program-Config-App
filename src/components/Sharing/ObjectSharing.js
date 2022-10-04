import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { DeepCopy } from '../../configs/Utils';
import {useEffect} from "react";

const sharingQuery = {
    results: {
        resource: 'sharing',
        params: ({ element, id }) => ({
            id,
            type: element
        }),
    }
}

const ObjectSharing = ({element, id, sharing}) => {
    console.log("ObjectSharing: ", element, " ", id, " sharing: ", sharing);
    const metadataMutation = {
        resource: `sharing?type=${element}&id=${id}`,
        type: 'update',
        data: ({ data }) => data
    }

    const {loading, data} = useDataQuery(sharingQuery, { variables: {element: element, id: id}});
    let metadataDM = useDataMutation(metadataMutation);
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
    useEffect(() => {
        if(data?.results) {
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
            if (!metadataRequest.called) {
                metadataRequest.mutate({data: payload}).then(response => {
                    if (response?.status === "OK")
                        console.log(`${element.toUpperCase()} Updated successfully`)
                    else
                        console.log(`Error while saving - ${element}`)
                });
            }
        }
    },[data]);

    return null;
}

export default ObjectSharing;