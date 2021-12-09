import React, {useState} from 'react';
import { useDataQuery } from '@dhis2/app-runtime'
import { arrayObjectToStringConverter } from '../../configs/Utils';
import Exporter from "./Exporter";

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['id', 'name', 'options[name]'],
            filter: ['name:ilike:HNQIS - ']
        }
    }
};

const healthAreasQuery = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['name', 'options[id]','options[name]'],
            filter: ['name:ilike:Health area']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            fields: ['id','name'],
            filter: ['name:ilike:HNQIS']
        }
    }
}

const programsQuery = {
    results: {
        resource: 'programs',
        params: {
            fields: ['name', 'id']
        }
    }
}

const DataProcessor = (props) => {
    const programStage = props.ps;
    const programMetadata = JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}");
    const programPrefix = programMetadata?.dePrefix || programStage.program.id;
    const useCompetencyClass = programMetadata?.useCompetencyClass || "Yes";

    const [ isDownloaded, setIsDownloaded] = useState(false);
    const { data: data} = useDataQuery(optionSetQuery);
    const { data: haData } = useDataQuery(healthAreasQuery);
    const { data: lsData } = useDataQuery(legendSetsQuery);
    const { data: progData } = useDataQuery(programsQuery);

    let Configures = [];
    let optionData = [];
    let healthAreaData = [];
    let legendSetData = [];
    let programData = [];

    const initialize = () => {
        compile_report();
        getOptionSets();
        setTimeout(function() {
            setIsDownloaded(true);
        }, 2000);
    }

    const compile_report = () => {
        let program_stage_id = programStage.id;

        programStage.programStageSections.forEach((programSection) => {
            let program_section_id = programSection.id;

            let row = {};
            row.structure = "Section";
            row.form_name = programSection.displayName;
            row.program_stage_id = program_stage_id;
            row.program_section_id = program_section_id;
            Configures.push(row);

            programSection.dataElements.forEach((dataElement) => {
                let row = {};
                row.form_name = dataElement.formName;
                row.value_type = dataElement.valueType;
                row.optionSet = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : '';
                row.legend = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : '';
                row.description = dataElement.description;

                row.program_stage_id = program_stage_id;
                row.program_section_id = program_section_id;
                row.data_element_id = dataElement.id;

                let critical = dataElement.attributeValues.filter(av => av.attribute.id === "NPwvdTt0Naj");
                row.critical = (critical.length > 0) ? critical[0].value : '';

                let metaDataString = dataElement.attributeValues.filter(av => av.attribute.id === "haUflNqP85K");
                let metaData = (metaDataString.length > 0) ? JSON.parse(metaDataString[0].value) : '';
                row.parentValue = '';
                row.structure = (typeof metaData.elemType !== 'undefined') ? metaData.elemType : '';
                if(row.structure == 'label') row.form_name = metaData.labelFormName || '';
                row.score_numerator = (typeof metaData.scoreNum !== 'undefined') ? metaData.scoreNum: '';
                row.score_denominator = (typeof metaData.scoreDen !== 'undefined') ? metaData.scoreDen : '';
                row.parent_question = (typeof metaData.parentVarName !== 'undefined') ? metaData.parentVarName : '';
                row.answer_value = (typeof metaData.parentValue !== 'undefined') ? metaData.parentValue : '';
                row.critical = (typeof metaData.isCritical !== 'undefined') ? metaData.isCritical: '';

                let compositiveIndicator = dataElement.attributeValues.filter(av => av.attribute.id === "LP171jpctBm");
                row.compositive_indicator = (compositiveIndicator.length > 0) ? compositiveIndicator[0].value : '';

                let feedbackText = dataElement.attributeValues.filter(av => av.attribute.id === "yhKEe6BLEer");
                row.feedback_text = (feedbackText.length > 0) ? feedbackText[0].value : '';

                row.compulsory = getCompulsoryStatusForDE(dataElement.id);
                Configures.push(row);
            });
        });
    };

    const getCompulsoryStatusForDE = (dataElement_id) => {
        let de = programStage.programStageDataElements.filter( psde => psde.dataElement.id === dataElement_id);
        return (de.length > 0) ? de[0].compulsory : false;
    }

    const getOptionSets = () => {
        if(typeof data !== 'undefined') {
            let optionSets = data.results.optionSets;
            optionSets.forEach((optionSet) => {
                let options = arrayObjectToStringConverter(optionSet.options, "name");
                let data = {
                    "Option Sets": optionSet.name,
                    "UID": optionSet.id,
                    "Options": options
                };
                optionData.push(data);
            })
            getHealthAreas();
        }
    }

    const getHealthAreas = () => {
        if(typeof haData !== 'undefined') {
            const healthAreas = haData.results.optionSets;
            healthAreas.forEach((ha) => {
                ha.options.forEach((option) => {
                    let data = {
                        "Code": option.id,
                        "Health Area": option.name
                    };
                    healthAreaData.push(data);
                });
            });
            getLegendSet();
        }
    }

    const getLegendSet = () => {
        if(typeof lsData !== 'undefined')
        {
            let legendSets = lsData.results.legendSets;
            legendSets.forEach((legendSet) => {
                let data = {
                    "Legend Set" : legendSet.name,
                    "UID" : legendSet.id
                };
                legendSetData.push(data);
            })
            getProgramData();
        }
    }

    const getProgramData = () => {
        if(typeof progData !== 'undefined')
        {
            let ps = progData.results.programs;
            ps.forEach((program) => {
                let data = {
                    "Program": program.name,
                    "UID": program.id
                };
                programData.push(data);
            });
        }
    }

    initialize();

    return (
        <>
            {isDownloaded && <Exporter Configures={Configures}  optionData={optionData} healthAreaData={healthAreaData} legendSetData={legendSetData} programData={programData} isLoading={props.isLoading} programName={props.ps.program.name} programPrefix={programPrefix} useCompetencyClass={useCompetencyClass}  setStatus={props.setStatus}/>}
        </>
    );
}

export default DataProcessor;