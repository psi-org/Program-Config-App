import { useDataQuery } from "@dhis2/app-runtime";

//UI Elements
import { Modal, ModalTitle, ModalContent, CircularLoader, Button, ButtonStrip } from "@dhis2/ui";

// *** Routing ***
import { Link } from "react-router-dom";
import { useState } from "react";

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const DependencyExport = ({ program, setExportProgramId }) => {

  const queryProgramMetadata = {
    results: {
      resource: 'programs/' + program + '/metadata.json?skipSharing=true'
    }
  };

  const prgExportQuery = useDataQuery(queryProgramMetadata);
  const programMetadata = prgExportQuery.data?.results;

  const [documentReady,setDocumentReady] = useState(false)
  const [downloading,setDownloading] = useState(false)

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

    console.log(JSON.stringify(programMetadata))
    if(!documentReady) setDocumentReady(true);
  }

  const downloadFile = (metadata)=> {
    //https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react
    setDownloading(true)
    const blob = new Blob([JSON.stringify(metadata)], { type: 'text/json' })
    const a = document.createElement('a')
    a.download = (metadata.programs[0].name)+'.json'
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
    setDownloading(false)
  }

  return (
    <>
      <Modal position="middle">
        <ModalTitle>Download Metadata With Dependencies</ModalTitle>
        <ModalContent>
          {!documentReady &&
            <div><CircularLoader small /><p>Exporting metadata and creating file...</p></div>
          }
          
          {documentReady &&
            <div>
              <p>Your file is ready!</p>
              <p>You can now download the metadata for the program <strong>{programMetadata.programs[0].name}</strong> by clicking "Download Now".</p>
              <ButtonStrip end>
                {downloading &&
                  <CircularLoader small />
                }
                <Button primary onClick={()=>downloadFile(programMetadata)} disabled={downloading}>Download Now</Button>
                <Button onClick={()=>hideForm()} destructive> Close </Button>
              </ButtonStrip>
            </div>
          }
        </ModalContent>
      </Modal>
    </>
  );
}

export default DependencyExport;