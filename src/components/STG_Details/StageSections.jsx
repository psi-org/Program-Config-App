import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { ButtonStrip, AlertBar, AlertStack, ComponentCover, CircularLoader, Chip, IconCheckmarkCircle24, IconWarning24, IconCross24, NoticeBox } from "@dhis2/ui";
import "react-sweet-progress/lib/style.css";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import MuiChip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Link } from "react-router-dom";
import { BUILD_VERSION, DATASTORE_H2_METADATA, FEEDBACK_ORDER, GENERATED_OBJECTS_NAMESPACE, H2_METADATA_VERSION, METADATA, NAMESPACE } from "../../configs/Constants.jsx";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants.js";
import { DeepCopy, buildBasicFormStage, extractMetadataPermissions, getProgramQuery, mapIdArray, truncateString, versionGTE } from "../../utils/Utils.jsx";
import DataProcessor from "../Excel/DataProcessor.jsx";
import Importer from "../Excel/Importer.jsx";
import CustomMUIDialog from '../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from '../UIElements/CustomMUIDialogTitle.jsx'
import ErrorReports from "../UIElements/ErrorReports.jsx";
import Errors from "../UIElements/Errors.jsx";
import ImportDownloadButton from "../UIElements/ImportDownloadButton.jsx";
import Removed from "../UIElements/Removed.jsx";
import CriticalCalculations from "./CriticalCalculations.jsx";
import DataElementManager from './DataElementManager.jsx'
import Scores from "./Scores.jsx";
import { checkScores, readQuestionComposites, buildProgramRuleVariables, buildProgramRules, buildProgramIndicators, buildH2BaseVisualizations, buildFeedbackTree, buildFeedbackRules } from "./Scripting.js";
import DraggableSection from "./Section.jsx";
import SectionManager from './SectionManager.jsx'
import ValidateMetadata from "./ValidateMetadata.jsx";

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const deleteMetadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data,
    params: {
        importStrategy: 'DELETE'
    }
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
            fields: ['*'],
            filter: [`code:like:${programId}_Scripted`]
        })
    }
};


const updateAndroidSettingsAnalytics = {
    resource: `dataStore/ANDROID_SETTINGS_APP/analytics`,
    type: 'update',
    data: ({ data }) => data
};

const queryAndroidSettingsAnalytics = {
    results: {
        resource: `dataStore/ANDROID_SETTINGS_APP/analytics`
    }
};

const updateAndroidSettingsSynchronization = {
    resource: `dataStore/ANDROID_SETTINGS_APP/synchronization`,
    type: 'update',
    data: ({ data }) => data
};

const queryAndroidSettingsSynchronization = {
    results: {
        resource: `dataStore/ANDROID_SETTINGS_APP/synchronization`
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
            fields: ['attributeValues', 'sharing', 'programStages'],
            filter: [`id:eq:${programId}`]
        })
    }
}

