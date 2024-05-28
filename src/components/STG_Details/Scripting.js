import { ProgramIndicatorTemplate, compLastSixMonthsByOUTable, compLastSixMonthsPie, compLastSixMonthsTable, ProgramIndicatorTemplateNoA, ProgramIndicatorTemplateGS, AverageScoreByDistrictByPivotTable, NumberOfAssessmentByPivotTable, AverageGlobalScoreByColumn, AssessmentByCompetencyByColumn, GlobalScoreByMap, LineListGlobalScore, dashboardsTemplate, dashVisualization, dashMap, dashEventReport } from "../../configs/AnalyticsTemplates.js";
import { FEEDBACK_ORDER, METADATA, COMPETENCY_ATTRIBUTE, GLOBAL_SCORE_ATTRIBUTE, ACTION_PLAN_ACTION, VISUALIZATIONS_LEGEND, NON_CRITICAL_STEPS, CRITICAL_STEPS } from "../../configs/Constants.js";
import { DeepCopy, padValue } from "../../utils/Utils.js";

/**
 * 
 * @param {Object} question : { subLevels: <Array> ,prgVarName: STRING,scoreNum: NUMBER, scoreDen: NUMBER,isCritical: STRING [Yes,No] }
 * @param {Object} branch : scoreMap __ Init as --> { childs: [] }
 * @description Allocates each feadback order / composite score in an Object (tree structure) that stores all questions for each leaf
 */
const locateInTree = (question, branch) => {
    const subLevels = question.subLevels.length;
    if (subLevels > 1) {
        const currentOrder = question.subLevels.shift();
        let subOrder;
        subOrder = branch.childs.find(s => s.order == currentOrder);
        if (!subOrder) {
            subOrder = { order: currentOrder };
            (subLevels > 2) ? subOrder.childs = [] : subOrder.questions = [];
            branch.childs.push(subOrder);
        }
        locateInTree(question, subOrder);
    } else if (subLevels == 1) {
        /*question.order = */question.subLevels.shift();
        delete question.subLevels;
        branch.questions.push(question);
    }
}

/**
 * 
 * @param {Object} branch : Init as: scoreMap __ Object (Tree) that contains allocated questions
 * @returns {<Array>} : expressions for [critical Numerator, critical Denominator, non critical numerator, non critical denominator ]
 * @description: Create score expressions for each scoreMap level (composite score)
 */
const buildScores = (branch) => {
    const numC = [];
    const numN = [];
    const denC = [];
    const denN = [];

    if (branch.questions) {
        branch.questions.forEach((a) => {
            if (a.prgVarName) {
                const num = `#{${a.prgVarName}}*${a.scoreNum}`;
                const den = `d2:countIfZeroPos('${a.prgVarName}')*${a.scoreDen}`;
                if (a.isCritical == "Yes") {
                    numC.push(num);
                    denC.push(den);
                } else {
                    numN.push(num);
                    denN.push(den);
                }
            }
        });
        branch.numC = numC.filter(e => e != "").join('+');
        branch.denC = denC.filter(e => e != "").join('+');
        branch.numN = numN.filter(e => e != "").join('+');
        branch.denN = denN.filter(e => e != "").join('+');
        return [branch.numC, branch.denC, branch.numN, branch.denN];
    } else {
        branch.childs.forEach(subBranch => {
            const res = buildScores(subBranch);
            numC.push(res[0]);
            denC.push(res[1]);
            numN.push(res[2]);
            denN.push(res[3]);
        });
        let tmp;

        tmp = numC.filter(e => e != "");
        branch.numC = tmp.length > 0 ? "(" + tmp.join('+') + ")" : "";

        tmp = denC.filter(e => e != "");
        branch.denC = tmp.length > 0 ? "(" + tmp.join('+') + ")" : "";

        tmp = numN.filter(e => e != "");
        branch.numN = tmp.length > 0 ? "(" + tmp.join('+') + ")" : "";

        tmp = denN.filter(e => e != "");
        branch.denN = tmp.length > 0 ? "(" + tmp.join('+') + ")" : "";

        return [branch.numC, branch.denC, branch.numN, branch.denN];
    }
}

/**
 * 
 * @param {Object} composite : subLevels, feedbackOrder, formName, prgVarName, uid
 * @param {Object} branch : scoreMap - contains Scores Expressions
 * @param {String} programId 
 * @param {Array} uidPool : available uids , will be used on relationship ProgramRule <- ProgramRuleAction
 * @returns {Object}: scorePRs , scorePRAs for the current composite score
 */
