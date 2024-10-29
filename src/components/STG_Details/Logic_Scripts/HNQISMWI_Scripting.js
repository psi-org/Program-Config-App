import { code } from "@uiw/react-md-editor";
import { ProgramIndicatorTemplate, ProgramIndicatorTemplateNoA, ProgramIndicatorTemplateGS, } from "../../../configs/AnalyticsTemplates.js";
import { FEEDBACK_ORDER, METADATA, COMPETENCY_ATTRIBUTE } from "../../../configs/Constants.js";
import { DeepCopy, padValue } from "../../../utils/Utils.js";
import { data } from "jquery";

const buildAttributesRulesMWI = (programId, uidPool, healthArea) => {

    const attributeActions = [];

    const attributeRules = [
        {
            name: "PR - Attributes - Assign Health Area",
            displayName: "PR - Assign Health Area",
            condition: "true",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: `'${healthArea}'`,
                    programRuleActionType: "ASSIGN",
                    trackedEntityAttribute: { id: "Xe5hUu6KkUT" }
                }
            ]
        },
        {
            name: "PR - Attributes - Assign Enrollment Date",
            displayName: "PR - Attributes - Assign Enrollment Date",
            condition: "true",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "V{enrollment_date}",
                    programRuleActionType: "ASSIGN",
                    trackedEntityAttribute: { id: "UlUYUyZJ6o9" }
                }
            ]
        },
        {
            name: "PR - Attributes - Assign OU",
            displayName: "PR - Attributes - Assign OU",
            condition: "true",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "V{orgunit_code}",
                    programRuleActionType: "ASSIGN",
                    trackedEntityAttribute: { id: "nHg1hGgtJwm" }
                }
            ]
        }
    ];

    attributeRules.forEach(rule => {
        const programRuleUid = uidPool.shift();

        const actions = rule.programRuleActions;
        rule.programRuleActions = [];

        rule.id = programRuleUid;
        rule.program.id = programId;

        actions.forEach(action => {
            const actionId = uidPool.shift();
            action.id = actionId;
            action.programRule = { id: programRuleUid };
            attributeActions.push(action);
            rule.programRuleActions.push({ id: actionId });
        });
    });

    return { attributeRules, attributeActions }
}

/**
 * 
 * @param {Array} scores : Data Elements linked to Scores section
 * @returns {Object} uniqueScores:Boolean , compositeScores:<Array>, duplicatedScores:<Array>
 */
export const checkScoresMWI = (scores) => {
    const compositeScores = scores.map(score => score.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value);
    const duplicatedScores = compositeScores.filter((composite, index) => compositeScores.indexOf(composite) !== index);
    return {
        uniqueScores: duplicatedScores.length == 0,
        compositeScores,
        duplicatedScores
    };
}

export const readQuestionCompositesMWI = (sections) => {
    var questionCompositeScores = [];
    sections.forEach(section => {
        section.dataElements.forEach(de => {
            const composite = de.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value?.split('.').slice(0, -1)
            if (composite) {

                composite.map((v, i) =>
                    //Create sub branches for each composite level [1,1] => [1 , 1.1]
                    composite.slice(0, i + 1).join('.')
                ).forEach(v => {
                    // Check if already included in the Array
                    if (!questionCompositeScores.includes(v)) { questionCompositeScores.push(v) }
                });
            }
        })
    });
    return questionCompositeScores.sort()
}

