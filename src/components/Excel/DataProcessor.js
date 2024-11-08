import { useDataQuery } from '@dhis2/app-runtime'
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import { COMPETENCY_CLASS, CRITICAL_STEPS, FEEDBACK_ORDER, FEEDBACK_TEXT, METADATA, NON_CRITICAL_STEPS } from '../../configs/Constants.js';
import { getVarNameFromParentUid } from '../../utils/ExcelUtils.js';
import { getPureValue, isGeneratedType, isLabelType } from '../../utils/Utils.js';
import Exporter from "./Exporter.js";

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            paging: false,
            fields: ['id', 'name', 'valueType'],
            filter: ['name:ilike:HNQIS']
        }
    }
};

const healthAreasQuery = {
    results: {
        resource: 'optionSets',
        params: {
            paging: false,
            fields: ['name', 'options[id,code,name]'],
            filter: ['id:eq:y752HEwvCGi']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            paging: false,
            fields: ['id','name'],
            filter: ['name:ilike:HNQIS']
        }
    }
}

const programsQuery = {
    results: {
        resource: 'programs',
        params: {
            paging: false,
            fields: ['name', 'id']
        }
    }
}

const DataProcessor = (props) => {
    const programStage = props.ps;
    let programMetadata = "";
    let programPrefix = "";
    let useCompetencyClass = "";
    let programHealthArea = "";
    //let programName = "";
    let programShortName = "";
    if(typeof programStage.program !== "undefined")
    {
        //programName = programStage.program.name;
        programShortName = programStage.program.shortName;
        programMetadata = JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
        programPrefix = programMetadata?.dePrefix || programStage.program.id;
        programHealthArea = programMetadata?.healthArea || "FP";
        useCompetencyClass = programMetadata?.useCompetencyClass || "Yes";
    }

    const [ isDownloaded, setIsDownloaded] = useState(false);
    const [ exportFlag, setExportFlag] = useState(true);
    const { data: data} = useDataQuery(optionSetQuery);
    const { data: haData } = useDataQuery(healthAreasQuery);
    const { data: lsData } = useDataQuery(legendSetsQuery);
    const { data: progData } = useDataQuery(programsQuery);

    const Configures = [];
    let optionData = [];
    let healthAreaData = [];
    let legendSetData = [];
    let programData = [];

    const optionPool = data?.results.optionSets;
    if (optionPool)
    {
        optionData = optionPool.map(op=>{
            return {"Option Sets": op.name, UID: op.id, "Value Type": op.valueType}
        })
    }

    const  haPools = haData?.results.optionSets[0].options;
    if (haPools)
    {
        healthAreaData = haPools.map(hp=>{
            return {code: hp.code, "Health Area": hp.name}
        });
    }

    const  legendPool = lsData?.results.legendSets;
    if (legendPool)
    {
        legendSetData = legendPool.map(lp => {
            return {"Legend Set": lp.name, UID: lp.id}
        });
    }

    const  prgPool = progData?.results.programs;
    if (prgPool)
    {
        programData = prgPool.map(pp=>{
            return {Program: pp.name, UID: pp.id}
        });
    }

    const initialize = () => {
        if (typeof programStage.program !== "undefined") { compile_report() }
        setTimeout(function() {
            setIsDownloaded(true);
        }, 2000);
    }

    const compile_report = () => {
        const program_stage_id = programStage.id;
        const mwiFeedbackOrder = {
            section: 0,
            standard: 0,
            criterion: 0,
            element: 1
        }

        programStage.programStageSections.forEach((programSection) => {
            const  criticalStepsDataElements = [COMPETENCY_CLASS, CRITICAL_STEPS, NON_CRITICAL_STEPS];

            const  program_section_id = programSection.id;

            // Skip 'Critical Steps Calculations' Section
            if (programSection.dataElements.find(de => criticalStepsDataElements.includes(de.id))) { return }

            const tempConfigures = [];
            const logicDataElements = [];

            const sectionRow = {};

            sectionRow.structure = "Section";

            if (props.hnqisType === 'HNQISMWI') {
                if (programSection.displayName.match(/Section \d+.*/)) {
                    sectionRow.compositive_indicator = `${++mwiFeedbackOrder.section}`;
                    mwiFeedbackOrder.standard = 0;
                    mwiFeedbackOrder.criterion = 0;
                    mwiFeedbackOrder.element = 1;
                } else if (programSection.displayName.match(/> Standard \d+(\.\d+)*.*/)) {
                    sectionRow.structure = "Standard";
                    sectionRow.compositive_indicator = `${mwiFeedbackOrder.section}.${++mwiFeedbackOrder.standard}`;
                    mwiFeedbackOrder.criterion = 0;
                    mwiFeedbackOrder.element = 1;
                } else if (programSection.displayName.match(/> > Criterion \d+(\.\d+)*.*/)) {
                    sectionRow.structure = "Criterion";
                    sectionRow.compositive_indicator = `${mwiFeedbackOrder.section}.${mwiFeedbackOrder.standard}.${++mwiFeedbackOrder.criterion}`;
                    sectionRow.isCritical = (programSection.description === "*" ? "Yes" : "No");
                    mwiFeedbackOrder.element = 1;
                }
            }

            sectionRow.form_name = programSection.displayName.replace(/(> > Criterion \d+(\.\d+)*|> Standard \d+(\.\d+)*|Section \d+) : /g, "");
            sectionRow.program_stage_id = program_stage_id;
            sectionRow.program_section_id = program_section_id;

            programSection.dataElements.forEach((dataElement) => {
                const row = {};
                
                const metaDataString = dataElement.attributeValues.filter(av => av.attribute.id === METADATA);
                const metaData = (metaDataString.length > 0) ? JSON.parse(metaDataString[0].value) : '';
                
                if (isGeneratedType(metaData.elemType)) {
                    logicDataElements.push(dataElement);
                    return;
                }

                row.form_name = dataElement.formName?.replaceAll(' [C]','') || '';
                row.value_type = (typeof dataElement.valueType !=='undefined') ? dataElement.valueType : undefined;
                row.optionSet = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : undefined;
                row.legend = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : undefined;
                row.description = dataElement.description;

                row.program_stage_id = program_stage_id;
                row.program_section_id = program_section_id;
                row.data_element_id = dataElement.id;

                row.parentValue = '';
                row.structure = (typeof metaData.elemType !== 'undefined') ? metaData.elemType : '';
                if (isLabelType(row.structure)) { row.form_name = metaData.labelFormName || '' }
                row.score_numerator = (typeof metaData.scoreNum !== 'undefined') ? metaData.scoreNum: undefined;
                row.score_denominator = (typeof metaData.scoreDen !== 'undefined') ? metaData.scoreDen : undefined;
                row.parent_question = (typeof metaData.parentQuestion !== 'undefined') ? getVarNameFromParentUid(metaData.parentQuestion, programStage) : undefined;
                row.answer_value = (typeof metaData.parentValue !== 'undefined') ? getPureValue(metaData.parentValue) : undefined;
                row.isCompulsory = (typeof metaData.isCompulsory !== 'undefined' && row.structure!='score') ? metaData.isCompulsory: undefined;
                row.isCritical = (typeof metaData.isCritical !== 'undefined' && row.structure!='score') ? metaData.isCritical: undefined;

                if (props.hnqisType === 'HNQISMWI' && row.structure != 'Std Overview') {  
                    row.compositive_indicator = `${mwiFeedbackOrder.section}.${mwiFeedbackOrder.standard}.${mwiFeedbackOrder.criterion}.${mwiFeedbackOrder.element++}`;
                } else {
                    const compositiveIndicator = dataElement.attributeValues.filter(av => av.attribute.id === FEEDBACK_ORDER);
                    row.compositive_indicator = (compositiveIndicator.length > 0) ? compositiveIndicator[0].value : undefined;
                }

                const feedbackText = dataElement.attributeValues.filter(av => av.attribute.id === FEEDBACK_TEXT);
                row.feedback_text = (feedbackText.length > 0) ? feedbackText[0].value : undefined;

                tempConfigures.push(row);
            });

            if (logicDataElements.length > 0) { 
                sectionRow.data_element_id = JSON.stringify(logicDataElements); //Stores the DE object instead of an ID
            }

            Configures.push(sectionRow);
            Configures.push(...tempConfigures);
        });
    };

    initialize();

    return (
        <>
            {isDownloaded && exportFlag &&
                <Exporter
                    programName={props.programName}
                    flag={exportFlag}
                    setFlag={setExportFlag}
                    Configures={Configures}
                    optionData={optionData}
                    healthAreaData={healthAreaData}
                    legendSetData={legendSetData}
                    programData={programData}
                    isLoading={props.isLoading}
                    programShortName={programShortName}
                    programPrefix={programPrefix}
                    useCompetencyClass={useCompetencyClass}
                    programHealthArea={programHealthArea}
                    hnqisType={props.hnqisType}
                />}
        </>
    );
}

DataProcessor.propTypes = {
    hnqisType: PropTypes.string,
    isLoading: PropTypes.func,
    programName: PropTypes.string,
    programStageSections: PropTypes.array,
    ps: PropTypes.object
}

export default DataProcessor;