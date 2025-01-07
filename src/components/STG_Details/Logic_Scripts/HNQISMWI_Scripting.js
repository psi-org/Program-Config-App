import { MWIProgramIndicatorTemplate, } from "../../../configs/AnalyticsTemplates.js";
import { ASSESSMENT_DATE_ATTRIBUTE, ASSESSMENT_PERIOD_ATTRIBUTE, FEEDBACK_ORDER, HEALTH_AREA_ATTRIBUTE, METADATA, ORGANISATION_UNIT_ATTRIBUTE, PERIOD_END_ATTRIBUTE, PERIOD_START_ATTRIBUTE } from "../../../configs/Constants.js";
import { DeepCopy, getSectionType, isCriterionDE1, isCriterionDE2, isCriterionDE3, isCriterionDE3To6, isCriterionDEGenerated, padValue } from "../../../utils/Utils.js";

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
                    trackedEntityAttribute: { id: HEALTH_AREA_ATTRIBUTE }
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
                    trackedEntityAttribute: { id: ASSESSMENT_DATE_ATTRIBUTE }
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
                    trackedEntityAttribute: { id: ORGANISATION_UNIT_ATTRIBUTE }
                }
            ]
        },
        {
            name: "PR - Attributes - Assign Reporting Period",
            displayName: "PR - Attributes - Assign Reporting Period",
            condition: "true",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "d2:concatenate( A{_periodStart}, ' - ',A{_periodEnd})",
                    programRuleActionType: "ASSIGN",
                    trackedEntityAttribute: { id: ASSESSMENT_PERIOD_ATTRIBUTE }
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

export const hideShowLogicMWI = ({ hideShowGroup, programId, stageId, uidPool }) => {
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
                programStage: { id: stageId },
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

const labelsRulesLogicMWI = ({ hideShowLabels, programId, stageId, uidPool }) => {
    var labelsRules = [], labelsActions = [];

    hideShowLabels.forEach(hsRule => {
        const programRuleUid = uidPool.shift();

        var pr = {
            id: programRuleUid,
            name: undefined,
            description: '_Scripted',
            program: { id: programId },
            programStage: { id: stageId },
            condition: undefined,
            programRuleActions: []
        };

        if (hsRule.parent == "None") {
            pr.name = "PR - Assign labels text";
            pr.condition = `true`;
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

    const programRuleVariables = [
        {
            id: uidPool.shift(),
            name: "_periodStart",
            programRuleVariableSourceType: "TEI_ATTRIBUTE",
            program: { id: programId },
            trackedEntityAttribute: { id: PERIOD_START_ATTRIBUTE }
        },
        {
            id: uidPool.shift(),
            name: "_periodEnd",
            programRuleVariableSourceType: "TEI_ATTRIBUTE",
            program: { id: programId },
            trackedEntityAttribute: { id: PERIOD_END_ATTRIBUTE }
        }
    ];
    const dataElementVarMapping = {};
    let secIdx = 0;
    let deIdx = 1;

    // Data Elements Variables
    sections.forEach(section => {
        if( getSectionType(section) === "Section" ) {
        // if (section.name.match(/Section \d+ : /)) {
            secIdx += 1;
            deIdx = 1;
        }
        section.dataElements.forEach(dataElement => {
            let name;

            // if (!dataElement.code?.match(/MWI_AP_DE/)) {
            if( !isCriterionDEGenerated(dataElement) ) {
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
    { sections, criterionRulesGroup, dataElementVarMapping, programId, stageId, uidPool }
) => {

    const scoringRules = [];
    const scoringRuleActions = [];

    sections.forEach(section => {
        if (!criterionRulesGroup[section.id]) { return; }

        const parentDataElements = criterionRulesGroup[section.id].parentDataElements;
        const actionPlanDataElements = criterionRulesGroup[section.id].actionPlanDataElements;

        const hasValueSting = parentDataElements.map(de => `d2:hasValue(#{${dataElementVarMapping[de.id]}})`).join(' && ');
        const questionsSum = parentDataElements.map(de => `d2:countIfValue(#{${dataElementVarMapping[de.id]}},1)`).join('+');
        const questionsCountIfValue = parentDataElements.map(de => `(1-d2:countIfValue(#{${dataElementVarMapping[de.id]}}, -1))`).join('+');

        // [NA, Compliant, Non-Compliant, Partially Compliant]
        const scoringFilter = [
            {
                condition: `(${hasValueSting}) && (${questionsCountIfValue}) == 0`,
                data: '0',
                tag: 'NA'
            },
            {
                condition: `(${hasValueSting}) && ((${questionsSum})/(${questionsCountIfValue})) >= 0.8`,
                data: '100',
                tag: 'C'
            },
            {
                condition: `(${hasValueSting}) && ((${questionsSum})/(${questionsCountIfValue})) < 0.4`,
                data: '5',
                tag: 'NC'
            },
            {
                condition: `(${hasValueSting}) && (${questionsCountIfValue}) > 0 && ((${questionsSum})/(${questionsCountIfValue})) >= 0.4 && ((${questionsSum})/(${questionsCountIfValue})) < 0.8`,
                data: '45',
                tag: 'PC'
            },
        ];

        const prActionPlanId = uidPool.shift();
        const prActionPlan = {
            id: prActionPlanId,
            name: `PR - Hide/Show Action Plan - Criterion ${criterionRulesGroup[section.id].criterionNumber}`,
            description: '_Scripted',
            program: { id: programId },
            programStage: { id: stageId },
            condition: `!(${hasValueSting})`,
            programRuleActions: actionPlanDataElements.map(de => {
                const hideAction = {
                    id: uidPool.shift(),
                    programRuleActionType: "HIDEFIELD",
                    dataElement: { id: de.id },
                    programRule: { id: prActionPlanId }
                };

                scoringRuleActions.push(hideAction);
                return hideAction;
            })
        };
        scoringRules.push(prActionPlan);

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

            //TODO: Add hide/show logic for the action plan data elements when no value is selected
            const additionalActions = [];
            actionPlanDataElements.forEach(de => {
                if (['0', '100'].includes(f.data)) {
                    if (de.alwaysDisplay) {
                        return;
                    }
                    const hideAction = {
                        id: uidPool.shift(),
                        programRuleActionType: "HIDEFIELD",
                        dataElement: { id: de.id },
                        programRule: { id: programRuleUid }
                    };
                    scoringRuleActions.push(hideAction);
                    additionalActions.push(hideAction);
                    return;
                }
                const mandatoryAction = {
                    id: uidPool.shift(),
                    programRuleActionType: "SETMANDATORYFIELD",
                    dataElement: { id: de.id },
                    programRule: { id: programRuleUid }
                };
                scoringRuleActions.push(mandatoryAction);
                additionalActions.push(mandatoryAction);
            });

            const pr = {
                id: programRuleUid,
                name,
                description: '_Scripted',
                program: { id: programId },
                programStage: { id: stageId },
                condition: f.condition,
                programRuleActions: [prActionStatus, prActionScore, ...additionalActions]
            };

            scoringRules.push(pr);
            scoringRuleActions.push(prActionStatus, prActionScore);

        });

    });

    return { scoringRules, scoringRuleActions }
}

export const buildProgramRulesMWI = (
    { programStage, sections, dataElementVarMapping, programId, uidPool, healthArea = "FP" }
) => {

    let programRules = [];
    let programRuleActions = [];
    const questionsList = [];
    const hideShowGroup = {};
    const criterionRulesGroup = {};
    const hideShowLabels = [{ parent: 'None', condition: 'true', actions: [] }];
    const stageId = programStage.id;

    const varNameRef = sections.map(sec => sec.dataElements.map(de => {
        const metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === METADATA)?.value || "{}")
        return { id: de.id, varName: metadata.varName }
    })).flat();

    //Create Tree Object for Scoring PRs
    sections.forEach(section => {
        if (section.name.match(/> > Criterion \d+(\.\d+)*.*/) && !criterionRulesGroup[section.id]) {
            criterionRulesGroup[section.id] = {
                criterionNumber: section.name.match(/(\d+(\.\d+)*)/)[0],
                isCritical: section.description === "*",
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
            if (isCriterionDE1(dataElement)) {
                criterionRulesGroup[section.id].criterionStatus = { id: dataElement.id, code: dataElement.code };
            } else if (isCriterionDE2(dataElement)) {
                criterionRulesGroup[section.id].criterionScore = { id: dataElement.id, code: dataElement.code };
            } else if (isCriterionDE3To6(dataElement)) {
                criterionRulesGroup[section.id].actionPlanDataElements.push({
                    id: dataElement.id,
                    mandatory: true,
                    alwaysDisplay: isCriterionDE3(dataElement) ? true : false
                });
            }

            if (metadata.elemType === 'question') {
                criterionRulesGroup[section.id]?.parentDataElements.push({ id: dataElement.id, code: dataElement.code })
                questionsList.push(dataElement.id);
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
        stageId,
        uidPool
    });

    // Attributes
    const { attributeRules, attributeActions } = buildAttributesRulesMWI(programId, uidPool, healthArea);
    
    // Hide/Show Logic
    const { hideShowRules, hideShowActions } = hideShowLogicMWI({ hideShowGroup, programId, stageId, uidPool });
    
    // Labels Assign
    const { labelsRules, labelsActions } = labelsRulesLogicMWI({ hideShowLabels, programId, stageId, uidPool });

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

    return { programRules, programRuleActions, criterionRulesGroup, questionsList }
}

const setIndicatorCommonSettings = (indicator, programId, settings) => {
    indicator.program.id = programId;
    indicator.sharing = settings.sharingSettings;
    indicator.analyticsPeriodBoundaries[0].sharing = settings.sharingSettings;
    indicator.analyticsPeriodBoundaries[1].sharing = settings.sharingSettings;
    indicator.aggregationType = settings.PIAggregationType || 'AVERAGE';
}

export const buildProgramIndicatorsMWI = (
    { programStage, criterionRulesGroup, questionsList, uidPool, sharingSettings, PIAggregationType }
) => {

    //const programShortName = programStage.program.shortName;
    const criterions = Object.keys(criterionRulesGroup);
    const criticalCriterions = criterions.filter(criterion => criterionRulesGroup[criterion].isCritical);

    const indicatorIDs = [];
    const programIndicators = [];

    const indicatorSettings = [
        {
            indicatorName: 'MoH Compliant',
            expression: criterions.map(section => `d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},100)`).join('+')
        },
        {
            indicatorName: 'MoH Critical Criteria',
            expression: (criticalCriterions.length > 0)?criticalCriterions.map(section => `d2:count(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}})`).join('+'):'0'
        },
        {
            indicatorName: 'MoH Critical Criteria Achieved',
            expression: (criticalCriterions.length > 0)?criticalCriterions.map(section => `d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},100)`).join('+'):'0'
        },
        {
            indicatorName: 'MoH Non-Compliant',
            expression: criterions.map(section => `d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},5)`).join('+')
        },
        {
            indicatorName: 'MoH Not Applicable',
            expression: criterions.map(section => `d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},0)`).join('+')
        },
        {
            indicatorName: 'MoH Partially Compliant',
            expression: criterions.map(section => `d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},45)`).join('+')
        },
        {
            indicatorName: 'MoH Score',
            expression: `(${criterions.map(section => `#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}}`).join('+')})/(${criterions.map(section => `(1-d2:countIfValue(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}},0))`).join('+')})`
        },
        {
            indicatorName: 'MoH Total Criteria',
            expression: criterions.map(section => `d2:count(#{${programStage.id}.${criterionRulesGroup[section].criterionScore.id}})`).join('+')
        },
        {
            indicatorName: 'MoH Total MOV',
            expression: questionsList.map(question => `d2:count(#{${programStage.id}.${question}})`).join('+')
        }
    ];

    indicatorSettings.forEach(settings => {
        const indicator = DeepCopy(MWIProgramIndicatorTemplate);
        indicator.id = uidPool.shift();
        indicator.name = `${settings.indicatorName} [${programStage.program.id}]`;
        indicator.shortName = `${settings.indicatorName} [${programStage.program.id}]`;
        indicator.expression = settings.expression;
        setIndicatorCommonSettings(indicator, programStage.program.id, { sharingSettings, PIAggregationType });
        indicatorIDs.push(indicator.id);
        programIndicators.push(indicator);
    });

    return { programIndicators, indicatorIDs }
}

export const buildH2BaseVisualizationsMWI = ({ a/*programId, programShortName, gsInd, indicatorIDs, uidPool, currentDashboardId, userOU, ouRoot, sharingSettings, visualizationLevel, mapLevel*/ }) => {
    //const series = []
    //const dataDimensionItems = []
    console.log(a);
    const visualizations = []
    const eventReports = []
    const androidSettingsVisualizations = []
    const maps = []
    //const dashboardItems = []
    const dashboards = []

    //Return
    return { visualizations, maps, androidSettingsVisualizations, dashboards, eventReports }
}
