const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
    FEEDBACK_TEXT = "yhKEe6BLEer",
    CRITICAL_QUESTION = "NPwvdTt0Naj",
    METADATA = "haUflNqP85K",
    SCORE_DEN = "l7WdLDhE3xW",
    SCORE_NUM = "Zyr7rlDOJy8";

const importMap = {
    parentName:"Parent Name",
    structure:"Structure",
    formName:"Form name",
    isCritical: "Critical Step",
    isCompulsory:"Compulsory",
    valueType:"Value Type",
    optionSet:"Option Set",
    legend:"Legend",
    scoreNum:"Score Numerator",
    scoreDen:"Score Denominator",
    feedbackOrder:"Compositive Indicator (Feedback Order)",
    parentQuestion:"Parent question",
    parentValue:"Answer value",
    feedbackText:"Feedback Text",
    description:"Description",
    programStage:"Program Stage Id",
    programSection:"Program Section Id",
    dataElementId:"Data Element Id",
};

/*
    [
        { id: UID, name: option set name}
    ]
*/
const getOptionSetId = (optionSetName,optionSets)=>{
    return optionSets.find(os => os.optionSet == optionSetName)?.id
};

const getLegendSetId = (legendSetName,legendSets)=>{
    return legendSets.find(ls => ls.legendSet == legendSetName)?.id
};

