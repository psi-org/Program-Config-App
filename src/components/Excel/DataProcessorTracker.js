import { useDataQuery } from '@dhis2/app-runtime'
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { DHIS2_AGG_OPERATORS_MAP, DHIS2_VALUE_TYPES_MAP, METADATA } from '../../configs/Constants.js';
import { getVarNameFromParentUid } from '../../utils/ExcelUtils.js';
import { getPureValue } from '../../utils/Utils.js';
import ExporterTracker from './ExporterTracker.js';

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            paging: false,
            fields: ['id', 'name', 'valueType', 'href']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            paging: false,
            fields: ['id', 'name']
        }
    }
}

const teasQuery = {
    results: {
        resource: 'trackedEntityAttributes',
        params: {
            paging: false,
            fields: ['id', 'name', 'shortName', 'valueType', 'aggregationType']
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

const currentProgramQuery = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['id', 'name', 'shortName', 'attributeValues', 'withoutRegistration', 'trackedEntityType[id, name]', 'categoryCombo[id, name]', 'programStages[id, name, description, programStageDataElements[*,dataElement[*,optionSet[id,name]]], formType, programStageSections[*, dataElements[*,optionSet[id,name],legendSet[id,name]]]]', 'programTrackedEntityAttributes[*,trackedEntityAttribute[id,name]]', 'programSections[*]']
        }
    },
}