export const hideShowLogicMWI = (hideShowGroup, programId, uidPool) => {
    var hideShowRules = [], hideShowActions = [];

    Object.keys(hideShowGroup).forEach(parentCode => {
        Object.keys(hideShowGroup[parentCode]).forEach(answer => {

            // SHOW/HIDE WHEN....IS...
            const programRuleUid = uidPool.shift();
            const name = `PR - Show/Hide - Show when ${parentCode} is ${answer}`;

            const conditionValue = ["0", "1"].includes(String(answer)) ? answer : `"${answer.replaceAll("'", "")}"`

            const pr = {
                id: programRuleUid,
                name,
                description: '_Scripted',
                program: { id: programId },
                condition: `!d2:hasValue(#{${parentCode}}) || (#{${parentCode}}!=${conditionValue})`,
                programRuleActions: []
            };

            // MAKE FIELD MANDATORY WHEN....IS...
            const mfm_uid = uidPool.shift();
            const mfm_name = `PR - Make Field Mandatory - Make mandatory when ${parentCode} is ${answer}`;

            const pr_mfm = {
                id: mfm_uid,
                name: mfm_name,
                description: '_Scripted',
                program: { id: programId },
                condition: `d2:hasValue(#{${parentCode}}) && (#{${parentCode}}==${conditionValue})`,
                programRuleActions: []
            };

            hideShowGroup[parentCode][answer].forEach(de => {
                // Show/Hide Logic
                const actionId = uidPool.shift();

                const pra = {
                    id: actionId,
                    programRuleActionType: "HIDEFIELD",
                    dataElement: { id: de.id },
                    //content: `#{_CV_CriticalQuestions}`,
                    programRule: { id: programRuleUid }
                };

                pr.programRuleActions.push({ id: actionId });   // Add to Program Rule
                hideShowActions.push(pra);  // Add to global JSON

                // Make mandatory Logic
                if (de.mandatory == "Yes") {
                    const mandatoryActionId = uidPool.shift();
                    const pra_mandatory = {
                        id: mandatoryActionId,
                        programRuleActionType: "SETMANDATORYFIELD",
                        dataElement: { id: de.id },
                        programRule: { id: mfm_uid }
                    };

                    pr_mfm.programRuleActions.push({ id: mandatoryActionId });
                    hideShowActions.push(pra_mandatory);
                }
            });

            hideShowRules.push(pr);
            if (pr_mfm.programRuleActions.length > 0) { hideShowRules.push(pr_mfm) }

        });
    });

    return { hideShowRules, hideShowActions };
}