//Question
const mapImportedDE = (data, programPrefix, type, optionSets, legendSets, dataElementsPool) => {
    let code = "";

    let aggType;
    if(type=='score'){
        code = programPrefix + '_CS' + data[importMap.feedbackOrder];
        aggType='AVERAGE';
        data[importMap.valueType] = 'NUMBER';
    }else{
        if(type=='label') data[importMap.valueType] = 'LONG_TEXT';
        
        code = programPrefix + '_' + data[importMap.parentName]?.result;
        switch(data[importMap.valueType]){
            case 'TEXT':
            case 'LONG_TEXT':
                aggType = 'NONE';
                break;
            default:
                aggType = 'SUM';
        }
    }
    
    // Name max: 230
    // CODE_FORMNAME
    // REST : 230 - CODE.LENGTH - FIXED
    // FORMNAME.SLICE(0,REST)

    const FIXED_VALUES = 5;
    const formNameMaxLength = 230 - code.length - FIXED_VALUES;

    let existingDe = dataElementsPool[data[importMap.dataElementId]]

    const parsedDE = JSON.parse(JSON.stringify(existingDe || {}))

    parsedDE.id= data[importMap.dataElementId] || undefined,
    parsedDE.name= code + '_' + data[importMap.formName]?.slice(0,formNameMaxLength),
    parsedDE.shortName= (code + '_' + data[importMap.formName])?.slice(0,50),
    parsedDE.code,
    parsedDE.description= data[importMap.description],
    parsedDE.formName= type=='label'?'     ':data[importMap.formName]?(data[importMap.formName] + (data[importMap.isCritical]=='Yes'?' [C]':'')):'',
    parsedDE.domainType= 'TRACKER',
    parsedDE.valueType= data[importMap.valueType],
    parsedDE.aggregationType= aggType,
    parsedDE.parentName= data[importMap.parentName]?.result,
    parsedDE.attributeValues= (existingDe?.attributeValues.filter(att =>
        ![FEEDBACK_ORDER, FEEDBACK_TEXT, METADATA].includes(att.attribute.id)
        ) || [])

    if(data[importMap.optionSet] && data[importMap.optionSet] !== ""){
        parsedDE.optionSet = { id: getOptionSetId(data[importMap.optionSet],optionSets) };
        parsedDE.optionSetValue = true
    }
    if(data[importMap.legend] && data[importMap.legend] !== ""){
        parsedDE.legendSet = { id: getLegendSetId(data[importMap.legend],legendSets) };
        parsedDE.legendSets = [
            { id: getLegendSetId(data[importMap.legend],legendSets) }
        ];
    }

    if (data[importMap.feedbackOrder] && data[importMap.feedbackOrder] !== "") parsedDE.attributeValues.push(
        { 
            attribute: { id : FEEDBACK_ORDER },
            value: String(data[importMap.feedbackOrder])
        }
    );

    if (data[importMap.feedbackOrder] && data[importMap.feedbackText] !== "") parsedDE.attributeValues.push(
        { 
            attribute:{ id : FEEDBACK_TEXT },
            value: data[importMap.feedbackText] 
        }
    );

    const metadata = { 
        isCompulsory: data[importMap.isCompulsory] || "No"/* ? "Yes" : "No"*/,
        isCritical: data[importMap.isCritical] || "No"/* ? "Yes" : "No"*/,
        elemType : type,
        varName : data[importMap.parentName]?.result
    };
    if (data[importMap.scoreNum] !== "") metadata.scoreNum = data[importMap.scoreNum];
    if (data[importMap.scoreDen] !== "") metadata.scoreDen = data[importMap.scoreDen];

    if (data[importMap.parentQuestion]!==""){
        metadata.parentQuestion = data[importMap.parentQuestion];
        parsedDE.parentQuestion = data[importMap.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[importMap.parentValue]!=="") metadata.parentValue = data[importMap.parentValue];
    
    

    // For Labels
    if(type=='label') metadata.labelFormName = data[importMap.formName];

    parsedDE.attributeValues.push(
        { 
            attribute: { id : METADATA },
            value: JSON.stringify(metadata) 
        }
    );

    return parsedDE;
};

const readTemplateData = (templateData, currentData, programPrefix='Prefix', optionSets, legendSets, currentSectionsData) => {

    let sectionIndex = -1;
    let importedSections = [];
    let importedScores = [];
    let dataElementsPool = currentSectionsData.map(section => section.dataElements).flat().reduce((acu, cur) => {
        acu[cur.id] = { sharing: cur.sharing, attributeValues: cur.attributeValues, style: cur.style, categoryCombo: cur.categoryCombo };
        return acu;
    }, {})

    let importSummaryValues = {
        questions:{new:0,updated:0,removed:0},
        sections:{new:0,updated:0,removed:0},
        scores:{new:0,updated:0,removed:0}
    };

    templateData.forEach(row => {
        switch (row.Structure) {
            case 'Section':
                if(row["Form name"]=="Critical Steps Calculations" || row["Form name"]=="Scores") break;
                sectionIndex++;
                importedSections[sectionIndex] = {
                    id: row[importMap.programSection] || undefined,//null,
                    name: row["Form name"],
                    displayName: row["Form name"],
                    sortOrder: sectionIndex + 1,
                    dataElements: [],
                    importStatus: row[importMap.programSection] ? 'update' : 'new'
                }
                row[importMap.programSection] ? importSummaryValues.sections.updated++ : importSummaryValues.sections.new++;
                break;
            case 'question':
            case 'label':
                importedSections[sectionIndex].dataElements.push(mapImportedDE(row, programPrefix, row.Structure, optionSets, legendSets, dataElementsPool));
                break;
            case 'score':
                importedScores.push(mapImportedDE(row, programPrefix, 'score', optionSets, legendSets, dataElementsPool));
                //importedScores.push(row);
                break;
        }
    });

    // Get new questions (no uid)
    importedSections.forEach( i_section => {
        i_section.newDataElements = 0;
        i_section.updatedDataElements = 0;

        i_section.dataElements.map( i_de => {
            if(i_de.id==null){
                //New DE
                i_de.importStatus = 'new'; 
                importSummaryValues.questions.new++;
                i_section.newDataElements++;
            }else{
                //Updated DE
                i_de.importStatus = 'update'; 
                importSummaryValues.questions.updated++;
                i_section.updatedDataElements++;
            }

            return i_de;
        })
    });

    /*
    importedSections.map(section => {
        let resultsCount = section.dataElements.reduce((acc,de)=>{
            return de.importStatus=='new' ?[acc[0]+1,acc[1]]:[acc[0],acc[1]+1]
        },[0,0])
        section.newDataElements = resultsCount[0];
        section.updatedDataElements = resultsCount[1];
        return section
    })
     */

    // Compare previous questions with imported data -> Get removed data
    var removedQuestions = currentData.sections.map( sec => {
        // Section removed -> Increase counter
        if (!importedSections.find( i_sec => i_sec.id == sec.id)) importSummaryValues.sections.removed++ ;
        return sec.dataElements.filter( de => 
            !importedSections.find( i_sec => i_sec.dataElements.find( i_de => i_de.id == de.id) )
        )
    }).flat();

    importSummaryValues.questions.removed = removedQuestions.length;
    importSummaryValues.questions.removedItems = removedQuestions;

    // New scores
    importedScores.forEach( i_score => {
        i_score.importStatus = i_score.id == null ? 'new' : 'update';
        i_score.id == null ? importSummaryValues.scores.new++ : importSummaryValues.scores.updated++;
    });

    // Removed Scores
    var removedScores = currentData.scoresSection.dataElements.filter(de =>
        !importedScores.find(i_score => i_score.id == de.id)
    );
    importSummaryValues.scores.removed = removedScores.length;
    importSummaryValues.scores.removedItems = removedScores;

    return {importedSections,importedScores,importSummaryValues};

};

module.exports = {
    readTemplateData
};