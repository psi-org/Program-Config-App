// DHIS2 UI
import { ButtonStrip, AlertBar, AlertStack, ComponentCover, CircularLoader, Chip, IconCheckmarkCircle24, IconWarning24, IconCross24, NoticeBox } from "@dhis2/ui";

// React Hooks
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableSection from "./Section";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { BUILD_VERSION, FEEDBACK_ORDER, METADATA } from "../../configs/Constants";

import "react-sweet-progress/lib/style.css";
import Scores from "./Scores";
import CriticalCalculations from "./CriticalCalculations";
import DataProcessor from "../Excel/DataProcessor";
import Importer from "../Excel/Importer";
import { checkScores, readQuestionComposites, buildProgramRuleVariables, buildProgramRules, buildProgramIndicators, buildH2BaseVisualizations } from "./Scripting";
import { Link } from "react-router-dom";
import Removed from "./Removed";
import ValidateMetadata from "./ValidateMetadata";
import Errors from "./Errors";
import ErrorReports from "./ErrorReports";

import CachedIcon from '@mui/icons-material/Cached';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MuiChip from '@mui/material/Chip';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'

import SectionManager from './SectionManager'
import DataElementManager from './DataElementManager'
import { DeepCopy, truncateString } from "../../configs/Utils";
import { isEmptyObject } from "jquery";

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const deleteMetadataMutation = {
    resource: 'metadata?importStrategy=DELETE',
    type: 'create',
    data: ({ data }) => data
};

const queryIds = {
    results: {
        resource: 'system/id.json',
        params: ({ n }) => ({
            limit: n
        })
    }
};

const queryPR = {
    results: {
        resource: 'programRules',
        params: ({ programId }) => ({
            fields: ['id', 'name', 'condition', 'programRuleActions'],
            pageSize: 1000,
            filter: ['program.id:eq:' + programId, 'description:eq:_Scripted']
        })
    }
};

const queryPRV = {
    results: {
        resource: 'programRuleVariables',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            pageSize: 2000,
            filter: ['program.id:eq:' + programId, 'name:$like:_']
        })
    }
};

const queryPIndicators = {
    results: {
        resource: 'programIndicators',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            filter: ['program.id:eq:' + programId, 'description:eq:_H2Analytics']
        })
    },
};

const queryMaps = {
    results: {
        resource: 'maps',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            filter: [`code:like:${programId}_Scripted`]
        })
    },
};

const queryVisualizations = {
    results: {
        resource: 'visualizations',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            filter: [`code:like:${programId}_Scripted`]
        })
    }
};

const queryEventReport = {
    results: {
        resource: 'eventReports',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            filter: [`code:like:${programId}_Scripted`]
        })
    }
};


const updateAndroidSettings = {
    resource: `dataStore/ANDROID_SETTINGS_APP/analytics`,
    type: 'update',
    data: ({ data }) => data
};

const queryAndroidSettings = {
    results: {
        resource: `dataStore/ANDROID_SETTINGS_APP/analytics`
    }
};

const queryDashboards = {
    results: {
        resource: 'dashboards',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            filter: [`code:like:${programId}`]
        })
    }
};


/*------------------------------------------------------ */
const queryPCAMetadata = {
    results: {
        resource: 'programs',
        params: ({ programId }) => ({
            id: programId,
            fields: ['attributeValues', 'sharing'],
            filter: [`id:eq:${programId}`]
        })
    }

}
const queryOrganizationsUnit = {
    results: {
        resource: 'organisationUnitLevels',
        params: ({  ouLevel }) => ({
            fields: ['id', 'level', 'offlineLevels'],
            filter: ['id:in:[' + ouLevel.join(',') + ']']
        })
    }
}

const queryProgramSettings = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['*']
        }
    },
}

