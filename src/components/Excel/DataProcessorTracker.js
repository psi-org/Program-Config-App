import React, {useState, useEffect} from 'react';
import { useDataQuery } from '@dhis2/app-runtime'
import { arrayObjectToStringConverter } from '../../configs/Utils';
import Exporter from "./Exporter";
import { METADATA } from '../../configs/Constants';

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            paging: false,
            fields: ['id', 'name', 'valueType']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            paging: false,
            fields: ['id','name']
        }
    }
}

const teasQuery = {
    results: {
        resource: 'trackedEntityAttributes',
        params: {
            paging: false,
            fields: ['id','name', 'shortName', 'valueType', 'aggregationType']
        }
    }
}

const dePropertiesQuery = {
    results: {
        resource: 'schemas/dataElement',
        params: {
            paging: false,
            fields: ['properties']
        }
    }
}

// /api/programs/sC4L2NNx3VA.json?fields=id,name,shortName,attributeValues,withoutRegistration,trackedEntityType[id,name],categoryCombo[id,name],programStages[id,name,description,programStageDataElements,programStageSections[*,dataElements[*]]]
const currentProgramQuery = {    
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['id', 'name', 'shortName', 'attributeValues', 'withoutRegistration', 'trackedEntityType[id, name]', 'categoryCombo[id, name]', 'programStages[id, name, description, programStageDataElements, programStageSections[*, dataElements[*]]]','programTrackedEntityAttributes','programSections[*]']
        }
    },
}

const DataProcessorTracker = ({ programId, isLoading, setStatus }) => {

    const { data: currentProgram } = useDataQuery(currentProgramQuery, { variables: { programId } });
    const { data: optionSets } = useDataQuery(optionSetQuery);
    const { data: legendSets } = useDataQuery(legendSetsQuery);
    const { data: trackedEntityAttributes } = useDataQuery(teasQuery);
    const { data: deProperties } = useDataQuery(dePropertiesQuery);
    
    let programMetadata = "";

    //* Instructions Tab Data
    let programPrefix = "";
    let programName = "";
    let programShortName = "";
    let programTET = "";
    let programCatCombo = "";
    let programType = "";

    //* Map Data
    let configurations = {};
    let optionData = [];
    let legendSetData = [];
    let trackedEntityAttributesData = [];
    let valueTypes = [];
    let aggTypes = [];
    let programData = [];

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [exportFlag, setExportFlag] = useState(true);

    useEffect(() => {
        if (currentProgram?.results && optionSets && legendSets && trackedEntityAttributes && deProperties) {
            console.log(currentProgram)
            //* Program Settings
            programMetadata = JSON.parse(currentProgram.results.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
            programPrefix = programMetadata.dePrefix;
            programName = currentProgram.results.name;
            programShortName = currentProgram.results.shortName;
            programTET = currentProgram.results.trackedEntityType?.name || 'N/A';
            programCatCombo = currentProgram.results.categoryCombo.name;
            programType = (currentProgram.results.withoutRegistration ? 'Event' : 'Tracker') + ' Program';
            
            //* Options Map
            optionData = optionSets.results?.optionSets || [];

            //* Legends Map
            legendSetData = legendSets.results?.legendSets || [];

            //* Legends Map
            trackedEntityAttributesData = trackedEntityAttributes.results.trackedEntityAttributes || [];

            //* valueType and aggregationType Properties
            deProperties.results.properties?.forEach(property => {
                if (property.name == 'aggregationType')
                    aggTypes = property.constants
                
                if (property.name == 'valueType')
                    valueTypes = property.constants
            })

            compile_report();

            isLoading(false); //TODO: Move it
        }
    }, [currentProgram, optionSets, legendSets, trackedEntityAttributes, deProperties]);



    /*const initialize = () => {
        if(typeof programStage.program !== "undefined") compile_report();
        setTimeout(function() {
            setIsDownloaded(true);
        }, 2000);
    }*/

    const compile_report = () => {

        currentProgram.results?.programStages?.forEach(programStage => {

            let program_stage_id = programStage.id;
            configurations[program_stage_id] = []

            programStage.programStageSections.forEach((programSection) => {

                let program_section_id = programSection.id;

                let row = {};
                row.structure = "Section";
                row.form_name = programSection.displayName;
                row.program_stage_id = program_stage_id;
                row.program_section_id = program_section_id;
                configurations[program_stage_id].push(row);

                programSection.dataElements.forEach((dataElement) => {
                    let row = {};

                    row.value_type = (typeof dataElement.valueType !== 'undefined') ? dataElement.valueType : '';
                    row.optionSet = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : '';
                    row.legend = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : '';
                    row.description = dataElement.description;

                    row.program_stage_id = program_stage_id;
                    row.program_section_id = program_section_id;
                    row.data_element_id = dataElement.id;

                    let metaDataString = dataElement.attributeValues.filter(av => av.attribute.id === METADATA);
                    let metaData = (metaDataString.length > 0) ? JSON.parse(metaDataString[0].value) : '';
                    row.parentValue = '';
                    row.structure = 'Data Element';
                    row.parent_question = (typeof metaData.parentQuestion !== 'undefined') ? getVarNameFromParentUid(metaData.parentQuestion) : '';
                    row.answer_value = '';
                    row.isCompulsory = (typeof metaData.isCompulsory !== 'undefined' && row.structure != 'score') ? metaData.isCompulsory : '';

                    //row.isCompulsory = getCompulsoryStatusForDE(dataElement.id);
                    configurations[program_stage_id].push(row);
                });
            });
        });

        console.log(configurations);
    };

    const getCompulsoryStatusForDE = (dataElement_id) => {
        let de = programStage.programStageDataElements.filter( psde => psde.dataElement.id === dataElement_id);
        return (de.length > 0) ? de[0].compulsory : false;
    }

    const getVarNameFromParentUid = (parentUid) =>{
        let parentDe = programStage.programStageSections.map(pss => pss.dataElements).flat().find(de => de.id == parentUid);
        let deMetadata = JSON.parse(parentDe.attributeValues.find(av => av.attribute.id === METADATA)?.value || "{}");
        return deMetadata.varName;
    }

    return (
        <>
            {/*isDownloaded && exportFlag && <Exporter programName={props.programName} flag={exportFlag} setFlag={setExportFlag} configurations={configurations}  optionData={optionData} healthAreaData={healthAreaData} legendSetData={legendSetData} programData={programData} isLoading={isLoading} programShortName={programShortName} programPrefix={programPrefix} useCompetencyClass={useCompetencyClass} programHealthArea={programHealthArea}  setStatus={setStatus}/>*/}
        </>
    );
}

export default DataProcessorTracker;