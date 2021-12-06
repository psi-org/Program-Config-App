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
    compulsory:"Compulsory",
    valueType:"Value Type",
    optionSet:"Option Set",
    legend:"Legend",
    scoreNum:"Score Numerator",
    scoreDen:"Score Denominator",
    feedbackOrder:"Compositive Indicator (Feedback Order)",
    parentQuestion:"Parent question",
    answerValue:"Answer value",
    feedbackText:"Feedback Text",
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
    return optionSets.find(os => os.name == optionSetName)?.id
};

const getLegendSetId = (legendSetName,legendSets)=>{
    return legendSets.find(ls => ls.name == legendSetName)?.id
};

//Question
const mapImportedDE = (data,programPrefix,type,optionSets,legendSets) => {

    let code = programPrefix + '_' + data[importMap.parentName];

    let aggType;
    if(type=='score'){
        aggType='AVERAGE'
    }else{
        switch(data[importMap.valueType]){
            case 'TEXT':
            case 'LONG_TEXT':
                aggType = 'NONE';
                break;
            default:
                aggType = 'SUM';
        }
    }
    

    const parsedDE = {
        id: data[importMap.dataElementId] || undefined,
        name: code + '_' + data[importMap.formName],
        shortName: (code + '_' + data[importMap.formName]).slice(0,50),
        code,
        formName: type=='label'?'     ':data[importMap.formName],
        domainType: 'TRACKER',
        //zeroIsSignificant: '',
        valueType: data[importMap.valueType],
        aggregationType: aggType,
        //categoryCombo :  { id :  '' },
        //optionSetValue: data[importMap.optionSet] != "",
        //optionSet: data[importMap.optionSet] != "" ? { id: getOptionSetId(data[importMap.optionSet],optionSets) } : {},
        //legendSet: data[importMap.legend] != "" ? { id: getLegendSetId(data[importMap.legend],legendSets) } : {},
        attributeValues: []
    };

    if (data[importMap.feedbackOrder] != "") parsedDE.attributeValues.push(
        { 
            attribute: { id : FEEDBACK_ORDER },
            value: data[importMap.feedbackOrder] 
        }
    );

    if (data[importMap.feedbackText] != "") parsedDE.attributeValues.push(
        { 
            attribute:{ id : FEEDBACK_TEXT },
            value: data[importMap.feedbackText] 
        }
    );

    //if(data[importMap.criticalStep]!="") parsedDE.attributeValues.push({CRITICAL_QUESTION:data[importMap.criticalStep]});

    const metadata = { 
        compulsory: data[importMap.compulsory] ? "Yes" : "No",
        elemType : type
    };
    if (data[importMap.scoreNum] != "") metadata.scoreNum = data[importMap.scoreNum];
    if (data[importMap.scoreDen] != "") metadata.scoreDen = data[importMap.scoreDen];
    if (data[importMap.parentQuestion]!="") metadata.parentVarName = data[importMap.parentQuestion];   // REPLACE WITH PARENT DATA ELEMENT'S UID
    if (data[importMap.answerValue]!="") metadata.answerValue = data[importMap.answerValue];

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

const readTemplateData = (templateData, currentData, programPrefix='Prefix', optionSets, legendSets) => {

    let sectionIndex = -1;
    let importedSections = [];
    let importedScores = [];

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
                importedSections[sectionIndex].dataElements.push(mapImportedDE(row,programPrefix,row.Structure,optionSets,legendSets));
                break;
            case 'score':
                importedScores.push(mapImportedDE(row,programPrefix,'score',optionSets,legendSets));
                //importedScores.push(row);
                break;
        }
    });

    // Get new questions (no uid)
    importedSections.forEach( i_section => {
        i_section.dataElements.map( i_de => {
            i_de.importStatus = i_de.id == null ? 'new' : 'update'; 
            i_de.id == null ? importSummaryValues.questions.new++ : importSummaryValues.questions.updated++;
            return i_de;
        })
    });

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

    console.log(importSummaryValues);

    return {importedSections,importedScores,importSummaryValues};

};

module.exports = {
    readTemplateData
};