const queryOrganizationsUnit = {
    results: {
        resource: 'organisationUnitLevels',
        params: ({ ouLevel }) => ({
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
            fields: getProgramQuery(false)
        }
    },
}

const queryCurrentUser = {
    results: {
        resource: 'me',
        params: {
            fields: ['id', 'authorities']
        }
    },
}

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`
    }
};

const optionsSetUp = ['SET UP PROGRAM', 'ENABLE IN-APP ANALYTICS'];

const StageSections = ({ programStage, hnqisMode, readOnly }) => {

    const programId = programStage.program.id;

    const queryDataStore = {
        results: {
            resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
        },
    };

    const dsCreateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
        type: "create",
        data: ({ data }) => data,
    };

    const dsUpdateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
        type: "update",
        data: ({ data }) => data,
    };

    const [addedSection, setAddedSection] = useState()
    const [allAuth, setAllAuth] = useState(false);
    const [androidSettingsError, setAndroidSettingsError] = useState(undefined);
    const [
        androidSettingsSyncUpdate,
        { error: androidSettingsSyncUpdateError }
    ] = useDataMutation(updateAndroidSettingsSynchronization, {
        onError: (err) => { setAndroidSettingsError(err.details || err) }
    });
    const [
        androidSettingsUpdate,
        { error: androidSettingsUpdateError }
    ] = useDataMutation(updateAndroidSettingsAnalytics, {
        onError: (err) => { setAndroidSettingsError(err.details || err) }
    });
    const [backupData, setBackupData] = useState()
    const [criticalSection, setCriticalSection] = useState(
        {
            ...programStage.programStageSections
                .find(s => hnqisMode && s.name === "Critical Steps Calculations")
        });
    const [deToEdit, setDeToEdit] = useState('')
    const [editSectionIndex, setEditSectionIndex] = useState(undefined);
    const [errorReports, setErrorReports] = useState(undefined)
    const [exportToExcel, setExportToExcel] = useState(false);
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [importResults, setImportResults] = useState(false);
    const [isSectionMode] = useState(
        programStage.formType === "SECTION" ||
        programStage.programStageDataElements.length === 0
    );
    const [newSectionIndex, setNewSectionIndex] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [originalProgramStageDataElements] = useState(
        programStage.programStageDataElements
            .reduce((acu, cur) => acu.concat(cur), [])
    );
    const [programMetadata, setProgramMetadata] = useState();
    const [programSettingsError, setProgramSettingsError] = useState(undefined);
    const [programStageDataElements, setProgramStageDataElements] = useState([...programStage.programStageDataElements]);
    const [progressSteps, setProgressSteps] = useState(0);
    const [removedElements, setRemovedElements] = useState([])
    const [runError, setRunError] = useState(null);
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [savedAndValidated, setSavedAndValidated] = useState(false)
    const [saveStatus, setSaveStatus] = useState(hnqisMode ? 'Validate' : 'Save Changes');
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [scoresSection, setScoresSection] = useState({
        ...programStage.programStageSections
            .find(s => hnqisMode && s.name === "Scores")
    });
    const [sections, setSections] = useState(isSectionMode
        ? [...programStage.programStageSections
            .filter(s => (s.name !== "Scores" && s.name !== "Critical Steps Calculations") || !hnqisMode)]
        : [buildBasicFormStage(programStage.programStageDataElements)]
    );
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [showSectionManager, setShowSectionManager] = useState(false);
    const [snackParams, setSnackParams] = useState(false)
    const [stagesList, setStagesList] = useState();
    const [uidPool, setUidPool] = useState([]);
    const [validationResults, setValidationResults] = useState();
    const { data: androidSettings, refetch: refreshAndroidSettings } = useDataQuery(queryAndroidSettingsAnalytics);
    const { data: currentUser } = useDataQuery(queryCurrentUser);
    const { data: hnqis2Metadata, loading: metadataLoading } = useDataQuery(queryHNQIS2Metadata);
    const { refetch: getProgramSettings } = useDataQuery(queryProgramSettings, { lazy: true, variables: { programId } });
    const { refetch: refreshAndroidSettingsSync } = useDataQuery(queryAndroidSettingsSynchronization);
    const { refetch: setOuLevel } = useDataQuery(queryOrganizationsUnit, { lazy: true, variables: { ouLevel: undefined } });
    const anchorRef = useRef(null);
    const runInFlightRef = useRef(false);

    // ===============================
    // Helpers
    // ===============================

    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })

    const normalizeError = (err) => {
        if (!err) {
            return { message: "Unknown error" };
        }
        if (typeof err === "string") {
            return { message: err };
        }
        if (err.message) {
            return { message: err.message, raw: err };
        }
        if (err.details?.message) {
            return { message: err.details.message, raw: err };
        }
        if (err.httpStatus || err.status) {
            return { message: `${err.httpStatus || err.status}`, raw: err };
        }
        return { message: JSON.stringify(err), raw: err };
    };

    const finishRun = (maybeErr) => {
        if (maybeErr) {
            const e = normalizeError(maybeErr);
            setRunError(e);
            // If this is a DHIS2 metadata import-style error payload, surface it
            if (maybeErr?.typeReports) {
                setErrorReports(parseErrors(maybeErr));
            }
            pushNotification(<span>Setup failed: <strong>{e.message}</strong></span>, "error");
        }
        setSaveAndBuild("Completed");
        runInFlightRef.current = false;
    };

    const safeStep = async (stepNo, fn) => {
        setProgressSteps(stepNo);
        return await fn();
    };

    const storeBackupdata = () => {
        setBackupData({
            sections: sections,
            scoresSection: scoresSection,
            currentSectionsData: programStage.programStageSections
        })
    }

    const getProgramMetadata = () => {
        getProgramAttributes({ programId }).then(res => {
            let metadataParse = '{}';
            res.results?.programs[0]?.attributeValues.forEach(av => {
                if (av.attribute.id === METADATA) {
                    metadataParse = av.value;
                }
            })
            setProgramMetadata(JSON.parse(metadataParse))
            setStagesList(res.results?.programs[0]?.programStages)
        })
    }

    // ***** DATA ELEMENT ACTIONS ***** //
    const updateDEValues = (dataElementId, sectionId, stageDataElement) => {

        const sectionIdx = sections.findIndex(s => s.id === sectionId)
        const section_DE_idx = sections[sectionIdx].dataElements.findIndex(de => de.id === dataElementId)
        const stage_DE_idx = programStageDataElements.findIndex(psde => psde.dataElement.id === dataElementId)

        programStageDataElements[stage_DE_idx] = stageDataElement
        sections[sectionIdx].dataElements[section_DE_idx] = stageDataElement.dataElement

        setProgramStageDataElements(programStageDataElements)
        setSections(sections)
        setDeToEdit('')
        pushNotification(<span>Data Element edited! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>)
    }

    const removeDE = (id, section) => {
        const psdeIdx = programStageDataElements.findIndex(psde => psde.dataElement.id === id)
        const sectionIdx = sections.find(s => s.id === section)?.dataElements.findIndex(de => de.id === id)

        if (sectionIdx > -1 && psdeIdx > -1) {
            sections.find(s => s.id === section)?.dataElements.splice(sectionIdx, 1)
            programStageDataElements.splice(psdeIdx, 1)
            setSections(sections)
            setProgramStageDataElements(programStageDataElements)
            if (hnqisMode) { setSaveStatus('Validate & Save') }
            pushNotification(<span>Data Element removed! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
        }
    }

    const saveAdd = (params) => {

        const dataElementObjects = params.newDataElements.map(psde => psde.dataElement)
        const sectionIndex = sections.findIndex(s => s.id === params.deRef.section)
        const toBeAdded = params.newDataElements.map(de => ({ id: de.dataElement.id, mode: de.type }))
        params.newDataElements.forEach(de => delete de.type)

        sections.find(s => s.id === params.deRef.section).dataElements.splice(params.deRef.index, 0, ...dataElementObjects/* ...params.newDataElements */)
        const newProgramStageDataElements = programStageDataElements.concat(params.newDataElements)

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
        const idx = sections.findIndex(s => s.id === section.id)
        const newPSDEs = programStageDataElements.filter(psde => !section.dataElements.find(de => de.id === psde.dataElement.id))
        setProgramStageDataElements(newPSDEs)
        sections.splice(idx, 1)
        setSections(sections)
        if (hnqisMode) { setSaveStatus('Validate & Save') }
        pushNotification(<span>{`Section '${section.name}' removed! `}<strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
    }

    const SectionActions = {
        append: () => handleSectionEdit(undefined, sections.length),
        handleSectionEdit: (section = undefined, newSection = undefined) => handleSectionEdit(section, newSection),
        remove: id => removeSection(id)
    }

    // ***** END OF SECTIONS ACTIONS ***** //

    // Create Mutation
    const metadataDM = useDataMutation(createMutation, {
        onError: (err) => {
            console.error(err)
        }
    });
    const createMetadata = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data
    };

    //Delete mutations
    const [
        deleteMetadata,
        { error: deleteError, loading: deleteLoading }
    ] = useDataMutation(deleteMetadataMutation, {
        onError: () => {
            setProgressSteps(6);
        }
    });

    // ***** DATASTORE ***** //

    const { refetch: getDataStore } = useDataQuery(queryDataStore);

    const [dataStoreCreate] = useDataMutation(dsCreateMutation, {
        onError: (err) => {
            console.log(err);
        }
    });
    const [dataStoreUpdate] = useDataMutation(dsUpdateMutation, {
        onError: (err) => {
            console.log(err);
        }
    });

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
    const { data: programAttributes, refetch: getProgramAttributes } = useDataQuery(queryPCAMetadata, { variables: { programId: programStage.program.id } });

    const getUIDs = () => {
        const programIndicatorsAmount = 3 + 2;
        const visualizationsAmount = 3 + 5;
        const androidSettingsAmount = 1;

        let n = (
            (sections.reduce((prev, acu) => prev + acu.dataElements.length, 10) * 3) //Tripled to create Program Rule Variables
            + ((scoresSection?.dataElements?.length || 10) * 2) //Doubled to create Program Rule Variables
            + ((criticalSection?.dataElements?.length || 10) * 5)
        ) + programIndicatorsAmount + visualizationsAmount + androidSettingsAmount;

        //No Sections , get minimum ids for core Program Rules
        if (isNaN(n) || n < 50) { n = 10 }
        n = n * 2; // Doubled to handle new HNQIS Feedback Rules

        idsQuery.refetch({ n }).then(data => {
            if (data) {
                setUidPool(data.results.codes);
            }
        })
    }

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = (result) => {
        // Dropped outside of Droppable
        if (!result.destination) { return }

        // Copy of sections from state
        let newSections = sections;

        // Section droppped in same place
        if (result.type === 'SECTION' && result.source.index === result.destination.index) { return }

        // Section droppped in same place
        if (result.type === 'DATA_ELEMENT' && result.source.droppableId === result.destination.droppableId && result.source.index === result.destination.index) { return }

        // Clear Chips Highlights
        setAddedSection(undefined)

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
                    const sectionIndex = newSections.findIndex(s => s.id == result.source.droppableId);
                    newSections[sectionIndex].dataElements = reorder(
                        newSections[sectionIndex].dataElements,
                        result.source.index,
                        result.destination.index
                    );
                } else {
                    //Different section
                    const element = newSections.find(s => s.id == result.source.droppableId).dataElements.splice(result.source.index, 1)[0];
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
        if (createMetadata.data && createMetadata.data.status) { delete createMetadata.data.status }
        const removed = originalProgramStageDataElements.filter(psde => !programStageDataElements.find(de => de.dataElement.id === psde.dataElement.id)).map(psde => psde.dataElement);
        setRemovedElements(removed);
        setSavingMetadata(true);
        return;
    };

    const buildAndroidSettings = (settings, newUID, androidSettingsVisualizations) => {
        if (!settings.results.dhisVisualizations) {
            settings.results.dhisVisualizations = {
                dataSet: {},
                home: [],
                program: {}
            }
        }

        if (!settings.results.dhisVisualizations.home) { settings.results.dhisVisualizations.home = [] }

        settings.results.dhisVisualizations.home = settings.results.dhisVisualizations.home.filter(setting =>
            setting.program !== programId
        )
        if (programMetadata?.createAndroidAnalytics === 'Yes') {
            settings.results.dhisVisualizations.home.push({
                id: newUID,
                name: programStage.program.name,
                program: programId,
                visualizations: androidSettingsVisualizations
            })
        }

        settings.results.lastUpdated = new Date().toISOString();
        return settings;
    }

    const applyAndroidSettingsAsync = async (androidSettingsVisualizations, localUidPool) => {
        // Step 7
        try {
            // Analytics
            const analytics = await refreshAndroidSettings();
            if (analytics?.results) {
                const settings = buildAndroidSettings(analytics, localUidPool.shift(), androidSettingsVisualizations);
                const r = await androidSettingsUpdate({ data: settings.results });
                if (r?.status !== "OK") {
                    setAndroidSettingsError(r);
                }
            }

            // Sync settings
            const sync = await refreshAndroidSettingsSync();
            if (sync?.results) {
                const settings = sync.results;
                const teiAmount = programMetadata?.teiDownloadAmount || 5;

                settings.programSettings.specificSettings[programId] = {
                    enrollmentDateDownload: "ANY",
                    enrollmentDownload: "ONLY_ACTIVE",
                    id: programId,
                    name: programStage.program.name,
                    settingDownload: "ALL_ORG_UNITS",
                    summarySettings: `${teiAmount} TEI all OU`,
                    teiDownload: teiAmount,
                    updateDownload: "ANY"
                };

                const r2 = await androidSettingsSyncUpdate({ data: settings });
                if (r2?.status === "OK") {
                    setAndroidSettingsError(undefined);
                }
            }
        } catch (e) {
            setAndroidSettingsError(e?.details || e);
        }
    };

    const importMetadataAndPersistAsync = async ({ metadata, sendToDataStore, dataStoreData }) => {
        const resp = await createMetadata.mutate({ data: metadata });
        if (resp?.status !== "OK") {
            throw resp || new Error("Metadata import failed");
        }

        const dsResp = await sendToDataStore({ data: dataStoreData });
        if (dsResp?.status !== "OK") {
            throw dsResp || new Error("Datastore update failed");
        }

        return resp;
    };

    const withLocalUidPool = () => [...uidPool];

    const run = async () => {
        if (!savedAndValidated) {
            return;
        }
        if (runInFlightRef.current) {
            return;
        }

        runInFlightRef.current = true;
        setRunError(null);
        setProgramSettingsError(undefined);
        setAndroidSettingsError(undefined);

        // Set flag to enable/disable actions (buttons)
        setSaveAndBuild("Run");

        const localUidPool = withLocalUidPool();

        try {
            // STEP 1: load/validate program settings + OU levels
            await safeStep(1, async () => {
                const programConfig = programAttributes?.results?.programs?.[0];
                if (!programConfig) {
                    throw new Error("Program attributes not loaded yet");
                }

                const pcaMetadata = JSON.parse(
                    programConfig?.attributeValues?.find(pa => pa.attribute.id === METADATA)?.value || "{}"
                );

                // validate required keys
                const required = ["ouRoot", "ouLevelTable", "ouLevelMap", "useUserOrgUnit"];
                const missing = required.filter(k => !Object.hasOwn(pcaMetadata, k));
                if (missing.length) {
                    setProgramSettingsError(1);
                    throw new Error("Global analytics settings missing");
                }

                pcaMetadata.useUserOrgUnit = (pcaMetadata.useUserOrgUnit === "Yes");

                const ouData = await setOuLevel({ ouLevel: [pcaMetadata.ouLevelTable, pcaMetadata.ouLevelMap] });

                // Previously this returned without completing (causing stuck UI)
                const levels = ouData?.results?.organisationUnitLevels;
                if (!levels?.length) {
                    setProgramSettingsError(2);
                    throw new Error("Configured Organisation Unit Levels not found");
                }

                const visualizationLevel = levels.find(l => l.id === pcaMetadata.ouLevelTable);
                const mapLevel = levels.find(l => l.id === pcaMetadata.ouLevelMap);

                if (!visualizationLevel || !mapLevel) {
                    setProgramSettingsError(2);
                    throw new Error("Configured Organisation Unit Levels not found");
                }

                // Store back derived numeric levels
                pcaMetadata.ouLevelTable = visualizationLevel.offlineLevels || visualizationLevel.level;
                pcaMetadata.ouLevelMap = mapLevel.offlineLevels || mapLevel.level;

                // return “context” for later steps
                return { pcaMetadata, programConfig };
            });

            // Build context again (kept simple; you can also hoist context out instead of recomputing)
            const programConfig = programAttributes.results.programs[0];
            const pcaMetadata = JSON.parse(programConfig?.attributeValues?.find(pa => pa.attribute.id === METADATA)?.value || "{}");

            const sharingSettings = programConfig?.sharing;
            sharingSettings.public = extractMetadataPermissions(sharingSettings.public);
            sharingSettings.users = sharingSettings.users || {};
            sharingSettings.userGroups = sharingSettings.userGroups || {};
            Object.keys(sharingSettings.users).forEach(k => (sharingSettings.users[k].access = extractMetadataPermissions(sharingSettings.users[k].access)));
            Object.keys(sharingSettings.userGroups).forEach(k => (sharingSettings.userGroups[k].access = extractMetadataPermissions(sharingSettings.userGroups[k].access)));

            const actionPlanID = programStage.program.programStages.filter(ps => ps.id !== programStage.id)[0]?.id;

            // STEP 2: scores
            await safeStep(2, async () => {
                const { uniqueScores, compositeScores, duplicatedScores } = checkScores(scoresSection.dataElements);
                if (!uniqueScores) {
                    throw { msg: "Duplicated scores", duplicatedScores, status: 400 };
                }
                return compositeScores;
            });
            const { compositeScores } = checkScores(scoresSection.dataElements);

            // STEP 3: read questions
            await safeStep(3, async () => {
                const questionCompositeScores = readQuestionComposites(sections);
                const missing = questionCompositeScores.filter(cs => !compositeScores.includes(cs));
                if (missing.length) {
                    throw { msg: "Some questions Feedback Order don't match any Score item", missingComposites: missing, status: 400 };
                }
            });

            // STEP 4: build metadata payloads
            const { metadata, androidSettingsVisualizations, oldMetadata, sendToDataStore, dataStoreData } =
                await safeStep(4, async () => {
                    const scoresMapping = scoresSection.dataElements.reduce((acc, cur) => ({
                        ...acc,
                        [cur.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value]: cur
                    }), {});

                    const programRuleVariables = buildProgramRuleVariables({
                        sections,
                        scoresSection,
                        compositeScores,
                        programId,
                        useCompetencyClass: programMetadata.useCompetencyClass,
                        uidPool: localUidPool
                    });

                    const { programRules, programRuleActions, scoreMap } = buildProgramRules({
                        sections,
                        stageId: programStage.id,
                        programId,
                        compositeValues: compositeScores,
                        scoresMapping,
                        uidPool: localUidPool,
                        useCompetencyClass: programMetadata.useCompetencyClass,
                        healthArea: programMetadata.healthArea
                    });

                    const { programIndicators, indicatorIDs, gsInd } = buildProgramIndicators({
                        programId,
                        programStage,
                        scoreMap,
                        uidPool: localUidPool,
                        useCompetency: programMetadata.useCompetencyClass,
                        sharingSettings,
                        PIAggregationType: programMetadata.programIndicatorsAggType
                    });

                    const { visualizations, maps, dashboards, eventReports, androidSettingsVisualizations } = buildH2BaseVisualizations({
                        programId,
                        programShortName: programStage.program.shortName,
                        gsInd,
                        indicatorIDs,
                        uidPool: localUidPool,
                        useCompetency: programMetadata.useCompetencyClass,
                        currentDashboardId: dashboardsDQ?.data?.results?.dashboards?.[0]?.id,
                        userOU: (pcaMetadata.useUserOrgUnit === "Yes"),
                        ouRoot: pcaMetadata.ouRoot,
                        sharingSettings,
                        visualizationLevel: pcaMetadata.ouLevelTable,
                        mapLevel: pcaMetadata.ouLevelMap,
                        actionPlanID
                    });

                    // Feedback rules
                    const dataElements = programStage.programStageSections.reduce((acc, cur) => acc.concat(cur.dataElements), []);
                    const { feedbackTree, prvsMap } = buildFeedbackTree(dataElements, programRuleVariables);
                    const { programRules: feedbackRules, programRuleActions: feedbackActions } = buildFeedbackRules({
                        tree: feedbackTree, prvsMap, programId, uidPool: localUidPool
                    });

                    const metadata = {
                        programRuleVariables,
                        programRules: programRules.concat(feedbackRules),
                        programRuleActions: programRuleActions.concat(feedbackActions),
                        programIndicators,
                        visualizations,
                        maps,
                        dashboards,
                        eventReports
                    };

                    // Datastore + deletion refs
                    const dataStoreResult = await getDataStore();
                    const programRefereces = {
                        programRules: mapIdArray(metadata.programRules),
                        programRuleActions: mapIdArray(metadata.programRuleActions),
                        programRuleVariables: mapIdArray(programRuleVariables),
                        programIndicators: mapIdArray(programIndicators),
                        visualizations: mapIdArray(visualizations),
                        eventReports: mapIdArray(eventReports),
                        maps: mapIdArray(maps),
                        dashboards: mapIdArray(dashboards)
                    };

                    const sendToDataStore = dataStoreResult?.results ? dataStoreUpdate : dataStoreCreate;
                    let dataStoreData = dataStoreResult?.results ? dataStoreResult.results : {};
                    const toDeleteReferences = DeepCopy(dataStoreData);
                    dataStoreData = programRefereces;

                    const fallbackRuleVariables = prvDQ.data.results.programRuleVariables.filter(prv => prv.name?.[0] === "_");

                    const programRulesDel = toDeleteReferences?.programRules || mapIdArray(prDQ.data.results.programRules);
                    const programRuleVariablesDel = toDeleteReferences?.programRuleVariables || mapIdArray(fallbackRuleVariables);
                    const programIndicatorsDel = toDeleteReferences?.programIndicators || mapIdArray(pIndDQ.data.results.programIndicators);
                    const visualizationsDel = toDeleteReferences?.visualizations || mapIdArray(visualizationsDQ.data.results.visualizations);
                    const eventReportsDel = toDeleteReferences?.eventReports || mapIdArray(eventReportDQ.data.results.eventReports);
                    const mapsDel = toDeleteReferences?.maps || mapIdArray(mapsDQ.data.results.maps);

                    const oldMetadata = {
                        programRules: programRulesDel.length ? programRulesDel : undefined,
                        programRuleVariables: programRuleVariablesDel.length ? programRuleVariablesDel : undefined,
                        programIndicators: programIndicatorsDel.length ? programIndicatorsDel : undefined,
                        visualizations: visualizationsDel.length ? visualizationsDel : undefined,
                        eventReports: eventReportsDel.length ? eventReportsDel : undefined,
                        maps: mapsDel.length ? mapsDel : undefined
                    };

                    return { metadata, androidSettingsVisualizations, oldMetadata, sendToDataStore, dataStoreData };
                });

            // STEP 5: delete old metadata (and any prerequisite updates)
            await safeStep(5, async () => {
                // Update event reports first (as you currently do)
                const updateResp = await createMetadata.mutate({
                    data: {
                        eventReports: eventReportDQ.data.results.eventReports.map(er => ({
                            ...er,
                            columnDimensions: ["pe", "ou"],
                            dataElementDimensions: [],
                            programIndicatorDimensions: []
                        }))
                    }
                });
                if (updateResp?.status !== "OK") {
                    throw updateResp || new Error("Failed to update eventReports");
                }

                await deleteMetadata({ data: oldMetadata });
            });

            // STEP 6: import new metadata + datastore references
            await safeStep(6, async () => {
                await importMetadataAndPersistAsync({ metadata, sendToDataStore, dataStoreData });
            });

            // STEP 7: apply android settings (non-fatal)
            await safeStep(7, async () => {
                await applyAndroidSettingsAsync(androidSettingsVisualizations, localUidPool);
            });

            // STEP 8: update build version (if this fails, still finish cleanly)
            await safeStep(8, async () => {
                await updateProgramBuildVersion(programId);
            });

            finishRun(); // success
        } catch (e) {
            finishRun(e); // failure, but always completes UI
        }
    };

    const parseErrors = (e) => {
        const data = e.typeReports.map(tr => {
            const type = tr.klass.split('.').pop()
            return tr.objectReports.map(or => or.errorReports.map(er => ({ type, uid: or.uid, errorCode: er.errorCode, message: er.message })))
        })
        return data.flat().flat()
    }

    const handleClick = () => {
        switch (selectedIndex) {
            case 0:
                allAuth ? run() : setShowDisclaimer(true);
                break;
            case 1:
                //TODO: Enable Analytics only
                /*const timestamp = new Date().toISOString();
                let androidSettings =
                    existingLocalAnalytics?.results?.visualizations.map(visualization => ({
                        id: visualization.id,
                        name: visualization.name,
                        timestamp
                    }));
                */
                break;
            default:
                break;
        }
    };

    const handleMenuItemClick = (index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        if (currentUser) {
            setAllAuth(currentUser.results.authorities.includes('ALL'))
        }
    }, [currentUser])

    useEffect(() => {
        if (importerEnabled) {
            setErrorReports(undefined)
            setValidationResults(undefined)
        }
    }, [importerEnabled])

    useEffect(() => {
        if (sections && scoresSection && !backupData) { storeBackupdata() }
    }, [sections, scoresSection])

    useEffect(() => {
        if (savedAndValidated) { storeBackupdata() }
    }, [savedAndValidated])

    useEffect(() => {
        getProgramMetadata()
        return (() => {
            setCriticalSection(undefined)
        })
    }, [])

    useEffect(() => {
        getUIDs()
    }, [sections]);

    useEffect(() => {
        if (androidSettingsError || androidSettingsSyncUpdateError) { updateProgramBuildVersion(programId) }
    }, [androidSettingsUpdateError, androidSettingsSyncUpdateError])

    const updateProgramBuildVersion = async (programId) => {
        const res = await getProgramSettings({ programId });
        res.results?.attributeValues?.forEach(av => {
            if (av.attribute.id === METADATA) {
                const pcaMetadata = JSON.parse(av.value || "{}");
                pcaMetadata.buildVersion = BUILD_VERSION;
                av.value = JSON.stringify(pcaMetadata);
            }
        });

        const response = await createMetadata.mutate({ data: { programs: [res.results] } });
        if (response?.status === "OK") {
            setProgressSteps(8);
            setSaveAndBuild("Completed");
            setSavedAndValidated(false);

            prDQ.refetch();
            prvDQ.refetch();
            pIndDQ.refetch();
            visualizationsDQ.refetch();
            eventReportDQ.refetch();
            mapsDQ.refetch();
            getUIDs();
            return;
        }

        throw new Error("Failed to update Program build version");
    };

    if (hnqisMode && !metadataLoading && !versionGTE(hnqis2Metadata?.results?.version, H2_METADATA_VERSION)) {
        return (<>
            <NoticeBox title="Check HNQIS2 Metadata" error>
                <p>The latest PCA Metadata Package is required to access this HNQIS2 Program.</p>
            </NoticeBox>
        </>);
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
                <div style={{ color: '#444444', paddingRight: '1em' }}>
                    <ButtonStrip>
                        {!readOnly &&
                            <Button
                                color='inherit'
                                size='small'
                                variant='outlined'
                                startIcon={<CheckCircleOutlineIcon />}
                                disabled={createMetadata.loading || !programMetadata}
                                onClick={() => commit()}
                            > {saveStatus}</Button>
                        }
                        {hnqisMode && isSectionMode &&
                            <>
                                <ButtonGroup disableElevation color='primary' variant="contained" ref={anchorRef} aria-label="split button">
                                    <Button
                                        onClick={handleClick}
                                        startIcon={selectedIndex === 0 ? <ConstructionIcon /> : <InsightsIcon />}
                                        size='small'
                                        disabled={!savedAndValidated}
                                    >{optionsSetUp[selectedIndex]}</Button>
                                    {allAuth &&
                                        <Button
                                            size="small"
                                            aria-controls={open ? 'split-button-menu' : undefined}
                                            aria-expanded={open ? 'true' : undefined}
                                            aria-label="select merge strategy"
                                            aria-haspopup="menu"
                                            onClick={handleToggle}
                                            disabled={!savedAndValidated}
                                        >
                                            <ArrowDropDownIcon />
                                        </Button>
                                    }
                                </ButtonGroup>
                                <Popper
                                    sx={{
                                        zIndex: 1
                                    }}

                                    open={open}
                                    anchorEl={anchorRef.current}
                                    role={undefined}
                                    transition
                                    disablePortal
                                >
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                            {...TransitionProps}
                                            style={{
                                                transformOrigin:
                                                    placement === 'bottom' ? 'center top' : 'center bottom',
                                            }}
                                        >
                                            <Paper>
                                                <ClickAwayListener onClickAway={handleClose}>
                                                    <MenuList id="split-button-menu" autoFocusItem>
                                                        {optionsSetUp.map((option, index) => (
                                                            <MenuItem
                                                                key={option}
                                                                disabled={index === 1 /*&& (!allAuth || !(existingLocalAnalytics?.results?.visualizations.length > 0))*/}
                                                                selected={index === selectedIndex}
                                                                onClick={() => handleMenuItemClick(index)}
                                                            >
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </MenuList>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )}
                                </Popper>
                            </>
                        }
                        {hnqisMode && isSectionMode &&
                            <ImportDownloadButton
                                disabled={exportToExcel}
                                setImporterEnabled={setImporterEnabled}
                                setExportToExcel={setExportToExcel}
                                size="small"
                            />
                        }
                        <Tooltip title="Reload" arrow>
                            <IconButton
                                size='small'
                                name="Reload"
                                color="inherit"
                                onClick={() => { window.location.reload() }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </ButtonStrip>
                </div>
            </div>
            {hnqisMode && importerEnabled &&
                <Importer
                    displayForm={setImporterEnabled}
                    setImportResults={setImportResults}
                    setValidationResults={setValidationResults}
                    programSpecificType={TEMPLATE_PROGRAM_TYPES.hnqis2}
                    previous={{ sections: [...backupData.sections], setSections, scoresSection: DeepCopy(backupData.scoresSection), setScoresSection }}
                    setSaveStatus={setSaveStatus}
                    programMetadata={{ programMetadata, setProgramMetadata }}
                    currentSectionsData={backupData.currentSectionsData}
                    setSavedAndValidated={setSavedAndValidated}
                />
            }
            <div className="title" style={{ padding: '1.5em 1em 0', overflow: 'hidden', display: 'flex', maxWidth: '100vw', justifyContent: 'start', margin: '0', alignItems: 'center' }}>
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    Sections for Program Stage <strong>{programStage.displayName}</strong>
                </span>
                {readOnly &&
                    <MuiChip style={{ marginLeft: '1em' }} label="Read Only" variant="outlined" />
                }
            </div>
            {hnqisMode && exportToExcel && <DataProcessor programName={programStage.program.name} ps={programStage} isLoading={setExportToExcel} />}
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

            {createMetadata.data && progressSteps === 8 && createMetadata.data.status == "OK" &&
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
            {showDisclaimer &&
                <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                    <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setShowDisclaimer(false)}>
                        Warning!
                    </CustomMUIDialogTitle >
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        <p>Your User does not have the authorities required by the Android Settings App to enable In-app Analytics for HNQIS 2.0.</p>
                        <p style={{ margin: '1em 0' }}>You are still able to Set Up the program, however, the Android App Dashboard won&apos;t be updated.</p>
                        <NoticeBox title="Please Note">
                            <p>To enable In-app Analytics for this Program please contact your System Administrator.</p>
                        </NoticeBox>
                    </DialogContent>

                    <DialogActions style={{ padding: '1em' }}>
                        <Button variant='outlined' color='error' onClick={() => setShowDisclaimer(false)}> Cancel </Button>
                        <Button variant='outlined' color='warning' onClick={() => { setShowDisclaimer(false); run() }} startIcon={<ConstructionIcon />}> Set up Anyway </Button>
                    </DialogActions>

                </CustomMUIDialog>
            }
            {hnqisMode && saveAndBuild &&

                <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                    <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => { if ((saveAndBuild === 'Completed') || (createMetadata?.data?.status === 'ERROR')) { setSaveAndBuild(false); setProgressSteps(0); } }}>
                        Setting Up Program
                    </CustomMUIDialogTitle >
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        {progressSteps > 0 &&
                            <>
                                <div className="progressItem">
                                    {progressSteps === 1 && !programSettingsError && <CircularLoader small />}
                                    {progressSteps === 1 && programSettingsError && <IconCross24 color={'#d63031'} />}
                                    {progressSteps !== 1 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                    {
                                        !programSettingsError
                                            ? <p style={{ maxWidth: '90%' }}>Checking Program settings</p>
                                            : (programSettingsError === 1
                                                ? <p style={{ maxWidth: '90%' }}>Global analytics settings missing.</p>
                                                : (programSettingsError === 2
                                                    ? <p style={{ maxWidth: '90%' }}>Configured Organisation Unit Levels not found.</p>
                                                    : <p style={{ maxWidth: '90%' }}>Unknown Error</p>
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
                        {progressSteps > 1 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 2 && <CircularLoader small />}
                                {progressSteps === 2 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Checking scores</p>
                            </div>
                        }
                        {progressSteps > 2 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 3 && <CircularLoader small />}
                                {progressSteps === 3 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Reading assessment&apos;s questions</p>
                            </div>
                        }
                        {progressSteps > 3 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 4 && <CircularLoader small />}
                                {progressSteps === 4 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Building new metadata and analytics</p>
                            </div>
                        }
                        {progressSteps > 4 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 5 && deleteLoading && <CircularLoader small />}
                                {progressSteps > 5 && deleteError && <IconCross24 color={'#d63031'} />}
                                {progressSteps > 5 && !deleteError && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Deleting old metadata</p>
                            </div>
                        }
                        {progressSteps > 5 && deleteError &&
                            <NoticeBox error title="Error deleting old metadata">{deleteError.message} (Error Type: {deleteError.type})</NoticeBox>
                        }
                        {console.log("DEBUG", progressSteps, createMetadata.loading, createMetadata.error)}
                        {progressSteps > 5 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 6 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps > 6 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps > 6 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Importing new metadata</p>
                            </div>
                        }
                        {progressSteps > 6 && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 7 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps !== 7 && androidSettings && androidSettingsError && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 7 && !androidSettings && <IconWarning24 color={'#ffbb00'} />}
                                {progressSteps !== 7 && androidSettings && !androidSettingsError && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}>
                                    {programMetadata?.createAndroidAnalytics === 'Yes' ? 'Enabling in-app analytics' : 'Applying Android Settings'}
                                    {
                                        !androidSettings
                                            ? "(Android Settings app not enabled)"
                                            : (androidSettingsError
                                                ? '(Error: ' + (androidSettingsError.httpStatus === 'Forbidden'
                                                    ? 'You don\'t have permissions to update the Android Settings in this server'
                                                    : androidSettingsError.message) + ')'
                                                : "")
                                    }
                                </p>
                            </div>
                        }
                        {(progressSteps > 7) && !programSettingsError &&
                            <div className="progressItem">
                                {androidSettings && !androidSettingsError && <IconCheckmarkCircle24 color={'#00b894'} />}
                                {(!androidSettings || androidSettingsError) && <IconWarning24 color={'#ffbb00'} />}
                                <p> Done!</p>
                            </div>
                        }
                        {runError && 
                            <NoticeBox error title="Setup failed">{runError.message}</NoticeBox>
                        }
                    </DialogContent>

                    <DialogActions style={{ padding: '1em' }}>
                        <Button variant='outlined' disabled={(saveAndBuild != 'Completed') && (createMetadata?.data?.status !== 'ERROR')} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}> Done </Button>
                    </DialogActions>

                </CustomMUIDialog>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto' }}>
                    <div className="layout_prgms_stages">
                        {sections.length === 0 && !readOnly &&
                            <Button startIcon={<AddBoxIcon />} variant='contained' style={{ margin: '8px' }} onClick={SectionActions.append}>
                                Add New Section
                            </Button>
                        }
                        {
                            importResults && (importResults.questions.removed > 0 || importResults.scores.removed > 0) &&
                            <Removed
                                removedItems={importResults.questions.removedItems.concat(importResults.scores.removedItems)}
                                key={"removedSec"}
                            />
                        }
                        {
                            validationResults && (validationResults.sections.length > 0 || validationResults.questions.length > 0 || validationResults.scores.length > 0 || validationResults.feedbacks.length > 0) &&
                            <Errors
                                validationResults={
                                    (
                                        validationResults.sections.concat(
                                            (validationResults.questions.concat(validationResults.scores))
                                        ).map(element => element.errors).flat()
                                    ).concat(validationResults.feedbacks)
                                }
                                key={"validationSec"}
                            />
                        }
                        {
                            errorReports && <ErrorReports errors={errorReports} />
                        }
                        {
                            createMetadata.data && createMetadata.data.status == 'ERROR' && <ErrorReports errors={parseErrors(createMetadata.data)} />
                        }
                        {!programMetadata &&
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1em' }}>
                                <CircularLoader />
                            </div>
                        }
                        {programMetadata &&
                            <Droppable droppableId="dpb-sections" type="SECTION" isDropDisabled={readOnly}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                        {
                                            sections.map((pss, idx) => {
                                                return <DraggableSection
                                                    program={programStage.program.id}
                                                    dePrefix={programMetadata.dePrefix || 'XXXXXXXXXXX'}
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
                                                    setSaveStatus={setSaveStatus}
                                                />
                                            })
                                        }
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        }
                        {hnqisMode && (isSectionMode) &&
                            <>
                                <CriticalCalculations stageSection={criticalSection} ikey={criticalSection?.id || "crit"} />
                                <Scores stageSection={scoresSection} key={scoresSection?.id || "scores"} program={programId} />
                            </>
                        }

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
                    removedItems={importResults ? importResults.questions.removedItems.concat(importResults.scores.removedItems) : removedElements}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    previous={{ sections: [...backupData.sections], setSections, scoresSection: DeepCopy(backupData.scoresSection), setScoresSection }}
                    setImportResults={setImportResults}
                    importResults={importResults}
                    setValidationResults={setValidationResults}
                    programMetadata={programMetadata}
                    setErrorReports={setErrorReports}
                    stagesList={stagesList}
                    setExportToExcel={setExportToExcel}
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
                    setSaveStatus={setSaveStatus}
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
                    setSaveStatus={setSaveStatus}
                    dePrefix={programMetadata.dePrefix || 'XXXXXXXXXXX'}
                />
            }
        </div>
    )
}

StageSections.propTypes = {
    hnqisMode: PropTypes.bool,
    programStage: PropTypes.object,
    readOnly: PropTypes.bool
}

export default StageSections;