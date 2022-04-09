import React, {useState} from 'react';
import { useDataQuery } from '@dhis2/app-runtime'
import { arrayObjectToStringConverter } from '../../configs/Utils';
import Exporter from "./Exporter";

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        paging: false,
        params: {
            fields: ['id', 'name', 'options[name]'],
            filter: ['name:ilike:HNQIS - ']
        }
    }
};

const healthAreasQuery = {
    results: {
        resource: 'optionSets',
        paging: false,
        params: {
            fields: ['name', 'options[id,code,name]'],
            filter: ['id:eq:y752HEwvCGi']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        paging: false,
        params: {
            fields: ['id','name'],
            filter: ['name:ilike:HNQIS']
        }
    }
}

const programsQuery = {
    results: {
        resource: 'programs',
        paging: false,
        params: {
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
    let programName = "";
    let programShortName = "";
    if(typeof programStage.program !== "undefined")
    {
        programName = programStage.program.name;
        programShortName = programStage.program.shortName;
        //console.log("PS: ", programStage);
        programMetadata = JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}");
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

    let Configures = [];
    let optionData = [];
    let healthAreaData = [];
    let legendSetData = [];
    let programData = [];

    let optionPool = data?.results.optionSets;
    if (optionPool)
    {
        optionData = optionPool.map(op=>{
            return {"Option Sets": op.name, UID: op.id, Options: arrayObjectToStringConverter(op.options, "name")}
        })
    }

    let haPools = haData?.results.optionSets[0].options;
    if (haPools)
    {
        healthAreaData = haPools.map(hp=>{
            return {code: hp.code, "Health Area": hp.name}
        });
    }

    let legendPool = lsData?.results.legendSets;
    if (legendPool)
    {
        legendSetData = legendPool.map(lp => {
            return {"Legend Set": lp.name, UID: lp.id}
        });
    }

    let prgPool = progData?.results.programs;
    if (prgPool)
    {
        programData = prgPool.map(pp=>{
            return {Program: pp.name, UID: pp.id}
        });
    }

    const initialize = () => {
        //console.log("Loading : ", "Data Processor");
        if(typeof programStage.program !== "undefined") compile_report();
        setTimeout(function() {
            setIsDownloaded(true);
        }, 2000);
    }

    const compile_report = () => {
        let program_stage_id = programStage.id;

        programStage.programStageSections.forEach((programSection) => {
            let criticalStepsDataElements = ['NAaHST5ZDTE','VqBfZjZhKkU','pzWDtDUorBt'];

            let program_section_id = programSection.id;

            // Skip 'Critical Steps Calculations' Section
            if(programSection.dataElements.find(de => criticalStepsDataElements.includes(de.id))) return;

            let row = {};
            row.structure = "Section";
            row.form_name = programSection.displayName;
            row.program_stage_id = program_stage_id;
            row.program_section_id = program_section_id;
            Configures.push(row);

            programSection.dataElements.forEach((dataElement) => {
                let row = {};
                row.form_name = dataElement.formName;
                row.value_type = (typeof dataElement.valueType !=='undefined') ? dataElement.valueType : '';
                row.optionSet = (typeof dataElement.optionSet !== 'undefined') ? dataElement.optionSet.name : '';
                row.legend = (typeof dataElement.legendSet !== 'undefined') ? dataElement.legendSet.name : '';
                row.description = dataElement.description;

                row.program_stage_id = program_stage_id;
                row.program_section_id = program_section_id;
                row.data_element_id = dataElement.id;

                let metaDataString = dataElement.attributeValues.filter(av => av.attribute.id === "haUflNqP85K");
                let metaData = (metaDataString.length > 0) ? JSON.parse(metaDataString[0].value) : '';
                row.parentValue = '';
                row.structure = (typeof metaData.elemType !== 'undefined') ? metaData.elemType : '';
                if(row.structure == 'label') row.form_name = metaData.labelFormName || '';
                row.score_numerator = (typeof metaData.scoreNum !== 'undefined') ? metaData.scoreNum: '';
                row.score_denominator = (typeof metaData.scoreDen !== 'undefined') ? metaData.scoreDen : '';
                row.parent_question = (typeof metaData.parentQuestion !== 'undefined') ? getVarNameFromParentUid(metaData.parentQuestion) : '';
                row.answer_value = (typeof metaData.parentValue !== 'undefined') ? metaData.parentValue : '';
                row.isCompulsory = (typeof metaData.isCompulsory !== 'undefined' && row.structure!='score') ? metaData.isCompulsory: '';
                row.isCritical = (typeof metaData.isCritical !== 'undefined' && row.structure!='score') ? metaData.isCritical: '';

                let compositiveIndicator = dataElement.attributeValues.filter(av => av.attribute.id === "LP171jpctBm");
                row.compositive_indicator = (compositiveIndicator.length > 0) ? compositiveIndicator[0].value : '';

                let feedbackText = dataElement.attributeValues.filter(av => av.attribute.id === "yhKEe6BLEer");
                row.feedback_text = (feedbackText.length > 0) ? feedbackText[0].value : '';

                //row.isCompulsory = getCompulsoryStatusForDE(dataElement.id);
                Configures.push(row);
            });
        });
    };

    const getCompulsoryStatusForDE = (dataElement_id) => {
        let de = programStage.programStageDataElements.filter( psde => psde.dataElement.id === dataElement_id);
        return (de.length > 0) ? de[0].compulsory : false;
    }

    const getVarNameFromParentUid = (parentUid) =>{
        let parentDe = programStage.programStageSections.map(pss => pss.dataElements).flat().find(de => de.id == parentUid);
        let deMetadata = JSON.parse(parentDe.attributeValues.find(av => av.attribute.id === "haUflNqP85K")?.value || "{}");
        return deMetadata.varName;
    }

    initialize();

    return (
        <>
            {isDownloaded && exportFlag && <Exporter programName={props.programName} flag={exportFlag} setFlag={setExportFlag} Configures={Configures}  optionData={optionData} healthAreaData={healthAreaData} legendSetData={legendSetData} programData={programData} isLoading={props.isLoading} programName={programName} programShortName={programShortName} programPrefix={programPrefix} useCompetencyClass={useCompetencyClass} programHealthArea={programHealthArea}  setStatus={props.setStatus}/>}
        </>
    );
}

export default DataProcessor;