const labelsRulesLogicMWI = (hideShowLabels, programId, uidPool) => {
    var labelsRules = [], labelsActions = [];

    hideShowLabels.forEach(hsRule => {
        const programRuleUid = uidPool.shift();

        var pr = {
            id: programRuleUid,
            name: undefined,
            description: '_Scripted',
            program: { id: programId },
            condition: undefined,
            programRuleActions: []
        };

        if (hsRule.parent == "None") {
            pr.name = "PR - Assign labels text";
            pr.condition = `'true'`;
        } else {
            pr.name = `PR - Assign labels when ${hsRule.parent} is ${hsRule.condition}`;
            const conditionValue = ["0", "1"].includes(String(hsRule.condition)) ? hsRule.condition : `"${hsRule.condition.replaceAll("'", "")}"`
            pr.condition = `d2:hasValue(#{${hsRule.parent}}) && (#{${hsRule.parent}}==${conditionValue})`;
        }

        hsRule.actions.forEach(action => {

            const actionId = uidPool.shift();
            const pra = {
                id: actionId,
                programRuleActionType: "ASSIGN",
                data: "'" + action.text.replaceAll(/'/g, "’") + "'",
                dataElement: { id: action.id },
                programRule: { id: programRuleUid }
            };

            pr.programRuleActions.push({ id: actionId });
            labelsActions.push(pra);
        });

        labelsRules.push(pr);
    });

    return { labelsRules, labelsActions };
};

/**
 * 
 * @param {Array} sections : Sections that contains questions ONLY
 * @param {Array} compositeScores : List of composite scores [1,2,2.1,...]
 * @param {String} programId 
 * @param {String} useCompetencyClass: Flag to include or not the competency class realated items
 * @returns {Array} programRuleVariables: <Array>{name,programRuleVariableSourceType,useCodeForOptionSet,program,|dataElement|}
 */
export const buildProgramRuleVariablesMWI = ({ sections, programId, uidPool }) => {
    // const criticalStepCalculations = sections.find(s => s.name == "Critical Step Calculations");
    // const scores = sections.find(s => s.name == "Scores");
    // sections = sections.filter(s => s.name != "Scores" && s.name != "Critical Steps Calculations");

    const programRuleVariables = [];
    const dataElementVarMapping = {};
    let secIdx = 0;
    let deIdx = 1;

    // Data Elements Variables
    sections.forEach(section => {
        if (section.name.match(/Section \d+ : /)) {
            secIdx += 1;
            deIdx = 1;
        }
        section.dataElements.forEach(dataElement => {
            let name;

            if (!dataElement.code?.match(/MWI_AP_DE/)) {
                name = `_S${padValue(secIdx, "00")}E${padValue(deIdx, "000")}`;
                deIdx += 1;
            } else {
                name = `_GEN_${dataElement.formName}`;
            }

            dataElementVarMapping[dataElement.id] = name;
            programRuleVariables.push({
                id: uidPool.shift(),
                name,
                programRuleVariableSourceType: "DATAELEMENT_CURRENT_EVENT",
                useCodeForOptionSet: dataElement.optionSet?.id ? true : false,
                program: { id: programId },
                dataElement: { id: dataElement.id }
            });
        });
    });

    return { programRuleVariables, dataElementVarMapping };
}

const buildScoringRulesMWI = (
    { sections, criterionRulesGroup, dataElementVarMapping, programId, uidPool }
) => {

    const scoringRules = [];
    const scoringRuleActions = [];

    sections.forEach(section => {
        if (!criterionRulesGroup[section.id]) { return; }
        
        const parentDataElements = criterionRulesGroup[section.id].parentDataElements;
        const hasValueSting = parentDataElements.map(de => `d2:hasValue(#{${dataElementVarMapping[de.id]}})`).join(' && ');
        const questionsSum = parentDataElements.map(de => `#{${dataElementVarMapping[de.id]}}`).join('+');
        const questionsCountIfValue = parentDataElements.map(de => `(1-d2:countIfValue(#{${dataElementVarMapping[de.id]}}, 0))`).join('+');

        // [NA, Compliant, Non-Compliant, Partially Compliant]
        const scoringFilter = [
            {
                condition: `(${hasValueSting}) && (${questionsCountIfValue}) == 0`,
                data: '0',
                tag: 'NA'
            },
            {
                condition: `(${hasValueSting}) && ((${questionsSum})/(${questionsCountIfValue})) == 1`,
                data: '100',
                tag: 'C'
            },
            {
                condition: `(${hasValueSting}) && ((${questionsSum})/(${questionsCountIfValue})) == -1`,
                data: '5',
                tag: 'NC'
            },
            {
                condition: `(${hasValueSting}) && (${questionsCountIfValue}) > 0 && ((${questionsSum})/(${questionsCountIfValue})) > -1 && ((${questionsSum})/(${questionsCountIfValue})) < 1`,
                data: '45',
                tag: 'PC'
            },
        ];

        scoringFilter.forEach(f => {
            const programRuleUid = uidPool.shift();
            const name = `PR - Scoring - Criterion ${criterionRulesGroup[section.id].criterionNumber} - ${f.tag}`;

            const prActionStatus = {
                id: uidPool.shift(),
                programRuleActionType: "ASSIGN",
                data: f.data,
                dataElement: { id: criterionRulesGroup[section.id].criterionStatus.id },
                programRule: { id: programRuleUid }
            };

            const prActionScore = {
                id: uidPool.shift(),
                programRuleActionType: "ASSIGN",
                data: f.data,
                dataElement: { id: criterionRulesGroup[section.id].criterionScore.id },
                programRule: { id: programRuleUid }
            };

            //TODO: Add hide/show logic for the action plan data elements

            const pr = {
                id: programRuleUid,
                name,
                description: '_Scripted',
                program: { id: programId },
                condition: f.condition,
                programRuleActions: [prActionStatus, prActionScore]
            };

            scoringRules.push(pr);
            scoringRuleActions.push(prActionStatus, prActionScore);

        });

    });

    return { scoringRules, scoringRuleActions }
}

export const buildProgramRulesMWI = (
    { sections, programRuleVariables, dataElementVarMapping, stageId, programId, uidPool, healthArea = "FP" }
) => {

    let programRules = [];
    let programRuleActions = [];
    const hideShowGroup = {};
    const criterionRulesGroup = {};
    const hideShowLabels = [{ parent: 'None', condition: 'true', actions: [] }];

    const varNameRef = sections.map(sec => sec.dataElements.map(de => {
        const metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === METADATA)?.value || "{}")
        return { id: de.id, varName: metadata.varName }
    })).flat();

    //Create Tree Object for Scoring PRs
    sections.forEach(section => {
        if (section.name.match(/> > Criterion \d+(\.\d+)*.*/) && !criterionRulesGroup[section.id]) {
            criterionRulesGroup[section.id] = {
                criterionNumber: section.name.match(/(\d+(\.\d+)*)/)[0],
                parentDataElements: [],
                criterionStatus: {},
                criterionScore: {},
                actionPlanDataElements: []
            };
        }
        
        section.dataElements.forEach(dataElement => {
            //const order = dataElement.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value;

            const metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");

            // Get parents hide/show logic
            if (dataElement.code?.match(/MWI_AP_DE1/)) {
                criterionRulesGroup[section.id].criterionStatus = { id: dataElement.id, code: dataElement.code };
            } else if (dataElement.code?.match(/MWI_AP_DE2/)) {
                criterionRulesGroup[section.id].criterionScore = { id: dataElement.id, code: dataElement.code };
            } else if (dataElement.code?.match(/MWI_AP_DE[3-6]/)) {
                criterionRulesGroup[section.id].actionPlanDataElements.push({ id: dataElement.id, mandatory: true });
            }

            if (metadata.elemType === 'question') {
                criterionRulesGroup[section.id]?.parentDataElements.push({ id: dataElement.id, code: dataElement.code })
            }
            
            if (metadata.parentQuestion !== undefined && metadata.parentValue !== undefined) {
                const parentQuestion = varNameRef.find(de => de.id === String(metadata.parentQuestion)).varName;
                const parentValue = String(metadata.parentValue);


                !hideShowGroup[parentQuestion] ? hideShowGroup[parentQuestion] = {} : undefined;
                !hideShowGroup[parentQuestion][parentValue] ? hideShowGroup[parentQuestion][parentValue] = [] : undefined;
                !hideShowGroup[parentQuestion][parentValue].push({ id: dataElement.id, mandatory: metadata.isCompulsory });
            
                
                if (metadata.labelFormName) {
                    let hsIdx = hideShowLabels.findIndex(hs => hs.parent == parentQuestion && hs.condition == parentValue);
                    if (hsIdx == -1) {
                        // CREATE
                        hideShowLabels.push({
                            parent: parentQuestion,
                            condition: parentValue,
                            actions: []
                        });
                        hsIdx = hideShowLabels.length - 1;
                    }
                    hideShowLabels[hsIdx].actions.push({ id: dataElement.id, text: metadata.labelFormName.replaceAll("\"", "'") });
                }
            } else if (metadata.labelFormName) {
                hideShowLabels[0].actions.push({ id: dataElement.id, text: metadata.labelFormName.replaceAll("\"", "'") });
            }
            
        });
    });

    const { scoringRules, scoringRuleActions } = buildScoringRulesMWI({
        sections,
        criterionRulesGroup,
        dataElementVarMapping,
        programId,
        uidPool
    });

    // Attributes

    const { attributeRules, attributeActions } = buildAttributesRulesMWI(programId, uidPool, healthArea); //Define: useCompetencyClass & healthArea

    // Hide/Show Logic

    const { hideShowRules, hideShowActions } = hideShowLogicMWI(hideShowGroup, programId, uidPool);

    // Labels Assign

    const { labelsRules, labelsActions } = labelsRulesLogicMWI(hideShowLabels, programId, uidPool);

    programRules = programRules.concat(
        scoringRules,
        attributeRules,
        hideShowRules,
        labelsRules
    );

    programRuleActions = programRuleActions.concat(
        scoringRuleActions,
        attributeActions,
        hideShowActions,
        labelsActions
    );

    return { programRules, programRuleActions }
}