const DataProcessorTracker = ({ programId, isLoading }) => {

    const { data: currentProgram } = useDataQuery(currentProgramQuery, { variables: { programId } });
    const { data: optionSets } = useDataQuery(optionSetQuery);
    const { data: legendSets } = useDataQuery(legendSetsQuery);
    const { data: trackedEntityAttributes } = useDataQuery(teasQuery);
    const { data: deProperties } = useDataQuery(dePropertiesQuery);

    let programMetadata = "";

    //* Instructions Tab Data
    let programID = "";
    let programPrefix = "";
    let programName = "";
    let programShortName = "";
    let programTET = "";
    let programCatCombo = "";
    let programType = "";

    //* Map Data
    const stagesConfigurations = [];
    let teaConfigurations = [];
    let optionData = [];
    let legendSetData = [];
    let trackedEntityAttributesData = [];
    let valueTypes = [];
    let aggTypes = [];
    const programData = [];

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [exportFlag, setExportFlag] = useState(true);
    const [exportProps, setExportProps] = useState(undefined);

    useEffect(() => {
        if (currentProgram?.results && optionSets && legendSets && trackedEntityAttributes && deProperties) {
            //* Program Settings
            programMetadata = JSON.parse(currentProgram.results.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
            programID = currentProgram.results.id;
            programPrefix = programMetadata.dePrefix;
            programName = currentProgram.results.name;
            programShortName = currentProgram.results.shortName;
            programTET = currentProgram.results.withoutRegistration ? 'Not Applicable for Event Programs' : (currentProgram.results.trackedEntityType?.name || 'N/A');
            programCatCombo = currentProgram.results.categoryCombo.name;
            programType = (currentProgram.results.withoutRegistration ? 'Event' : 'Tracker') + ' Program';

            //* Options Map
            optionData = optionSets.results?.optionSets?.map(os => {
                const origin = os.href.split('api')[0];
                return {
                    ref: os.name,
                    name: os.name,
                    id: os.id,
                    valueType: os.valueType,
                    url: `${origin}api/optionSets/${os.id}?fields=id,name,options[id,code,name]`
                }
            }) || [];

            //* Legends Map
            legendSetData = legendSets.results?.legendSets || [];

            //* TEAs Map
            trackedEntityAttributesData = trackedEntityAttributes.results.trackedEntityAttributes?.map(tea => {
                return {
                    ref: tea.name,
                    name: tea.name,
                    id: tea.id,
                    shortName: tea.shortName,
                    aggregationType: tea.aggregationType,
                    valueType: tea.valueType,
                }
            }) || [];

            //* valueType and aggregationType Properties
            deProperties.results.properties?.forEach(property => {
                if (property.name == 'aggregationType') {
                    aggTypes = property.constants.map(at => (
                        { name: DHIS2_AGG_OPERATORS_MAP[at] || at, value: at }
                    ))
                }

                if (property.name == 'valueType') {
                    valueTypes = property.constants.map(vt => (
                        { name: DHIS2_VALUE_TYPES_MAP[vt] || vt, value: vt }
                    ))
                }
            })

            setStagesContents();
            if (currentProgram?.results.withoutRegistration === false) {
                setTEAContents();
            }         

            setExportProps({
                programID,
                programPrefix,
                programName,
                programShortName,
                programTET,
                programCatCombo,
                programType,
                flag: exportFlag ,
                stagesConfigurations,
                teaConfigurations,
                optionData,
                legendSetData,
                trackedEntityAttributesData,
                valueTypes,
                aggTypes,
                programData,
                isLoading,
                setFlag: setExportFlag
            })
        }
    }, [currentProgram, optionSets, legendSets, trackedEntityAttributes, deProperties]);

    useEffect(() => {
        setTimeout(function () {
            setIsDownloaded(true);
        }, 1000);
    }, [])

    const setStagesContents = () => {

        currentProgram.results?.programStages?.sort(
            (stageA, stageB) => {
                if (stageA.sortOrder > stageB.sortOrder) { return 1 }
                if (stageA.sortOrder < stageB.sortOrder) { return -1 }
                return 0;
            }
        ).forEach((programStage) => {

            const program_stage_id = programStage.id;
            const currentConfigurations = [];

            if (programStage.formType === 'DEFAULT') {
                programStage.programStageSections = [{
                    id: 'basic-form',
                    displayName: 'Basic Form',
                    dataElements: programStage.programStageDataElements?.map(psde => psde.dataElement)
                }]
            }

            programStage.programStageSections.forEach((programSection) => {

                const program_section_id = programSection.id;

                const row = {};
                row.structure = "Section";
                row.form_name = programSection.name;
                row.program_section_id = program_section_id;
                currentConfigurations.push(row);

                programSection.dataElements.forEach((dataElement) => {
                    const row = {};
                    const metadataString = dataElement.attributeValues.filter(av => av.attribute.id === METADATA);
                    const metadata = (metadataString.length > 0) ? JSON.parse(metadataString[0].value) : {};

                    row.structure = 'Data Element';
                    row.use_auto_naming = metadata.autoNaming || 'Yes';

                    row.name = dataElement.name;
                    row.short_name = dataElement.shortName;
                    row.code = dataElement.code;

                    row.form_name = dataElement.formName;
                    row.description = dataElement.description;

                    const psdeCompulsory = programStage.programStageDataElements?.find(psde =>
                        psde.dataElement.id === dataElement.id)?.compulsory ? 'Yes' : 'No';

                    row.compulsory = (typeof metadata.isCompulsory !== 'undefined')
                        ? metadata.isCompulsory
                        : psdeCompulsory;
                    row.value_type = (typeof dataElement.valueType !== 'undefined') ? dataElement.valueType : undefined;
                    row.agg_type = dataElement.aggregationType;

                    row.option_set = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : undefined;
                    row.legend_set = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : undefined;
                    row.program_section_id = program_section_id;
                    row.data_element_id = dataElement.id;
                    row.parent_question = (typeof metadata.parentQuestion !== 'undefined') ? getVarNameFromParentUid(metadata.parentQuestion, programStage) : undefined;
                    row.answer_value = (typeof metadata.parentValue !== 'undefined') ? getPureValue(metadata.parentValue) : undefined;
                    row.program_stage_id = programStage.id

                    currentConfigurations.push(row);
                });
            });

            stagesConfigurations.push({
                stageId: program_stage_id,
                stageName: programStage.name,
                configurations: currentConfigurations
            })
        });

    };

    const setTEAContents = () => {
        const teaMap = {};
        const allTEAs = [];
        let unusedTEAs = [];

        currentProgram.results?.programTrackedEntityAttributes?.forEach(tea => {
            teaMap[tea.trackedEntityAttribute.id] = tea;
            allTEAs.push({ id: tea.trackedEntityAttribute.id })
        });

        
        const programSections = currentProgram.results?.programSections;

        programSections.forEach(teaSection => {
            const row = {};
            row.structure = "Section";
            row.form_name = teaSection.name;
            row.program_section_id = teaSection.id;
            teaConfigurations.push(row);

            teaSection.trackedEntityAttributes.forEach(tea => {
                teaConfigurations.push(teaRowBuilder(teaMap, tea, teaSection.id));
            });

        });
        
        unusedTEAs = allTEAs.filter(tea => !teaConfigurations.find(elem => elem.id === tea.id));
        if (unusedTEAs.length > 0) {

            const additionalConfigs = [{
                structure: "Section",
                form_name: programSections.length == 0?"Basic Form":"Available TEAs not in Form",
                program_section_id: programSections.length == 0 ? "basic-form" : "unused"
            }];

            unusedTEAs.forEach(tea => {
                additionalConfigs.push(teaRowBuilder(teaMap, tea, programSections.length == 0 ? "basic-form" : "unused"));
            });

            teaConfigurations = additionalConfigs.concat(teaConfigurations);
        }
    }

    const teaRowBuilder = (teaMap, tea, teaSectionId) => {
        const teaData = teaMap[tea.id];
        const row = {};

        row.structure = "TEA";
        row.name = teaData.trackedEntityAttribute.name;
        row.mandatory = teaData.mandatory ? 'Yes' : 'No';
        row.searchable = teaData.searchable ? 'Yes' : 'No';
        row.display_in_list = teaData.displayInList ? 'Yes' : 'No';
        row.allow_future_date = teaData.allowFutureDate ? 'Yes' : 'No';
        row.mobile_render_type = teaData.renderType?.MOBILE?.type || '';
        row.desktop_render_type = teaData.renderType?.DESKTOP?.type || '';
        row.program_tea_id = teaData.id;
        row.program_section_id = teaSectionId;
        row.id = tea.id;

        return row;
    }

    return (
        <>
            {isDownloaded && exportFlag && exportProps &&
                <ExporterTracker
                    {...exportProps}
                />
            }
        </>
    );
}

DataProcessorTracker.propTypes = {
    isLoading: PropTypes.func,
    programId: PropTypes.string
}

export default DataProcessorTracker;