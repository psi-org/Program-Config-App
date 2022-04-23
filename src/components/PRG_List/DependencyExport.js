import { useDataQuery } from "@dhis2/app-runtime";

//UI Elements
import { CircularLoader } from "@dhis2/ui";
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'


// *** Routing ***
import { useState } from "react";

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const queryLegends = {
  results: {
    resource: 'legendSets',
    paging: false,
    params: {
      fields: ['name', 'id', 'attributeValues', 'legends', 'translations']
    }
  }
};

const DependencyExport = ({ program, setExportProgramId }) => {

  const queryProgramMetadata = {
    results: {
      resource: 'programs/' + program + '/metadata.json?skipSharing=true'
    }
  };

  const legendsQuery = useDataQuery(queryLegends);
  const legends = legendsQuery.data?.results.legendSets;

  const prgExportQuery = useDataQuery(queryProgramMetadata);
  const exportError = prgExportQuery.error?.stack;
  const programMetadata = prgExportQuery.data?.results;

  const [documentReady, setDocumentReady] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [cleanMetadata, setCleanMetadata] = useState(undefined)

  const hideForm = () => {
    setDocumentReady(false)
    setExportProgramId(undefined)
  }

  if (programMetadata && !documentReady) {
    delete programMetadata.date;
    delete programMetadata.categories;
    delete programMetadata.categoryCombos;
    delete programMetadata.categoryOptions;
    delete programMetadata.categoryOptionCombos;

    programMetadata.programs?.forEach(program => {

      program.organisationUnits = []

      delete program.created;
      delete program.lastUpdated;
      delete program.lastUpdatedBy;
      delete program.categoryCombo;

      program.programTrackedEntityAttributes?.forEach(tea => {
        delete tea.created;
        delete tea.lastUpdated;
        delete tea.access;
      });

    });

    programMetadata.programRuleVariables?.forEach(prv => {
      delete prv.created;
      delete prv.lastUpdated;
      delete prv.lastUpdatedBy;
    });

    programMetadata.programStageSections?.forEach(stageSection => {
      delete stageSection.created;
      delete stageSection.lastUpdated;
      delete stageSection.lastUpdatedBy;
    });

    programMetadata.programStages?.forEach(stage => {

      delete stage.created;
      delete stage.lastUpdated;
      delete stage.lastUpdatedBy;

      stage.programStageDataElements?.forEach(psde => {
        delete psde.created;
        delete psde.lastUpdated;
        delete psde.access;
      });

    });

    programMetadata.options?.forEach(option => {
      delete option.created;
      delete option.lastUpdated;
    });

    programMetadata.attributes?.forEach(att => {
      delete att.created;
      delete att.lastUpdated;
      delete att.lastUpdatedBy;
    });

    programMetadata.programTrackedEntityAttributes?.forEach(ptea => {
      delete ptea.created;
      delete ptea.lastUpdated;
    });

    programMetadata.programRules?.forEach(pr => {
      delete pr.created;
      delete pr.lastUpdated;
      delete pr.lastUpdatedBy;
    });

    programMetadata.dataElements?.forEach(de => {
      delete de.created;
      delete de.lastUpdated;
      delete de.lastUpdatedBy;
      delete de.categoryCombo;
    });

    programMetadata.trackedEntityTypes?.forEach(tet => {

      delete tet.created;
      delete tet.lastUpdated;
      delete tet.lastUpdatedBy;

      tet.trackedEntityTypeAttributes?.forEach(tea => {
        delete tea.created;
        delete tea.lastUpdated;
        delete tea.access;
      });

    });

    programMetadata.trackedEntityAttributes?.forEach(tea => {
      delete tea.created;
      delete tea.lastUpdated;
      delete tea.lastUpdatedBy;
    });

    programMetadata.programStageDataElements?.forEach(psde => {
      delete psde.created;
      delete psde.lastUpdated;
    });

    programMetadata.programRuleActions?.forEach(pra => {
      delete pra.created;
      delete pra.lastUpdated;
      delete pra.lastUpdatedBy;
    });

    programMetadata.optionSets?.forEach(optionSet => {
      delete optionSet.created;
      delete optionSet.lastUpdated;
      delete optionSet.lastUpdatedBy;
    });

    setCleanMetadata(programMetadata)
    if (!documentReady) setDocumentReady(true);
  }

  const downloadFile = () => {
    //https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react
    let metadata = cleanMetadata;

    let legendSets = []

    legends.forEach(legend => {
      if (metadata.dataElements.find(de => de.legendSets?.find(l => l.id == legend.id))) {
        legend.legends?.forEach(l => {
          delete l.created;
          delete l.lastUpdated;
          delete l.access;
        })
        legendSets.push(legend)
      }
    })

    metadata.legendSets = legendSets

    metadata.optionSets.push({
      "name": "DB - Program Type",
      "id": "TOcCuCN2CLm",
      "version": 7,
      "valueType": "TEXT",
      "attributeValues": [],
      "translations": [],
      "options": [
        { "id": "Ip3IqzzqgLN" },
        { "id": "Jz4YKD15lnK" },
        { "id": "QR0HHcQri91" },
        { "id": "v9XPATv6G3N" }
      ]
    });

    let prgTypeOptions = [
      {
        "code": "HNQIS",
        "name": "HNQIS",
        "id": "Ip3IqzzqgLN",
        "sortOrder": 1,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
      },
      {
        "code": "HNQIS2",
        "name": "HNQIS 2.0",
        "id": "Jz4YKD15lnK",
        "sortOrder": 2,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
      },
      {
        "code": "RDQA",
        "name": "RDQA",
        "id": "QR0HHcQri91",
        "sortOrder": 3,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
      },
      {
        "code": "EDS",
        "name": "EDS",
        "id": "v9XPATv6G3N",
        "sortOrder": 4,
        "optionSet": { "id": "TOcCuCN2CLm" },
        "translations": []
      }
    ];

    metadata.options = metadata.options.concat(prgTypeOptions);

    setDownloading(true);

    const blob = new Blob([JSON.stringify(metadata)], { type: 'text/json' });
    const a = document.createElement('a');
    a.download = (metadata.programs[0].name) + '.json';
    a.href = window.URL.createObjectURL(blob);

    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    a.dispatchEvent(clickEvt);
    a.remove();

    setDownloading(false);
    hideForm();
  }

  return (
    <>
      <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
          Download Metadata With Dependencies
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
          {!documentReady && !exportError &&
            <div style={{display: 'flex', alignItems: 'center'}}><CircularLoader small /><p>Exporting metadata and creating file...</p></div>
          }

          {exportError &&
            <div style={{ lineHeight: '1.5em' }}>
              <p style={{color: '#AA0000'}}><strong>Something went wrong!</strong></p>
              <p>{exportError}</p>
            </div>
          }

          {documentReady && cleanMetadata && legends && !exportError &&
            <div style={{ lineHeight: '1.5em' }}>
              <p><strong>Your file is ready!</strong></p>
              <p>You can now download the metadata related to the program by clicking "Download Now".</p>
              <p><strong>Program:</strong> <em>{programMetadata.programs[0].name}</em></p>
              <hr style={{ margin: '8px 0' }} />
              <p>Please consider that all of the metadata is downloaded without any sharing settings. Remember to assign sharings once you import the metadata and assign Org Units to the program.</p>
            </div>
          }
        </DialogContent>
        
        <DialogActions style={{ padding: '1em' }}>
            <Button onClick={() => hideForm()} color="error" > Close </Button>
            {documentReady && cleanMetadata && legends &&
              <Button onClick={() => downloadFile()} variant='outlined' disabled={downloading} startIcon={<FileDownloadIcon />}> Download Now </Button>
            }
        </DialogActions>
        
      </CustomMUIDialog>
    </>
  );
}

export default DependencyExport;