const getScorePR = (composite, branch, programId, stageId, uidPool) => {

    //      Breakpoint: No more IDs available
    if (uidPool.length == 0) { return { scorePRs: [], scorePRAs: [] } }

    const currentOrder = composite.subLevels.shift();
    if (currentOrder && composite.subLevels.length >= 0) {

        branch = branch.childs.find(s => s.order == currentOrder);
        return getScorePR(composite, branch, programId, stageId, uidPool);                // Output {scorePRs , scorePRAs}
    } else {
        if (branch) {     // Composite Score HAS scoring questions
            /**
             * Creating PR for Scores - Two steps:
             * 1- ASSIGN DATA to CALCULATED VALUE
             * 2- ASSIGN CALCULATED VALUE to DATA ELEMENT
             */

            let programRuleUid, actionId, name, data;
            const programRuleActionType = "ASSIGN";

            // STEP 1 -
            const num = [branch.numC, branch.numN].filter(n => n != "").join("+");
            const den = [branch.denC, branch.denN].filter(n => n != "").join("+");
            data = `(((${num}) * 100) / (${den}))*100`;
            name = `PR - Calculated - ${composite.feedbackOrder} ${composite.formName}`;
            programRuleUid = uidPool.shift();
            actionId = uidPool.shift();

            const pr_s1 = {
                id: programRuleUid,
                name: name,
                description: "_Scripted",
                program: { id: programId },
                //programStage : {id : stageId},
                condition: "true",
                priority: 1,
                programRuleActions: [{ id: actionId }]
            };

            const pra_s1 = {
                id: actionId,
                programRuleActionType: programRuleActionType,
                data,
                content: `#{_CV${composite.prgVarName}}`,
                programRule: { id: programRuleUid }
            };

            // STEP 2 -

            name = `PR - Score - [${composite.feedbackOrder}] ${composite.formName} (%)`;
            programRuleUid = uidPool.shift();
            actionId = uidPool.shift();
            data = `d2:round(#{_CV${composite.prgVarName}})/100`;

            const pr_s2 = {
                id: programRuleUid,
                name: name,
                description: "_Scripted",
                program: { id: programId },
                programStage: { id: stageId },
                condition: `d2:hasValue('_CV${composite.prgVarName}')`,
                programRuleActions: [{ id: actionId }]
            };

            const pra_s2 = {
                id: actionId,
                programRuleActionType: programRuleActionType,
                data,
                dataElement: { id: composite.uid },
                programRule: { id: programRuleUid }
            };

            return { scorePRs: [pr_s1, pr_s2], scorePRAs: [pra_s1, pra_s2] }

        } else { // Composite Score DOESN'T HAVE scoring questions
            const data = `''`;
            const name = `PR - Score - [${composite.feedbackOrder}] ${composite.formName} (%)`;
            const programRuleActionType = "ASSIGN";

            const programRuleUid = uidPool.shift();
            const actionId = uidPool.shift();

            const pr = {
                id: programRuleUid,
                name: name,
                description: "_Scripted",
                program: { id: programId },
                programStage: { id: stageId },
                condition: "true",
                programRuleActions: [{ id: actionId }]
            };

            const pra = {
                id: actionId,
                programRuleActionType: programRuleActionType,
                data,
                dataElement: { id: composite.uid },
                programRule: { id: programRuleUid }
            };

            return { scorePRs: [pr], scorePRAs: [pra] }
        }
    }
}

/**
 * 
 * @param {*} branch : scoring map - root level will be used
 * @param {*} programId 
 * @param {*} uidPool : available uids , will be used on relationship ProgramRule <- ProgramRuleAction
 * @returns {Object} : { rules : <Array> , actions : <Array> }
 */