const StageSections = ({ programStage, stageRefetch, hnqisMode, readOnly }) => {
    // Globals
    const programId = programStage.program.id;
    const [isSectionMode, setIsSectionMode] = useState(programStage.formType === "SECTION" || programStage.programStageDataElements.length === 0)
    const { data: androidSettings } = useDataQuery(queryAndroidSettings);
    const [androidSettingsUpdate, { error: androidSettingsUpdateError }] = useDataMutation(updateAndroidSettings);
    const [androidSettingsError, setAndroidSettingsError] = useState(true);
    const [programSettingsError, setProgramSettingsError] = useState(undefined);
    const { data: OrganizationLevel, refetch: setOuLevel } = useDataQuery(queryOrganizationsUnit, { lazy: true, variables: { ouLevel: undefined } });
    const { refetch: getProgramSettings } = useDataQuery(queryProgramSettings, { lazy: true, variables: { programId } });

    // Flags
    const [saveStatus, setSaveStatus] = useState(hnqisMode ? 'Validate' : 'Save Changes');
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [savedAndValidated, setSavedAndValidated] = useState(false)
    const [exportToExcel, setExportToExcel] = useState(false);

    const [exportStatus, setExportStatus] = useState("Download Template");
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [importResults, setImportResults] = useState(false);
    const [progressSteps, setProgressSteps] = useState(0);
    const [isValid, setIsValid] = useState(true);
    const [validationResults, setValidationResults] = useState(false);

    const [editSectionIndex, setEditSectionIndex] = useState(undefined);
    const [newSectionIndex, setNewSectionIndex] = useState(undefined);
    const [showSectionManager, setShowSectionManager] = useState(false);

    const [deToEdit, setDeToEdit] = useState('')

    const [snackParams, setSnackParams] = useState(false)
    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })

    const [uidPool, setUidPool] = useState([]);

    useEffect(() => {
        if (importerEnabled) {
            setErrorReports(undefined)
            setValidationResults(false)
        }
    }, [importerEnabled])

    // States
    const [removedElements, setRemovedElements] = useState([])
    const [originalProgramStageDataElements, setOriginalProgramStageDataElements] = useState(programStage.programStageDataElements.reduce((acu, cur) => acu.concat(cur), []))
    const [sections, setSections] = useState((isSectionMode)
        ? [...programStage.programStageSections.filter(s => (s.name !== "Scores" && s.name !== "Critical Steps Calculations") || !hnqisMode)]
        : [{ name: "Basic Form", displayName: "Basic Form", sortOrder: '1', id: 'X', dataElements: programStage.programStageDataElements.map(de => DeepCopy(de.dataElement)) }]
    );
    const [scoresSection, setScoresSection] = useState({ ...programStage.programStageSections.find(s => hnqisMode && s.name === "Scores") });
    const [criticalSection, setCriticalSection] = useState({ ...programStage.programStageSections.find(s => hnqisMode && s.name === "Critical Steps Calculations") });
    const [programStageDataElements, setProgramStageDataElements] = useState([...programStage.programStageDataElements]);
    const [programMetadata, setProgramMetadata] = useState(JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id === METADATA)?.value || "{}"));
    const [errorReports, setErrorReports] = useState(undefined)

    const [addedSection, setAddedSection] = useState()

    useEffect(() => {
        return (() => {
            setCriticalSection(undefined)
        })
    }, [])


    // REFETCH STAGE
    const refetchProgramStage = (params = {}) => {
        stageRefetch({ variables: { programStage: programStage.id } }).then(data => {
            let programStage = data.results
            setOriginalProgramStageDataElements(programStage.programStageDataElements.reduce((acu, cur) => acu.concat(cur), []))
            setSections((isSectionMode)
                ? [...programStage.programStageSections.filter(s => (s.name !== "Scores" && s.name !== "Critical Steps Calculations") || !hnqisMode)]
                : [{ name: "Basic Form", displayName: "Basic Form", sortOrder: '1', id: 'X', dataElements: programStage.programStageDataElements.map(de => DeepCopy(de.dataElement)) }]
            )
            setScoresSection({ ...programStage.programStageSections.find(s => hnqisMode && (isSectionMode) && s.name === "Scores") })
            setCriticalSection({ ...programStage.programStageSections.find(s => hnqisMode && (isSectionMode) && s.name === "Critical Steps Calculations") })
            setProgramStageDataElements([...programStage.programStageDataElements])
            setProgramMetadata(JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id === METADATA)?.value || "{}"))
        })
    }


    // ***** DATA ELEMENT ACTIONS ***** //
    const updateDEValues = (dataElementId, sectionId, stageDataElement) => {

        let sectionIdx = sections.findIndex(s => s.id === sectionId)
        let section_DE_idx = sections[sectionIdx].dataElements.findIndex(de => de.id === dataElementId)
        let stage_DE_idx = programStageDataElements.findIndex(psde => psde.dataElement.id === dataElementId)

        programStageDataElements[stage_DE_idx] = stageDataElement
        sections[sectionIdx].dataElements[section_DE_idx] = stageDataElement.dataElement

        setProgramStageDataElements(programStageDataElements)
        setSections(sections)
        setDeToEdit('')
        pushNotification(<span>Data Element edited! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>)
    }

    const removeDE = (id, section) => {
        let psdeIdx = programStageDataElements.findIndex(psde => psde.dataElement.id === id)
        let sectionIdx = sections.find(s => s.id === section)?.dataElements.findIndex(de => de.id === id)

        if (sectionIdx > -1 && psdeIdx > -1) {
            sections.find(s => s.id === section)?.dataElements.splice(sectionIdx, 1)
            programStageDataElements.splice(psdeIdx, 1)
            setSections(sections)
            setProgramStageDataElements(programStageDataElements)
            pushNotification(<span>Data Element removed! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
        }
    }

    const saveAdd = (params) => {

        let dataElementObjects = params.newDataElements.map(psde => psde.dataElement)
        let sectionIndex = sections.findIndex(s => s.id === params.deRef.section)
        let toBeAdded = params.newDataElements.map(de => ({ id: de.dataElement.id, mode: de.type }))
        params.newDataElements.forEach(de => delete de.type)

        sections.find(s => s.id === params.deRef.section).dataElements.splice(params.deRef.index, 0, ...dataElementObjects/* ...params.newDataElements */)
        let newProgramStageDataElements = programStageDataElements.concat(params.newDataElements)

        setSections(sections)
        setProgramStageDataElements(newProgramStageDataElements)
        setDeManager(false)
        pushNotification(<span>{params.newDataElements.length} Data Element{params.newDataElements.length > 1 ? 's' : ''} added! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>)
        setAddedSection({
            index: sectionIndex,
            mode: 'Updated',
            dataElements: toBeAdded
        })
    }

    const [deManager, setDeManager] = useState(false)

    const DEActions = {
        deToEdit,
        setEdit: de => setDeToEdit(de),
        update: (de, section, stageDe) => updateDEValues(de, section, stageDe),
        remove: (de, section) => removeDE(de, section),
        add: (index, section) => setDeManager({
            index,
            section,
            stage: programStage.id,
            sectionName: sections.find(s => s.id === section).displayName
        })
    }
    // ***** END OF DATA ELEMENT ACTIONS ***** //

    // ***** SECTIONS ACTIONS ***** //
    const handleSectionEdit = (section = undefined, newSection = undefined) => {
        setEditSectionIndex(section)
        setNewSectionIndex(newSection)
        setShowSectionManager(true)
    }

    const removeSection = section => {
        let idx = sections.findIndex(s => s.id === section.id)
        let newPSDEs = programStageDataElements.filter(psde => !section.dataElements.find(de => de.id === psde.dataElement.id))
        setProgramStageDataElements(newPSDEs)
        sections.splice(idx, 1)
        setSections(sections)
        pushNotification(<span>{`Section '${section.name}' removed! `}<strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
    }

    const SectionActions = {
        append: () => handleSectionEdit(undefined, sections.length),
        handleSectionEdit: (section = undefined, newSection = undefined) => handleSectionEdit(section, newSection),
        remove: id => removeSection(id)
    }

    // ***** END OF SECTIONS ACTIONS ***** //

    // Create Mutation
    let metadataDM = useDataMutation(createMutation);
    const createMetadata = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data
    };

    //Delete mutations
    const deleteMetadata = useDataMutation(deleteMetadataMutation)[0];

    // Get Ids
    const idsQuery = useDataQuery(queryIds, { lazy: true, variables: { n: programStage.programStageDataElements.length * 5 } });
    //setUidPool(idsQuery.data?.results.codes);

    // Fetch Program Rules from Program
    const prDQ = useDataQuery(queryPR, { variables: { programId: programStage.program.id } });

    // Fetch Program Rule Variables from Program
    const prvDQ = useDataQuery(queryPRV, { variables: { programId: programStage.program.id } });

    // Fetch Program Indicators from Program
    const pIndDQ = useDataQuery(queryPIndicators, { variables: { programId: programStage.program.id } });

    // Fetch Visualizations from Program
    const visualizationsDQ = useDataQuery(queryVisualizations, { variables: { programId: programStage.program.id } });

    // Fetch Event Reports from Program
    const eventReportDQ = useDataQuery(queryEventReport, { variables: { programId: programStage.program.id } });

    // Fetch Visualizations from Program
    const mapsDQ = useDataQuery(queryMaps, { variables: { programId: programStage.program.id } });

    // Fetch Dashboards from Program
    const dashboardsDQ = useDataQuery(queryDashboards, { variables: { programId: programStage.program.id } });

    // Fetch Metadata from Program
    const programAttributes = useDataQuery(queryPCAMetadata, { variables: { programId: programStage.program.id } });



    useEffect(() => {
        const programIndicatorsAmount = 3 + 2;
        const visualizationsAmount = 3 + 5;
        const androidSettingsAmount = 1;

        let n = (sections.reduce((prev, acu) => prev + acu.dataElements.length, 0) + scoresSection?.dataElements?.length + criticalSection?.dataElements?.length) * 5 + programIndicatorsAmount + visualizationsAmount + androidSettingsAmount;
        //No Sections , get minimum ids for core Program Rules
        if (isNaN(n) || n < 50) n = 50

        idsQuery.refetch({ n }).then(data => {
            if (data) {
                setUidPool(data.results.codes)
            }
        })
    }, [sections]);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = (result) => {
        // Dropped outside of Droppable
        if (!result.destination) return;

        // Copy of sections from state
        let newSections = sections;

        switch (result.type) {
            case 'SECTION':
                newSections = reorder(
                    sections,
                    result.source.index,
                    result.destination.index
                );
                setSaveStatus(hnqisMode ? 'Validate & Save' : 'Save Changes');
                break;
            case 'DATA_ELEMENT':
                if (result.source.droppableId == result.destination.droppableId) {
                    //Same section
                    let sectionIndex = newSections.findIndex(s => s.id == result.source.droppableId);
                    newSections[sectionIndex].dataElements = reorder(
                        newSections[sectionIndex].dataElements,
                        result.source.index,
                        result.destination.index
                    );
                } else {
                    //Different section
                    let element = newSections.find(s => s.id == result.source.droppableId).dataElements.splice(result.source.index, 1)[0];
                    newSections.find(s => s.id == result.destination.droppableId).dataElements.splice(result.destination.index, 0, element);
                }
                setSaveStatus(hnqisMode ? 'Validate & Save' : 'Save Changes');
                break;
            default:
        }
        setSections(newSections);
    };

    const commit = () => {
        setAddedSection(undefined)
        if (createMetadata.data && createMetadata.data.status) delete createMetadata.data.status
        let removed = originalProgramStageDataElements.filter(psde => !programStageDataElements.find(de => de.dataElement.id === psde.dataElement.id)).map(psde => psde.dataElement)
        setRemovedElements(removed)
        setSavingMetadata(true);
        return;
    };

    const configuration_download = (e) => {
        e.preventDefault();
        setExportToExcel(true);
        setExportStatus("Generating Configuration File...")
    };

    const configuration_import = () => {
        setImporterEnabled(true);
    };

    useEffect(() => {
        if (androidSettingsError) setProgressSteps(8);
    }, [androidSettingsUpdateError])

    const run = () => {
        if (!savedAndValidated) return;
        //--------------------- NEW METADATA --------------------//
        setProgressSteps(1);
        let programConfig = programAttributes.data?.results?.programs[0]
        let pcaMetadata = JSON.parse(programConfig?.attributeValues?.find(pa => pa.attribute.id === METADATA)?.value || "{}")

        // Set flag to enable/disable actions (buttons)
        setSaveAndBuild('Run');

        //--------------------- Organization Unit Validations -----------//
        if (!Object.hasOwn(pcaMetadata, "ouRoot") ||
            !Object.hasOwn(pcaMetadata, "ouLevelTable") ||
            !Object.hasOwn(pcaMetadata, "ouLevelMap") ||
            !Object.hasOwn(pcaMetadata, "useUserOrgUnit")) {
            setProgramSettingsError(1);
            setSaveAndBuild("Completed");
        } else {
            if (pcaMetadata.useUserOrgUnit == "Yes") { pcaMetadata.useUserOrgUnit = true } else { pcaMetadata.useUserOrgUnit = false }

            //-------------------------------------------------------//
            setOuLevel({ ouLevel: [pcaMetadata.ouLevelTable, pcaMetadata.ouLevelMap] }).then((data) => {
                if (data?.results?.organisationUnitLevels) {
                    let valueLevel = data?.results?.organisationUnitLevels
                    let visualizationLevel = valueLevel.find(ouLevel => ouLevel.id === pcaMetadata.ouLevelTable)
                    let mapLevel = valueLevel.find(ouLevel => ouLevel.id === pcaMetadata.ouLevelMap)

                    pcaMetadata.ouLevelTable = visualizationLevel?.offlineLevels || visualizationLevel?.level
                    pcaMetadata.ouLevelMap = mapLevel?.offlineLevels || mapLevel?.level

                    if (visualizationLevel == undefined || mapLevel == undefined) {
                        setProgramSettingsError(2);
                        setSaveAndBuild("Completed");
                    } else {

                        // --------------- PROCESSING ---------------- //
                        // Globals, States & more...

                        // I. Scores Checking
                        // Requires: scoresSection
                        //      Break point: When duplicated scores found
                        setProgressSteps(2);

                        const { uniqueScores, compositeScores, duplicatedScores } = checkScores(scoresSection.dataElements);
                        if (!uniqueScores) throw { msg: "Duplicated scores", duplicatedScores, status: 400 };
                        const scoresMapping = scoresSection.dataElements.reduce((acc, cur) => (
                            {
                                ...acc,
                                [cur.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value]: cur
                            }), {});   // { feedbackOrder:deUid, ... }

                        // II. Read questions
                        // Requires: sections (with or WITHOUT scores&critical)
                        //      Breakpoint: When a score is missing
                        setProgressSteps(3);

                        const questionCompositeScores = readQuestionComposites(sections);
                        const missingComposites = questionCompositeScores.filter(cs => !compositeScores.includes(cs));
                        if (missingComposites.length > 0) throw { msg: "Some questions Feedback Order don't match any Score item", missingComposites, status: 400 }

                        // III. Build new metadata
                        // Program Rule Variables : Data Elements (questions & labels) , Calculated Values, Critical Steps + Competency Class
                        // Also, Program Indicators and Visualizations
                        setProgressSteps(4);

                        const programRuleVariables = buildProgramRuleVariables(sections, compositeScores, programId, programMetadata.useCompetencyClass);
                        const { programRules, programRuleActions } = buildProgramRules(sections, programStage.id, programId, compositeScores, scoresMapping, uidPool, programMetadata.useCompetencyClass, programMetadata.healthArea); //useCompetencyClass
                        const { programIndicators, indicatorIDs } = buildProgramIndicators(programId, programStage.program.shortName, uidPool, programMetadata.useCompetencyClass, programConfig.sharing.owner, programConfig.sharing.external, programConfig.sharing.public);
                        const { visualizations, androidSettingsVisualizations, maps, dashboards, eventReports } = buildH2BaseVisualizations(programId, programStage.program.shortName, indicatorIDs, uidPool, programMetadata.useCompetencyClass, dashboardsDQ?.data?.results?.dashboards[0]?.id, pcaMetadata.useUserOrgUnit, pcaMetadata.ouRoot, programStage.id, programConfig.sharing.owner, programConfig.sharing.external, programConfig.sharing.public, pcaMetadata.ouLevelTable, pcaMetadata.ouLevelMap);
                        const metadata = { programRuleVariables, programRules, programRuleActions, programIndicators, visualizations, maps, dashboards, eventReports };

                        // IV. Delete old metadata
                        setProgressSteps(5);

                        let programRulesDel = prDQ.data.results.programRules.map(pr => ({ id: pr.id }));
                        let programRuleVariablesDel = prvDQ.data.results.programRuleVariables.map(prv => ({ id: prv.id }));
                        let programIndicatorsDel = pIndDQ.data.results.programIndicators.map(pInd => ({ id: pInd.id }));
                        let visualizationsDel = visualizationsDQ.data.results.visualizations.map(vis => ({ id: vis.id }));
                        let eventReportsDel = eventReportDQ.data.results.eventReports.map(er => ({ id: er.id }));
                        let mapsDel = mapsDQ.data.results.maps.map(mp => ({ id: mp.id }));

                        const oldMetadata = {
                            programRules: programRulesDel.length > 0 ? programRulesDel : undefined,
                            programRuleVariables: programRuleVariablesDel.length > 0 ? programRuleVariablesDel : undefined,
                            programIndicators: programIndicatorsDel.length > 0 ? programIndicatorsDel : undefined,
                            visualizations: visualizationsDel.length > 0 ? visualizationsDel : undefined,
                            eventReports: eventReportsDel.length > 0 ? eventReportsDel : undefined,
                            maps: mapsDel.length > 0 ? mapsDel : undefined
                        };

                        // V. Import new metadata

                        deleteMetadata({ data: oldMetadata }).then((res) => {
                            if (res.status == 'OK') {
                                setProgressSteps(6);

                                createMetadata.mutate({ data: metadata }).then(response => {

                                    if (response.status == 'OK') {
                                        setSaveAndBuild('Completed');
                                        setSavedAndValidated(false);

                                        prDQ.refetch();
                                        prvDQ.refetch();
                                        setProgressSteps(7);

                                        // VI. Enable in-app analytics

                                        if (androidSettings?.results) {

                                            if (!androidSettings.results.dhisVisualizations) androidSettings.results.dhisVisualizations = {
                                                "dataSet": {},
                                                "home": [],
                                                "program": {}
                                            }

                                            if (!androidSettings.results.dhisVisualizations.home) androidSettings.results.dhisVisualizations.home = []

                                            androidSettings.results.dhisVisualizations.home = androidSettings.results.dhisVisualizations.home.filter(setting =>
                                                setting.program !== programId
                                            )

                                            androidSettings.results.dhisVisualizations.home.push({
                                                id: uidPool.shift(),
                                                name: programStage.program.name,
                                                program: programId,
                                                visualizations: androidSettingsVisualizations
                                            })

                                            androidSettings.results.lastUpdated = new Date().toISOString()

                                            androidSettingsUpdate({ data: androidSettings.results }).then(res => {
                                                if (res.status === 'OK') setAndroidSettingsError(false)
                                                getProgramSettings({programId}).then(res => {
                                                    res.results?.attributeValues.forEach(av => {
                                                        if(av.attribute.id === METADATA){
                                                            let pcaMetadata = JSON.parse(av.value || "{}")
                                                            pcaMetadata.buildVersion = BUILD_VERSION;
                                                            av.value = JSON.stringify(pcaMetadata)
                                                        }
                                                    }) 
                                                    createMetadata.mutate({ data: { programs: [res.results] } }).then(response => {
                                                        if (response.status == 'OK') {
                                                            setProgressSteps(8)
                                                        }
                                                    })
                                                })
                                            })

                                        } else {
                                            setProgressSteps(8);
                                        }

                                    }
                                });
                            }

                        });
                    }
                }
            })
        }
    }
    const parseErrors = (e) => {
        let data = e.typeReports.map(tr => {
            let type = tr.klass.split('.').pop()
            return tr.objectReports.map(or => or.errorReports.map(er => ({ type, uid: or.uid, errorCode: er.errorCode, message: er.message })))
        })
        return data.flat().flat()
    }

    return (
        <div className="cont_stage">
            <div className="sub_nav align-items-center">
                <div className="cnt_p">
                    <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Link to={'/program/' + programStage.program.id}>
                        <Chip>
                            Program: {truncateString(programStage.program.name)}
                        </Chip>
                    </Link>/
                    <Chip>Stage: {truncateString(programStage.displayName)}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns" style={{ color: '#444444' }}>
                    <ButtonStrip>
                        {isSectionMode && !readOnly &&
                            <Button color='inherit' variant='outlined' startIcon={<CheckCircleOutlineIcon />} disabled={createMetadata.loading} onClick={() => commit()}> {saveStatus}</Button>
                        }
                        {hnqisMode && isSectionMode &&
                            <>
                                <Button variant='contained' startIcon={<ConstructionIcon />} disabled={!savedAndValidated} onClick={() => run()}>Set up program</Button>
                                <Button color='inherit' variant='outlined' startIcon={!exportToExcel ? <FileDownloadIcon /> : <CircularLoader small />} name="generator"
                                    onClick={() => configuration_download(event)} disabled={exportToExcel}>{exportStatus}</Button>
                                <Button color='inherit' variant='outlined' startIcon={<PublishIcon />} name="importer"
                                    onClick={() => setImporterEnabled(true)}>Import Template</Button>
                            </>
                        }
                        <Button color='inherit' name="Reload" variant='outlined' startIcon={<CachedIcon />} onClick={() => { window.location.reload() }}>Reload</Button>
                    </ButtonStrip>
                </div>
            </div>
            {hnqisMode && importerEnabled && <Importer displayForm={setImporterEnabled} previous={{ sections, setSections, scoresSection, setScoresSection }} setSaveStatus={setSaveStatus} setImportResults={setImportResults} programMetadata={{ programMetadata, setProgramMetadata }} />}
            <div className="title" style={{ padding: '1.5em 1em 0', overflow: 'hidden', display: 'flex', maxWidth: '100vw', justifyContent: 'start', margin: '0' }}>
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    Sections for Program Stage <strong>{programStage.displayName}</strong>
                </span>
                {(readOnly || !isSectionMode)  &&
                    <MuiChip style = {{marginLeft: '1em'}} label="Read Only" variant="outlined" />
                }
            </div>
            {hnqisMode && exportToExcel && <DataProcessor programName={programStage.program.name} ps={programStage} isLoading={setExportToExcel} setStatus={setExportStatus} />}
            {
                createMetadata.loading && <ComponentCover translucent></ComponentCover>

            }

            {createMetadata.error &&
                <AlertStack>
                    <AlertBar critical>
                        {"Error: " + JSON.stringify(createMetadata.error.message)}
                    </AlertBar>
                </AlertStack>
            }

            {createMetadata.data && createMetadata.data.status == "OK" &&
                <AlertStack>
                    <AlertBar>
                        {"Process completed successfully"}
                    </AlertBar>
                </AlertStack>
            }

            {createMetadata.data && (createMetadata.data.status == "ERROR") &&
                <AlertStack>
                    <AlertBar critical>
                        {"Process ended with error. Please check Errors Summary section for more details."}
                    </AlertBar>
                </AlertStack>
            }
            {hnqisMode && saveAndBuild &&

                <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                    <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => { if ((saveAndBuild === 'Completed') || (createMetadata?.data?.status === 'ERROR')) { setSaveAndBuild(false); setProgressSteps(0); } }}>
                        Setting Up Program
                    </CustomMUIDialogTitle >
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        {(progressSteps > 0) &&
                            <>
                                <div className="progressItem">
                                    {progressSteps === 1 && !programSettingsError && <CircularLoader small />}
                                    {progressSteps === 1 && programSettingsError && <IconCross24 color={'#d63031'} />}
                                    {progressSteps !== 1 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                    {
                                        !programSettingsError
                                            ? <p>Checking Program settings'</p>
                                            : (programSettingsError === 1
                                                ? <p>Global analytics settings missing.</p>
                                                : (programSettingsError === 2
                                                    ? <p>Configured Organisation Unit Levels not found.</p>
                                                    : <p>Unknown Error</p>
                                                )
                                            )
                                    }
                                </div>
                                {programSettingsError === 1 &&
                                    <NoticeBox title="Please do the following:">
                                        <ol>
                                            <li>Go to the Programs List</li>
                                            <li>Search for program: {programStage.program.name}</li>
                                            <li>Open Program Menu</li>
                                            <li>Click Edit Program and check that the current program settings are complete</li>
                                        </ol>
                                    </NoticeBox>
                                }
                                {programSettingsError === 2 &&
                                    <NoticeBox title="Please do the following:">
                                        <ol>
                                            <li>Go to the Programs List</li>
                                            <li>Search for program: {programStage.program.name}</li>
                                            <li>Open Program Menu</li>
                                            <li>Click Edit Program and make sure that the Organisation Unit Levels are valid.</li>
                                        </ol>
                                    </NoticeBox>
                                }
                            </>
                        }
                        {(progressSteps > 1) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 2 && <CircularLoader small />}
                                {progressSteps === 2 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Checking scores</p>
                            </div>
                        }
                        {(progressSteps > 2) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 3 && <CircularLoader small />}
                                {progressSteps === 3 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Reading assesment's questions</p>
                            </div>
                        }
                        {(progressSteps > 3) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 4 && <CircularLoader small />}
                                {progressSteps === 4 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Building new metadata and analytics</p>
                            </div>
                        }
                        {(progressSteps > 4) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 5 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 5 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 5 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Deleting old metadata</p>
                            </div>
                        }
                        {(progressSteps > 5) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 6 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 6 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 6 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Importing new metadata</p>
                            </div>
                        }
                        {(progressSteps > 6) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 7 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps !== 7 && androidSettings && androidSettingsError && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 7 && !androidSettings && <IconWarning24 color={'#ffbb00'} />}
                                {progressSteps !== 7 && androidSettings && !androidSettingsError && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Enabling in-app analytics {!androidSettings ? "(Android Settings app not enabled)" : (androidSettingsError ? "(Error while saving Android Settings)" : "")}</p>
                            </div>
                        }
                        {(progressSteps > 7) && !programSettingsError &&
                            <div className="progressItem">
                                {androidSettings && !androidSettingsError && <IconCheckmarkCircle24 color={'#00b894'} />}
                                {(!androidSettings || androidSettingsError) && <IconWarning24 color={'#ffbb00'} />}
                                <p> Done!</p>
                            </div>
                        }
                    </DialogContent>

                    <DialogActions style={{ padding: '1em' }}>
                        <Button variant='outlined' disabled={(saveAndBuild != 'Completed') && (createMetadata?.data?.status !== 'ERROR')} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}> Done </Button>
                    </DialogActions>

                </CustomMUIDialog>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto'}}>
                    <div className="layout_prgms_stages">
                        {sections.length === 0 && !readOnly &&
                            <Button startIcon={<AddBoxIcon />} variant='contained' style={{ margin: '8px' }} onClick={SectionActions.append}>
                                Add New Section
                            </Button>
                        }
                        {
                            importResults && (importResults.questions.removed > 0 || importResults.scores.removed > 0) &&
                            <Removed importResults={importResults} index={0} key={"removedSec"} />
                        }
                        {
                            validationResults && (validationResults.questions.length > 0 || validationResults.scores.length > 0 || validationResults.feedbacks.length > 0) &&
                            <Errors validationResults={validationResults} index={0} key={"validationSec"} />
                        }
                        {
                            errorReports && <ErrorReports errors={errorReports} />
                        }
                        {
                            createMetadata.data && createMetadata.data.status == 'ERROR' && <ErrorReports errors={parseErrors(createMetadata.data)} />
                        }
                        <Droppable droppableId="dpb-sections" type="SECTION" isDropDisabled={readOnly}>
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                    {
                                        sections.map((pss, idx) => {
                                            return <DraggableSection
                                                program={programStage.program.id}
                                                stageSection={pss}
                                                editStatus={addedSection?.index === idx && addedSection}
                                                stageDataElements={programStageDataElements}
                                                DEActions={DEActions}
                                                index={idx}
                                                key={pss.id || idx}
                                                SectionActions={SectionActions}
                                                hnqisMode={hnqisMode}
                                                isSectionMode={isSectionMode}
                                                readOnly={readOnly}
                                            />
                                        })
                                    }
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        {hnqisMode && (isSectionMode) && <CriticalCalculations stageSection={criticalSection} index={0} key={criticalSection?.id || "crit"} />}
                        {hnqisMode && (isSectionMode) && <Scores stageSection={scoresSection} index={0} key={scoresSection?.id || "scores"} program={programId} />}

                    </div>
                </div>
            </DragDropContext>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={!!snackParams}
                autoHideDuration={6000}
                onClose={() => setSnackParams(false)}
            >
                <Alert onClose={() => setSnackParams(false)} severity={snackParams.severity} sx={{ width: '100%' }}>
                    {snackParams.content}
                </Alert>
            </Snackbar>
            {
                savingMetadata &&
                <ValidateMetadata
                    hnqisMode={hnqisMode}
                    newDEQty={importResults ? importResults.questions.new + importResults.scores.new + importResults.sections.new : 0}
                    programStage={programStage}
                    importedSections={sections}
                    importedScores={scoresSection}
                    criticalSection={criticalSection}
                    removedItems={importResults ? importResults.questions.removedItems.concat(importResults.scores.removedItems) : removedElements /*[]*/}

                    // createMetadata={createMetadata}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    previous={{ sections, setSections, scoresSection, setScoresSection }}
                    setImportResults={setImportResults}
                    importResults={importResults}
                    setIsValid={setIsValid}
                    setValidationResults={setValidationResults}
                    programMetadata={programMetadata}
                    setErrorReports={setErrorReports}
                    refetchProgramStage={refetchProgramStage}
                />
            }
            {showSectionManager &&
                <SectionManager
                    sectionIndex={editSectionIndex}
                    newSectionIndex={newSectionIndex}
                    setShowSectionForm={setShowSectionManager}
                    sections={sections}
                    refreshSections={setSections}
                    notify={pushNotification}
                    setAddedSection={setAddedSection}
                    hnqisMode={hnqisMode}
                />
            }
            {deManager &&
                <DataElementManager
                    program={programStage.program.id}
                    deRef={deManager}
                    setDeManager={setDeManager}
                    programStageDataElements={programStageDataElements}
                    saveAdd={saveAdd}
                    hnqisMode={hnqisMode}
                />
            }
        </div>
    )
}

export default StageSections;
