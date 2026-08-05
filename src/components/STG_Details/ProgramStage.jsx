import { useDataQuery } from '@dhis2/app-runtime';
import { NoticeBox, CircularLoader } from '@dhis2/ui';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useLocation } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import actionCreators from '../../state/action-creators/index.js';
import {
  DeepCopy,
  getAttributeValue,
  getProgramStagesQuery,
  isHnqisPCAType,
} from '../../utils/Utils.jsx';
// eslint-disable-next-line import/extensions
import StageSections from './StageSections';
import { PCA_PROGRAM_TYPE_ATTRIBUTE } from '../../configs/Constants.jsx';

const query = {
  results: {
    resource: 'programStages',
    id: ({ programStage }) => programStage,
    params: {
      fields: getProgramStagesQuery(true),
    },
  },
};

const ProgramStage = () => {
  const h2Ready = localStorage.getItem('h2Ready') === 'true';

  const { id } = useParams();
  const { key: locationKey } = useLocation();

  if (id && id.length == 11) {
    const dispatch = useDispatch();
    const { setProgramStage } = bindActionCreators(actionCreators, dispatch);
    setProgramStage(id);
  }

  const programStage = useSelector((state) => state.programStage);
  const { error, data, refetch } = useDataQuery(query, {
    lazy: true,
    variables: { programStage },
  });

  const [fetchToken, setFetchToken] = useState(0);

  useEffect(() => {
    refetch().finally(() => setFetchToken((t) => t + 1));
  }, [locationKey]); // Re-fetch on every navigation to this route

  if (!id && !programStage) {
    return (
      <NoticeBox title="Missing Program Stage ID" error>
        No program stage ID was provided, please try again!{' '}
        <Link to="/program">Go to program stages</Link>
      </NoticeBox>
    );
  }

  if (error) {
    return (
      <NoticeBox title="Error retrieving program stage details" error>
        <span>{JSON.stringify(error)}</span>
      </NoticeBox>
    );
  }

  if (data) {
    const hnqisMode = !!isHnqisPCAType(
      getAttributeValue(
        data.results?.program?.attributeValues,
        PCA_PROGRAM_TYPE_ATTRIBUTE
      )
    );

    const readOnly = !!data.results?.program?.attributeValues?.find(
      (av) => av.value === 'HNQIS'
    );

    if (hnqisMode && !h2Ready) {
      return (
        <div style={{ margin: '2em' }}>
          <NoticeBox
            title="HNQIS Framework Metadata is missing or out of date"
            error
          >
            <span>
              First go to the <Link to="/">Home Screen</Link> and Install the
              latest HNQIS Framework Metadata to continue.
            </span>
          </NoticeBox>
        </div>
      );
    }

    const programStageData = DeepCopy({ ...data.results });

    return (
      <StageSections
        key={`${programStageData.id}-${fetchToken}`}
        programStage={programStageData}
        stageRefetch={refetch}
        hnqisMode={hnqisMode}
        readOnly={
          readOnly ||
          (hnqisMode && programStageData.name.includes('Action Plan'))
        }
      />
    );
  }

  return (
    <span>
      <CircularLoader />
    </span>
  );
};

export default ProgramStage;