const buildCriticalScore = (branch, stageId, programId, uidPool) => {
    const num = (branch.numC != "" ? branch.numC : undefined);
    const den = (branch.denC != "" ? branch.denC : undefined);

    /**
     * Two Steps Assign
     * 1- From data to Calculated Value
     * 2- From Calculated Value to Data Element
     */

    const programRuleActionType = "ASSIGN";
    let programRuleUid, actionId, name, data;

    // STEP 1- 
    programRuleUid = uidPool.shift();
    actionId = uidPool.shift();
    name = `PR - Calculated - Critical Questions`;
    data = (num && den) ? `((${num}) * 100) / (${den})` : `100`;

    const pr_s1 = {
        id: programRuleUid,
        name,
        description: "_Scripted",
        program: { id: programId },
        //programStage : {id : stageId},
        condition: "true",
        priority: 1,
        programRuleActions: [{ id: actionId }]
    };

    const pra_s1 = {
        id: actionId,
        programRuleActionType,
        data,
        content: `#{_CV_CriticalQuestions}`,
        programRule: { id: programRuleUid }
    };

    // STEP 2-
    programRuleUid = uidPool.shift();
    actionId = uidPool.shift();
    name = `PR - Score - Critical Questions (%)`;

    const pr_s2 = {
        id: programRuleUid,
        name,
        description: "_Scripted",
        program: { id: programId },
        programStage: { id: stageId },
        condition: `d2:hasValue('_CV_CriticalQuestions')`,
        programRuleActions: [{ id: actionId }]
    };

    data = `#{_CV_CriticalQuestions}`;
    const pra_s2 = {
        id: actionId,
        programRuleActionType,
        data,
        dataElement: { id: 'VqBfZjZhKkU' },
        programRule: { id: programRuleUid }
    };

    return { rules: [pr_s1, pr_s2], actions: [pra_s1, pra_s2] }
}

/**
 * 
 * @param {*} branch : scoring map - root level will be used
 * @param {*} programId 
 * @param {*} uidPool : available uids , will be used on relationship ProgramRule <- ProgramRuleAction
 * @returns {Object}: { rules : <Array> , actions : <Array> }
 */
const buildNonCriticalScore = (branch, stageId, programId, uidPool) => {
    const num = (branch.numN != "" ? branch.numN : undefined);
    const den = (branch.denN != "" ? branch.denN : undefined);

    /**
     * Two Steps Assign
     * 1- From data to Calculated Value
     * 2- From Calculated Value to Data Element
     */

    const programRuleActionType = "ASSIGN";
    let programRuleUid, actionId, name, data;

    // STEP 1- 
    programRuleUid = uidPool.shift();
    actionId = uidPool.shift();
    name = `PR - Calculated - Non-Critical Questions`;
    data = (num && den) ? `((${num}) * 100) / (${den})` : `100`;

    const pr_s1 = {
        id: programRuleUid,
        name,
        description: "_Scripted",
        program: { id: programId },
        //programStage : {id : stageId},
        condition: "true",
        priority: 1,
        programRuleActions: [{ id: actionId }]
    };

    const pra_s1 = {
        id: actionId,
        programRuleActionType,
        data,
        content: `#{_CV_NonCriticalQuestions}`,
        programRule: { id: programRuleUid }
    };

    // STEP 2-
    programRuleUid = uidPool.shift();
    actionId = uidPool.shift();
    name = `PR - Score - Non-Critical Questions (%)`;
    data = `#{_CV_NonCriticalQuestions}`;

    const pr_s2 = {
        id: programRuleUid,
        name,
        description: "_Scripted",
        program: { id: programId },
        programStage: { id: stageId },
        condition: `d2:hasValue('_CV_NonCriticalQuestions')`,
        programRuleActions: [{ id: actionId }]
    };

    const pra_s2 = {
        id: actionId,
        programRuleActionType,
        data,
        dataElement: { id: 'pzWDtDUorBt' },
        programRule: { id: programRuleUid }
    };

    return { rules: [pr_s1, pr_s2], actions: [pra_s1, pra_s2] }
}

/**
 * 
 * @param {*} programId 
 * @param {*} uidPool 
 * @returns {Object} : { competencyRules : <Array> , competencyActions : <Array> }
 */
const buildCompetencyRules = (programId, stageId, uidPool) => {
    const competencyRules = [
        {
            name: "PR - Assign Competency - 'Competent but needs improvement'",
            condition: "#{_criticalNewest} == 100 && (#{_NoncriticalNewest}  <  89.9  &&  #{_NoncriticalNewest} >= 79.9)",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "'improvement'",
                    programRuleActionType: "ASSIGN",
                    dataElement: { id: "NAaHST5ZDTE" },
                }
            ]
        },
        {
            name: "PR - Assign Competency - 'Competent'",
            condition: "#{_criticalNewest} == 100 && #{_NoncriticalNewest} >= 89.9",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "'competent'",
                    programRuleActionType: "ASSIGN",
                    dataElement: { id: "NAaHST5ZDTE" }
                }
            ]
        },
        {
            name: "PR - Assign Competency - 'Not Competent'",
            condition: "#{_criticalNewest} < 100  || (#{_NoncriticalNewest}  < 79.9 && #{_NoncriticalNewest} >= 0)",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: "'notcompetent'",
                    programRuleActionType: "ASSIGN",
                    dataElement: { id: "NAaHST5ZDTE" }
                }
            ]
        }
    ];

    const competencyActions = [];

    competencyRules.forEach(rule => {
        const programRuleUid = uidPool.shift();

        rule.id = programRuleUid;
        rule.program.id = programId;
        rule.programStage = { id: stageId }

        const actions = rule.programRuleActions;
        rule.programRuleActions = [];

        actions.forEach(action => {
            const actionId = uidPool.shift();
            action.id = actionId;
            action.programRule = { id: programRuleUid };
            competencyActions.push(action);
            rule.programRuleActions.push({ id: actionId });
        });
    });

    return { competencyRules, competencyActions }
}

