import React from 'react';
import { useDataQuery } from '@dhis2/app-service-data';
const myQuery = {
  results: {
    resource: 'optionSets',
    params: {
      fields: ['id', 'name', 'options[name]']
    }
  }
};
export default function fetchOptionSets() {
  const {
    loading,
    error,
    data
  } = useDataQuery(myQuery);
  return data.results;
}