export const buildProgramIndicatorsMWI = ({ programId, programStage, uidPool, sharingSettings, PIAggregationType }) => {

    const programShortName = programStage.program.shortName;

    // This sectin is for the local analytics
    /*const indicatorValues = useCompetency === "Yes" ? [
        { name: 'C', condition: `A{${COMPETENCY_ATTRIBUTE}} == "competent"` },
        { name: 'CNI', condition: `A{${COMPETENCY_ATTRIBUTE}} == "improvement"` },
        { name: 'NC', condition: `A{${COMPETENCY_ATTRIBUTE}} == "notcompetent"` }
    ] : [
        { name: 'A', condition: `#{${programStage.id}.${mainScoreDataElement}} >= 80.0` },
        { name: 'B', condition: `#{${programStage.id}.${mainScoreDataElement}} < 80.0 && #{${programStage.id}.${mainScoreDataElement}} >= 50.0` },
        { name: 'C', condition: `#{${programStage.id}.${mainScoreDataElement}} < 50.0` }
    ];
    const nameComp = useCompetency === "Yes" ? "Competency" : "QoC";

    const indicatorIDs = []

    let programIndicators = indicatorValues.map(value => {
        const result = DeepCopy(ProgramIndicatorTemplate)
        result.id = uidPool.shift()
        indicatorIDs.push(result.id)
        result.name = programShortName + " - " + nameComp + " - " + value.name
        result.shortName = nameComp + ' - ' + value.name + ' [' + programId + ']'
        result.program.id = programId
        result.sharing = sharingSettings
        result.analyticsPeriodBoundaries[0].sharing = sharingSettings
        result.analyticsPeriodBoundaries[1].sharing = sharingSettings
        result.filter = value.condition
        return result
    })

    // Global  Analytics - Number of Assesments & Global Score

    const AnalyticNoA = DeepCopy(ProgramIndicatorTemplateNoA)
    AnalyticNoA.id = uidPool.shift()
    indicatorIDs.push(AnalyticNoA.id)
    AnalyticNoA.name = programShortName + ' - Number of Assessments'
    AnalyticNoA.shortName = 'Number of Assessments [' + programId + ']'
    AnalyticNoA.program.id = programId
    AnalyticNoA.sharing = sharingSettings
    AnalyticNoA.analyticsPeriodBoundaries[0].sharing = sharingSettings
    AnalyticNoA.analyticsPeriodBoundaries[1].sharing = sharingSettings

    const AnalyticGS = DeepCopy(ProgramIndicatorTemplateGS)
    AnalyticGS.id = uidPool.shift()
    indicatorIDs.push(AnalyticGS.id)
    AnalyticGS.name = `Global Score [${programId}]`
    AnalyticGS.shortName = `Global Score [${programId}]`
    AnalyticGS.expression = `#{${programStage.id}.${mainScoreDataElement}}`
    AnalyticGS.program.id = programId
    AnalyticGS.sharing = sharingSettings
    AnalyticGS.analyticsPeriodBoundaries[0].sharing = sharingSettings
    AnalyticGS.analyticsPeriodBoundaries[1].sharing = sharingSettings
    AnalyticGS.aggregationType = (PIAggregationType && PIAggregationType !== 'AVERAGE') ? PIAggregationType : 'AVERAGE'

    programIndicators = programIndicators.concat([AnalyticNoA, AnalyticGS])*/

    //Return
    //return { programIndicators, indicatorIDs, gsInd: AnalyticGS.id }
    return {}
}

export const buildH2BaseVisualizationsMWI = ({ a/*programId, programShortName, gsInd, indicatorIDs, uidPool, currentDashboardId, userOU, ouRoot, sharingSettings, visualizationLevel, mapLevel*/}) => {
    //const series = []
    //const dataDimensionItems = []
    const visualizations = []
    const eventReports = []
    const androidSettingsVisualizations = []
    const maps = []
    //const dashboardItems = []
    const dashboards = []

    //Return
    return { visualizations, maps, androidSettingsVisualizations, dashboards, eventReports }
}