const buildAttributesRules = (programId, uidPool, useCompetencyClass = "Yes", healthArea) => {

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
        /*{
            name: "PR - Attributes - Assign Global Score",
            displayName: "PR - Attributes - Assign Global Score",
            condition: scoreMap.numC != "" ? "d2:hasValue(#{_criticalNewest})" : "d2:hasValue(#{_NoncriticalNewest})",
            program: { id: "" },
            description: "_Scripted",
            programRuleActions: [
                {
                    data: scoreMap.numC != "" ? "#{_criticalNewest}" : "#{_NoncriticalNewest}",
                    programRuleActionType: "ASSIGN",
                    trackedEntityAttribute: { id: "NQdpdST0Gcx" }
                }
            ]
        },*/
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

    if (useCompetencyClass == "Yes") {
        attributeRules.push({
            name: `PR - Attributes - CompClass `,
            displayName: `PR - Attributes - CompClass `,
            description: "_Scripted",
            condition: "!d2:hasValue(#{_criticalNewest}) || !d2:hasValue(#{_NoncriticalNewest})",
            program: { id: "" },
            programRuleActions: [
                {
                    programRuleActionType: "HIDEFIELD",
                    trackedEntityAttribute: { id: "ulU9KKgSLYe" }
                }
            ]
        });

        attributeRules.push(
            {
                name: "PR - Attributes - Assign Competency",
                displayName: "PR - Attributes - Assign Competency",
                condition: "d2:hasValue('_competencyNewest')",
                program: { id: "" },
                description: "_Scripted",
                programRuleActions: [
                    {
                        data: "#{_competencyNewest}",
                        programRuleActionType: "ASSIGN",
                        trackedEntityAttribute: { id: "ulU9KKgSLYe" }
                    }
                ]
            }
        );
    }

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
export const checkScores = (scores) => {
    const compositeScores = scores.map(score => score.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value);
    const duplicatedScores = compositeScores.filter((composite, index) => compositeScores.indexOf(composite) !== index);
    return {
        uniqueScores: duplicatedScores.length == 0,
        compositeScores,
        duplicatedScores
    };
}

export const readQuestionComposites = (sections) => {
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

export const hideShowLogic = (hideShowGroup, programId, uidPool) => {
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

const labelsRulesLogic = (hideShowLabels, programId, uidPool) => {
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
export const buildProgramRuleVariables = (sections, compositeScores, programId, useCompetencyClass = "Yes") => {
    // const criticalStepCalculations = sections.find(s => s.name == "Critical Step Calculations");
    // const scores = sections.find(s => s.name == "Scores");
    // sections = sections.filter(s => s.name != "Scores" && s.name != "Critical Steps Calculations");

    const programRuleVariables = [];

    // Data Elements Variables
    sections.forEach((section, secIdx) => {
        section.dataElements.forEach((dataElement, deIdx) => {
            programRuleVariables.push({
                name: `_S${padValue(secIdx + 1, "00")}Q${padValue(deIdx + 1, "000")}`,
                programRuleVariableSourceType: "DATAELEMENT_CURRENT_EVENT",
                useCodeForOptionSet: dataElement.optionSet?.id ? true : false,
                program: { id: programId },
                dataElement: { id: dataElement.id }
            });
        });
    });

    // Calculated Values
    compositeScores.forEach(cs => {
        programRuleVariables.push({
            name: `_CV_CS${cs}`,
            programRuleVariableSourceType: "CALCULATED_VALUE",
            useCodeForOptionSet: false,
            program: { id: programId }
        });
    });

    // Critical Steps Calculations
    const criticalVariables = [
        {
            name: "_NoncriticalNewest",
            programRuleVariableSourceType: "DATAELEMENT_NEWEST_EVENT_PROGRAM",
            program: { id: programId },
            dataElement: { id: NON_CRITICAL_STEPS }
        },
        {
            name: "_criticalNewest",
            programRuleVariableSourceType: "DATAELEMENT_NEWEST_EVENT_PROGRAM",
            program: { id: programId },
            dataElement: { id: CRITICAL_STEPS },
        },
        {
            name: "_CV_NonCriticalQuestions",
            programRuleVariableSourceType: "CALCULATED_VALUE",
            useCodeForOptionSet: "false",
            program: { id: programId }
        },
        {
            name: "_CV_CriticalQuestions",
            programRuleVariableSourceType: "CALCULATED_VALUE",
            useCodeForOptionSet: "false",
            program: { id: programId }
        }
    ];

    // Competency Class Variable  
    if (useCompetencyClass == "Yes") {
        criticalVariables.push(
            {
                name: "_competencyNewest",
                programRuleVariableSourceType: "DATAELEMENT_NEWEST_EVENT_PROGRAM",
                useCodeForOptionSet: true,
                program: { id: programId },
                dataElement: { id: "NAaHST5ZDTE" }
            }
        );
    }
    return programRuleVariables.concat(criticalVariables)
}

export const buildProgramRules = (sections, stageId, programId, compositeValues, scoresMapping, uidPool, useCompetencyClass = "Yes", healthArea = "FP", scoreMap = { childs: [] }) => {

    var programRules = [];
    var programRuleActions = [];
    var hideShowGroup = {};
    var hideShowLabels = [{ parent: 'None', condition: 'true', actions: [] }];

    const varNameRef = sections.map(sec => sec.dataElements.map(de => {
        const metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === 'haUflNqP85K')?.value || "{}")
        return { id: de.id, varName: metadata.varName }
    })).flat();

    //Create Tree Object for Scoring PRs
    sections.forEach((section, secIdx) => {
        section.dataElements.forEach((dataElement, deIdx) => {
            const order = dataElement.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value;

            const metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
            if (order && metadata.scoreNum && metadata.scoreDen) {
                locateInTree(
                    {
                        subLevels: order.split("."),
                        prgVarName: `_S${padValue(secIdx + 1, "00")}Q${padValue(deIdx + 1, "000")}`,
                        scoreNum: metadata.scoreNum,
                        scoreDen: metadata.scoreDen,
                        isCritical: metadata.isCritical
                    },
                    scoreMap
                )
            }

            // Get parents hide/show logic
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

    //Define Global Scores
    buildScores(scoreMap);

    // Request Program Rules for Composite Scores
    compositeValues.forEach(score => {
        const compositeData = {
            subLevels: score.split('.'),
            feedbackOrder: score,
            formName: scoresMapping[score].formName,
            prgVarName: '_CS' + score,
            uid: scoresMapping[score].id
        }
        const { scorePRs, scorePRAs } = getScorePR(compositeData, scoreMap, programId, stageId, uidPool);
        programRules = programRules.concat(scorePRs);
        programRuleActions = programRuleActions.concat(scorePRAs);
    });

    // Critical Calculations
    const criticalScore = buildCriticalScore(scoreMap, stageId, programId, uidPool);
    const nonCriticalScore = buildNonCriticalScore(scoreMap, stageId, programId, uidPool);

    // Competency Class

    const { competencyRules, competencyActions } = (useCompetencyClass == "Yes" ? buildCompetencyRules(programId, stageId, uidPool) : { competencyRules: [], competencyActions: [] });

    // Attributes

    const { attributeRules, attributeActions } = buildAttributesRules(programId, uidPool, useCompetencyClass, healthArea); //Define: useCompetencyClass & healthArea

    // Hide/Show Logic

    const { hideShowRules, hideShowActions } = hideShowLogic(hideShowGroup, programId, uidPool);

    // Labels Assign

    const { labelsRules, labelsActions } = labelsRulesLogic(hideShowLabels, programId, uidPool);

    programRules = programRules.concat(
        criticalScore.rules,
        nonCriticalScore.rules,
        competencyRules,
        attributeRules,
        hideShowRules,
        labelsRules
    );

    programRuleActions = programRuleActions.concat(
        criticalScore.actions,
        nonCriticalScore.actions,
        competencyActions,
        attributeActions,
        hideShowActions,
        labelsActions
    );

    return { programRules, programRuleActions, scoreMap }
}

export const buildProgramIndicators = (programId, programStage, scoreMap, uidPool, useCompetency, sharingSettings, PIAggregationType) => {

    const programShortName = programStage.program.shortName;
    // This sectin is for the local analytics
    const indicatorValues = useCompetency === "Yes" ? [
        { name: 'C', condition: `A{${COMPETENCY_ATTRIBUTE}} == "competent"` },
        { name: 'CNI', condition: `A{${COMPETENCY_ATTRIBUTE}} == "improvement"` },
        { name: 'NC', condition: `A{${COMPETENCY_ATTRIBUTE}} == "notcompetent"` }
    ] : [
        { name: 'A', condition: `A{${GLOBAL_SCORE_ATTRIBUTE}} >= 80.0` },
        { name: 'B', condition: `A{${GLOBAL_SCORE_ATTRIBUTE}} < 80.0 && A{${GLOBAL_SCORE_ATTRIBUTE}} >= 50.0` },
        { name: 'C', condition: `A{${GLOBAL_SCORE_ATTRIBUTE}} < 50.0` }
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
    AnalyticGS.expression = `#{${programStage.id}.${scoreMap.numC == "" ? NON_CRITICAL_STEPS : CRITICAL_STEPS}}`
    AnalyticGS.program.id = programId
    AnalyticGS.sharing = sharingSettings
    AnalyticGS.analyticsPeriodBoundaries[0].sharing = sharingSettings
    AnalyticGS.analyticsPeriodBoundaries[1].sharing = sharingSettings
    AnalyticGS.aggregationType = (PIAggregationType && PIAggregationType !== 'AVERAGE') ? PIAggregationType : 'AVERAGE'

    programIndicators = programIndicators.concat([AnalyticNoA, AnalyticGS])

    //Return
    return { programIndicators, indicatorIDs, gsInd: AnalyticGS.id }
}

export const buildH2BaseVisualizations = (programId, programShortName, { gsInd, indicatorIDs }, uidPool, useCompetency, currentDashboardId, userOU, ouRoot, stageId, sharingSettings, visualizationLevel, mapLevel, actionPlanID) => {
    const series = []
    const dataDimensionItems = []
    const visualizations = []
    const eventReports = []
    const androidSettingsVisualizations = []
    const maps = []
    const dashboardItems = []
    const dashboards = []

    const columnDimensions = []
    columnDimensions[0] = "pe"
    columnDimensions[1] = "ou"
    columnDimensions[2] = gsInd
    columnDimensions[3] = ACTION_PLAN_ACTION

    const timestamp = new Date().toISOString();
    const nameComp = useCompetency === "Yes" ? "Competency Classes" : "Quality of Care";

    indicatorIDs.forEach(indicator => {
        series.push({
            "dimensionItem": indicator,
            "axis": 0
        })
        dataDimensionItems.push({
            "dataDimensionItemType": "PROGRAM_INDICATOR",
            "programIndicator": { "id": indicator }
        })
    })

    //Competency Classes Pie Chart - (Last 6 months)
    const chart1 = DeepCopy(compLastSixMonthsPie)
    chart1.id = uidPool.shift()
    chart1.name = programShortName + " - " + nameComp + " Pie Chart - (Last 6 months)"
    chart1.code = programId + "_Scripted2"
    chart1.publicAccess = sharingSettings.public
    chart1.sharing = sharingSettings
    chart1.series = series.slice(0, 3)
    chart1.dataDimensionItems = dataDimensionItems.slice(0, 3)
    visualizations.push(chart1)
    androidSettingsVisualizations.push({
        id: chart1.id,
        name: chart1.name,
        timestamp
    })

    //Competency Classes - (Last 6 months by Org Units)
    const table1 = DeepCopy(compLastSixMonthsByOUTable)
    table1.id = uidPool.shift()
    table1.name = programShortName + " - " + nameComp + " - (Last 6 months by Org Units)"
    table1.code = programId + "_Scripted1"
    table1.publicAccess = sharingSettings.public
    table1.sharing = sharingSettings
    table1.series = series.slice(0, 3)
    table1.dataDimensionItems = dataDimensionItems.slice(0, 3)
    visualizations.push(table1)
    androidSettingsVisualizations.push({
        id: table1.id,
        name: table1.name,
        timestamp
    })

    //Competency Classes - (Last 6 months)
    const table2 = DeepCopy(compLastSixMonthsTable)
    table2.id = uidPool.shift()
    table2.name = programShortName + " - " + nameComp + " - (Last 6 months)"
    table2.code = programId + "_Scripted3"
    table2.publicAccess = sharingSettings.public
    table2.sharing = sharingSettings
    table2.series = series.slice(0, 3)
    table2.dataDimensionItems = dataDimensionItems.slice(0, 3)
    visualizations.push(table2)
    androidSettingsVisualizations.push({
        id: table2.id,
        name: table2.name,
        timestamp
    })

    //! Average Score by District from last 12 months
    const avergeScorebyTable = DeepCopy(AverageScoreByDistrictByPivotTable)
    avergeScorebyTable.id = uidPool.shift()
    avergeScorebyTable.name = programShortName + " - Average Score by District from last 12 months"
    avergeScorebyTable.code = programId + "_Scripted4"
    avergeScorebyTable.publicAccess = sharingSettings.public
    avergeScorebyTable.sharing = sharingSettings
    avergeScorebyTable.series = [series.at(4)]
    avergeScorebyTable.dataDimensionItems = [dataDimensionItems.at(4)]
    avergeScorebyTable.organisationUnits[0].id = ouRoot
    avergeScorebyTable.organisationUnitLevels = [visualizationLevel]
    avergeScorebyTable.legendSet.id = VISUALIZATIONS_LEGEND
    visualizations.push(avergeScorebyTable)
    // Dashboard - Tables
    const avergeScorebyTableDash1 = DeepCopy(dashVisualization)
    avergeScorebyTableDash1.id = uidPool.shift()
    avergeScorebyTableDash1.type = "REPORT_TABLE"
    avergeScorebyTableDash1.sharing = sharingSettings
    avergeScorebyTableDash1.visualization.id = avergeScorebyTable.id
    dashboardItems.push(avergeScorebyTableDash1)

    //!Average Global Score by checklist from last 12 months
    const AverageGlobalScorebyColumn = DeepCopy(AverageGlobalScoreByColumn)
    AverageGlobalScorebyColumn.id = uidPool.shift()
    AverageGlobalScorebyColumn.name = programShortName + " - Average Global Score by checklist from last 12 months"
    AverageGlobalScorebyColumn.code = programId + "_Scripted5"
    AverageGlobalScoreByColumn.publicAccess = sharingSettings.public
    AverageGlobalScorebyColumn.sharing = sharingSettings
    AverageGlobalScorebyColumn.userOrganisationUnit = userOU
    AverageGlobalScorebyColumn.dataDimensionItems = [dataDimensionItems.at(4)]
    AverageGlobalScorebyColumn.organisationUnits[0].id = ouRoot
    visualizations.push(AverageGlobalScorebyColumn)
    // Dashboard - Chart
    const avergeScorebyChartDash1 = DeepCopy(dashVisualization)
    avergeScorebyChartDash1.id = uidPool.shift()
    avergeScorebyChartDash1.sharing = sharingSettings
    avergeScorebyChartDash1.type = "CHART"
    avergeScorebyChartDash1.visualization.id = AverageGlobalScorebyColumn.id
    dashboardItems.push(avergeScorebyChartDash1)

    //!Number and Percentage of Assessment by Competency Class (last 4 quarters)
    const AssessmentByCompetencybyColumn = DeepCopy(AssessmentByCompetencyByColumn)
    AssessmentByCompetencybyColumn.id = uidPool.shift()
    AssessmentByCompetencybyColumn.name = programShortName + " - Number and Percentage of Assessments by Competency Class (last 4 quarters)"
    AssessmentByCompetencybyColumn.code = programId + "_Scripted6"
    AssessmentByCompetencybyColumn.publicAccess = sharingSettings.public
    AssessmentByCompetencybyColumn.sharing = sharingSettings
    AssessmentByCompetencybyColumn.userOrganisationUnit = userOU
    AssessmentByCompetencybyColumn.series = series.slice(0, 3)
    AssessmentByCompetencybyColumn.dataDimensionItems = dataDimensionItems.slice(0, 3)
    AssessmentByCompetencybyColumn.organisationUnits[0].id = ouRoot
    visualizations.push(AssessmentByCompetencybyColumn)
    // Dashboard - Chart
    const avergeScorebyChartDash2 = DeepCopy(dashVisualization)
    avergeScorebyChartDash2.id = uidPool.shift()
    avergeScorebyChartDash2.type = "CHART"
    avergeScorebyChartDash2.sharing = sharingSettings
    avergeScorebyChartDash2.visualization.id = AssessmentByCompetencybyColumn.id
    dashboardItems.push(avergeScorebyChartDash2)

    //! Number of Assessment by checklist (last 12 months)
    const NumberOfAssessmentbyTable = DeepCopy(NumberOfAssessmentByPivotTable)
    NumberOfAssessmentbyTable.id = uidPool.shift()
    NumberOfAssessmentbyTable.name = programShortName + " - Number of Assessments by checklist (last 12 months)"
    NumberOfAssessmentbyTable.code = programId + "_Scripted7"
    NumberOfAssessmentbyTable.publicAccess = sharingSettings.public
    NumberOfAssessmentbyTable.sharing = sharingSettings
    NumberOfAssessmentbyTable.userOrganisationUnit = userOU
    NumberOfAssessmentbyTable.series = [series.at(3)]
    NumberOfAssessmentbyTable.dataDimensionItems = [dataDimensionItems.at(3)]
    NumberOfAssessmentbyTable.organisationUnits[0].id = ouRoot
    visualizations.push(NumberOfAssessmentbyTable)
    // Dashboard - Tables
    const avergeScorebyTableDash2 = DeepCopy(dashVisualization)
    avergeScorebyTableDash2.id = uidPool.shift()
    avergeScorebyTableDash2.type = "REPORT_TABLE"
    avergeScorebyTableDash2.sharing = sharingSettings
    avergeScorebyTableDash2.visualization.id = NumberOfAssessmentbyTable.id
    dashboardItems.push(avergeScorebyTableDash2)

    //! Global Score Map
    const GlobalScorebyMap = DeepCopy(GlobalScoreByMap)
    GlobalScorebyMap.id = uidPool.shift()
    GlobalScorebyMap.name = programShortName + " - Global Score Map"
    GlobalScorebyMap.code = programId + "_Scripted8"
    GlobalScorebyMap.publicAccess = sharingSettings.public
    GlobalScorebyMap.sharing = sharingSettings
    GlobalScorebyMap.mapViews[0].sharing = sharingSettings
    GlobalScorebyMap.mapViews[0].organisationUnitLevels = [mapLevel]
    GlobalScorebyMap.mapViews[0].organisationUnits[0].id = ouRoot
    GlobalScorebyMap.mapViews[1].sharing = sharingSettings
    GlobalScorebyMap.mapViews[1].program.id = programId
    GlobalScorebyMap.mapViews[1].dataDimensionItems = [dataDimensionItems.at(4)]
    GlobalScorebyMap.mapViews[1].organisationUnitLevels = [mapLevel]
    GlobalScorebyMap.mapViews[1].organisationUnits[0].id = ouRoot
    GlobalScorebyMap.mapViews[1].legendSet.id = VISUALIZATIONS_LEGEND
    maps.push(GlobalScorebyMap)
    //Dashboard - Map
    const GlobalScorebyMap1 = DeepCopy(dashMap)
    GlobalScorebyMap1.id = uidPool.shift()
    GlobalScorebyMap1.type = "MAP"
    GlobalScorebyMap1.sharing = sharingSettings
    GlobalScorebyMap1.map.id = GlobalScorebyMap.id
    dashboardItems.push(GlobalScorebyMap1)

    //! Global Score Line List    
    const LineListScore = DeepCopy(LineListGlobalScore)
    LineListScore.id = uidPool.shift()
    LineListScore.name = programShortName + " - Global Score"
    LineListScore.code = programId + "_Scripted9"
    LineListScore.publicAccess = sharingSettings.public
    LineListScore.program.id = programId
    LineListScore.sharing = sharingSettings
    LineListScore.programStage.id = actionPlanID
    LineListScore.columnDimensions = columnDimensions
    LineListScore.dataElementDimensions[0].programStage.id = actionPlanID
    LineListScore.dataElementDimensions[0].dataElement.id = ACTION_PLAN_ACTION
    LineListScore.programIndicatorDimensions[0].programIndicator.id = gsInd
    LineListScore.organisationUnits[0].id = ouRoot
    LineListScore.organisationUnitLevels = [visualizationLevel]

    eventReports.push(LineListScore)
    //Dashboard - Event Report
    const GlobalScorebyEventReport1 = DeepCopy(dashEventReport)
    GlobalScorebyEventReport1.id = uidPool.shift()
    GlobalScorebyEventReport1.type = "EVENT_REPORT"
    GlobalScorebyEventReport1.sharing = sharingSettings
    GlobalScorebyEventReport1.eventReport.id = LineListScore.id
    dashboardItems.push(GlobalScorebyEventReport1)

    //!Dashboard
    const dashboardsGA = DeepCopy(dashboardsTemplate)
    dashboardsGA.id = currentDashboardId || uidPool.shift()
    dashboardsGA.name = programShortName
    dashboardsGA.code = programId
    dashboardsGA.sharing = sharingSettings
    dashboardsGA.dashboardItems = [...dashboardItems]
    dashboards.push(dashboardsGA)

    //Return
    return { visualizations, maps, androidSettingsVisualizations, dashboards, eventReports }
}
