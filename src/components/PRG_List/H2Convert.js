import { useDataQuery } from "@dhis2/app-runtime";

import { CircularLoader } from "@dhis2/ui";
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'

import AltRouteIcon from '@mui/icons-material/AltRoute';

import { useState } from "react";

const queryProgramMetadata = {
  results: {
    resource: 'programs',
    params: ({ program }) => ({
      fields: ['id','name','shortName','organisationUnits','sharing','programStages[programStageDataElements[dataElement[id],compulsory,displayInReports,sortOrder],programStageSections[name,dataElements[*,attributeValues[value,attribute[id,name]]]]]'],
      filter: [`id:eq:${program}`]
    })
  }
};

const H2Convert = ({ program, setConversionH2ProgramId, setNotification }) => {


  const { data: programData } = useDataQuery(queryProgramMetadata, { variables: { program } });

  const hideForm = () => {
    setConversionH2ProgramId(undefined)
  }

  return (
    <>
      <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
          Convert {programData?.results?.programs[0].name} to HNQIS 2.0
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
          <Button onClick={() => hideForm()} color="error" > Cancel </Button>
          {true &&
            <Button onClick={() => { }} variant='outlined' disabled={false} startIcon={<AltRouteIcon />}> Start Conversion </Button>
          }
        </DialogActions>

      </CustomMUIDialog>
    </>
  );
}

export default H2Convert;