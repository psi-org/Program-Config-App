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
import { BUILD_VERSION, DATASTORE_H2_METADATA, FEEDBACK_ORDER, GENERATED_OBJECTS_NAMESPACE, H2_METADATA_VERSION, METADATA, NAMESPACE } from "../../configs/Constants.js";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants.js";
import { DeepCopy, buildBasicFormStage, extractMetadataPermissions, getProgramQuery, getSectionType, isCriterionDEGenerated, isDEQuestion, mapIdArray, programIsHNQISMWI, truncateString, versionGTE } from "../../utils/Utils.js";
import DataProcessor from "../Excel/DataProcessor.js";
import Importer from "../Excel/Importer.js";
import ErrorReports from "../UIElements/ErrorReports.js";
import Errors from "../UIElements/Errors.js";
import ImportDownloadButton from "../UIElements/ImportDownloadButton.js";
import Removed from "../UIElements/Removed.js";
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'
import CriticalCalculations from "./CriticalCalculations.js";
import DataElementManager from './DataElementManager.js'
import { buildH2BaseVisualizationsMWI, buildProgramIndicatorsMWI, buildProgramRulesMWI, buildProgramRuleVariablesMWI } from "./Logic_Scripts/HNQISMWI_Scripting.js";
import { checkScores, readQuestionComposites, buildProgramRuleVariables, buildProgramRules, buildProgramIndicators, buildH2BaseVisualizations } from "./Logic_Scripts/Scripting.js";//"./Logic_Scripts/HNQISMWI_Scripting.js";
import Scores from "./Scores.js";
import DraggableSection from "./Section.js";
import SectionManager from './SectionManager.js'
import ValidateMetadata from "./ValidateMetadata.js";

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

const StageSections = ({ programStage, stageRefetch, hnqisType, readOnly }) => {

    const queryDataStore = {
        results: {
            resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
            id: ({ id }) => id
        },
    };

    const dsCreateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
        type: "create",
        id: ({ id }) => id,
        data: ({ data }) => data,
    };

    const dsUpdateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programStage.program.id}`,
        type: "update",
        id: ({ id }) => id,
        data: ({ data }) => data,
    };

    //const { loading: dsLoading, data: dsData } = useDataQuery(queryDataStore);

    const { data: hnqis2Metadata, loading: metadataLoading } = useDataQuery(queryHNQIS2Metadata);

    // Globals
    const programId = programStage.program.id;
    const [isSectionMode] = useState(programStage.formType === "SECTION" || programStage.programStageDataElements.length === 0);
    const { data: currentUser } = useDataQuery(queryCurrentUser);

    const { data: androidSettings, refetch: refreshAndroidSettings } = useDataQuery(queryAndroidSettingsAnalytics);
    const [androidSettingsUpdate, { error: androidSettingsUpdateError }] = useDataMutation(updateAndroidSettingsAnalytics, {
        onError: (err) => {
            setAndroidSettingsError(err.details || err)
        }
    });

    const { refetch: refreshAndroidSettingsSync } = useDataQuery(queryAndroidSettingsSynchronization);
    const [androidSettingsSyncUpdate, { error: androidSettingsSyncUpdateError }] = useDataMutation(updateAndroidSettingsSynchronization, {
        onError: (err) => {
            setAndroidSettingsError(err.details || err)
        }
    });

    const [androidSettingsError, setAndroidSettingsError] = useState(undefined);
    const [programSettingsError, setProgramSettingsError] = useState(undefined);
    const { refetch: setOuLevel } = useDataQuery(queryOrganizationsUnit, { lazy: true, variables: { ouLevel: undefined } });
    const { refetch: getProgramSettings } = useDataQuery(queryProgramSettings, { lazy: true, variables: { programId } });

    // Flags
    const [saveStatus, setSaveStatus] = useState(hnqisType ? 'Validate' : 'Save Changes');
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [savedAndValidated, setSavedAndValidated] = useState(false)
    const [exportToExcel, setExportToExcel] = useState(false);

    const [importerEnabled, setImporterEnabled] = useState(false);
    const [importResults, setImportResults] = useState(false);
    const [progressSteps, setProgressSteps] = useState(0);
    const [validationResults, setValidationResults] = useState();

    const [editSectionIndex, setEditSectionIndex] = useState(undefined);
    const [newSectionIndex, setNewSectionIndex] = useState(undefined);
    const [showSectionManager, setShowSectionManager] = useState(false);

    const [deToEdit, setDeToEdit] = useState('')

    const [snackParams, setSnackParams] = useState(false)
    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })

    const [uidPool, setUidPool] = useState([]);
    const [allAuth, setAllAuth] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (currentUser) {
            setAllAuth(currentUser.results.authorities.includes('ALL'))
        }
    }, [currentUser])

    useEffect(() => {
        if (importerEnabled) {
            setErrorReports(undefined);
            setValidationResults(undefined);
        }
    }, [importerEnabled])

    // States
    const [removedElements, setRemovedElements] = useState([])
    const [originalProgramStageDataElements] = useState(programStage.programStageDataElements.reduce((acu, cur) => acu.concat(cur), []))
    const [sections, setSections] = useState((isSectionMode)
        ? [...programStage.programStageSections.filter(s => (s.name !== "Scores" && s.name !== "Critical Steps Calculations") || !hnqisType)]
        : [buildBasicFormStage(programStage.programStageDataElements)]
    );
    const [scoresSection, setScoresSection] = useState({ ...programStage.programStageSections.find(s => !!hnqisType && s.name === "Scores") });
    const [criticalSection, setCriticalSection] = useState({ ...programStage.programStageSections.find(s => !!hnqisType && s.name === "Critical Steps Calculations") });
    const [programStageDataElements, setProgramStageDataElements] = useState([...programStage.programStageDataElements]);
    const [programMetadata, setProgramMetadata] = useState();
    const [stagesList, setStagesList] = useState();
    const [errorReports, setErrorReports] = useState(undefined)

    const [addedSection, setAddedSection] = useState()
    const [backupData, setBackupData] = useState()

    const storeBackupdata = () => {
        setBackupData({
            sections: sections,
            scoresSection: scoresSection,
            currentSectionsData: programStage.programStageSections
        })
    }

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
        pushNotification(<span>Data Element edited! <strong>Remember to {hnqisType ? " Validate and Save!" : " save your changes!"}</strong></span>)
    }

    const removeDE = (id, section) => {
        const psdeIdx = programStageDataElements.findIndex(psde => psde.dataElement.id === id)
        const sectionIdx = sections.find(s => s.id === section)?.dataElements.findIndex(de => de.id === id)

        if (sectionIdx > -1 && psdeIdx > -1) {
            sections.find(s => s.id === section)?.dataElements.splice(sectionIdx, 1)
            programStageDataElements.splice(psdeIdx, 1)
            setSections(sections)
            setProgramStageDataElements(programStageDataElements)
            if (hnqisType) { setSaveStatus('Validate & Save') }
            pushNotification(<span>Data Element removed! <strong>Remember to {hnqisType ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
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
        pushNotification(<span>{params.newDataElements.length} Data Element{params.newDataElements.length > 1 ? 's' : ''} added! <strong>Remember to {hnqisType ? " Validate and Save!" : " save your changes!"}</strong></span>)
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
        if (hnqisType) { setSaveStatus('Validate & Save') }
        pushNotification(<span>{`Section '${section.name}' removed! `}<strong>Remember to {hnqisType ? " Validate and Save!" : " save your changes!"}</strong></span>, "info")
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
    const deleteMetadata = useDataMutation(deleteMetadataMutation, {
        onError: (err) => {
            console.error(err)
        }
    })[0];

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
    const idsQuery = useDataQuery(queryIds, { lazy: true, variables: { n: programStage.programStageDataElements.length } });
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
            (sections.reduce((prev, acu) => prev + acu.dataElements.length, 10) * 10) //x10 to avoid missing IDs
            + ((scoresSection?.dataElements?.length || 10) * 2) //Doubled to create Program Rule Variables
            + ((criticalSection?.dataElements?.length || 10) * 10)
        ) + programIndicatorsAmount + visualizationsAmount + androidSettingsAmount;

        //No Sections , get minimum ids for core Program Rules
        if (isNaN(n) || n < 50) { n = 50 }

        idsQuery.refetch({ n }).then(data => {
            if (data) {
                setUidPool(data.results.codes)
            }
        })
    }

    useEffect(() => {
        getUIDs()
    }, [sections]);

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
                setSaveStatus(hnqisType ? 'Validate & Save' : 'Save Changes');
                break;
            case 'DATA_ELEMENT': {
                
                if(programIsHNQISMWI(hnqisType) ) {
                    dragDataElement(newSections, result)
                }
                
                else {
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
                }
                setSaveStatus(hnqisType ? 'Validate & Save' : 'Save Changes');
                break;
            }
            default:
        }
        
        setSections(JSON.parse(JSON.stringify(newSections)));
    };
    
    const dragDataElement = (newSections, result) => {
        if (result.source.droppableId === result.destination.droppableId) {
            // Same section
            const sectionIndex = newSections.findIndex(s => s.id === result.source.droppableId);
            const section = newSections[sectionIndex];
            const { dataElements } = section;

            // Ensure "generated" DEs stay at the end of the list
            const questions = dataElements.filter(de => isDEQuestion(de));
            const generated = dataElements.filter(de => isCriterionDEGenerated(de));

            if (result.destination.index < questions.length) {
                // Allow reordering only within "question" DEs
                section.dataElements = [
                    ...reorder(questions, result.source.index, result.destination.index),
                    ...generated,
                ];
            }
        } else {
            // Different section
            const sourceSection = newSections.find(s => s.id === result.source.droppableId);
            const destSection = newSections.find(s => s.id === result.destination.droppableId);

            const element = sourceSection.dataElements[result.source.index];

            // if (element.type === 'question') {
            if( isDEQuestion(element) ) {
                // Remove the element from the source section
                sourceSection.dataElements.splice(result.source.index, 1);

                // Ensure "generated" DEs remain at the end in the destination section
                const questions = destSection.dataElements.filter(de => isDEQuestion(de));
                const generated = destSection.dataElements.filter(de => isCriterionDEGenerated(de));

                // Insert the element into the destination section
                questions.splice(result.destination.index, 0, element);
                destSection.dataElements = [...questions, ...generated];
            }
        }
    }
    
    // const canDragDataElement = (newSections, dragData) => {
    //     let sourceDE
    //     let destinationDE
        
    //     if (dragData.source.droppableId == dragData.destination.droppableId) {
    //         //Same section
    //         const sectionIndex = newSections.findIndex(s => s.id == dragData.source.droppableId)
    //         sourceDE = newSections[sectionIndex].dataElements.find((item => item.id === dragData.draggableId))
    //         destinationDE = newSections[sectionIndex].dataElements[dragData.destination.index]
    //     } else {
    //         //Different section
    //         sourceDE = newSections.find(s => s.id == dragData.source.droppableId).dataElements.find((item => item.id === dragData.draggableId))
    //         destinationDE = newSections.find(s => s.id == dragData.destination.droppableId).dataElements[dragData.destination.index]
    //     }
        
    //     return( isDEQuestion(sourceDE) && isDEQuestion(destinationDE) )
        
    //     // for( const section of newSections ) {
    //     //     const foundDE = section.dataElements.find((psDataElement => psDataElement.dataElement.id === id
    //     //     ))
    //     //     if( foundDE ) return foundDE
    //     // }
        
    //     // return
    // }

    const commit = () => {
        setAddedSection(undefined)
        if (createMetadata.data && createMetadata.data.status) { delete createMetadata.data.status }
        const removed = originalProgramStageDataElements.filter(psde => !programStageDataElements.find(de => de.dataElement.id === psde.dataElement.id)).map(psde => psde.dataElement);
        setRemovedElements(removed);
        setErrorReports(undefined);
        setSavingMetadata(true);
        return;
    };

    useEffect(() => {
        if (androidSettingsError || androidSettingsSyncUpdateError) { updateProgramBuildVersion(programId) }
    }, [androidSettingsUpdateError, androidSettingsSyncUpdateError])

    const updateProgramBuildVersion = (programId) => {
        getProgramSettings({ programId }).then(res => {
            res.results?.attributeValues.forEach(av => {
                if (av.attribute.id === METADATA) {
                    const pcaMetadata = JSON.parse(av.value || "{}")
                    pcaMetadata.buildVersion = BUILD_VERSION;
                    av.value = JSON.stringify(pcaMetadata)
                }
            })
            createMetadata.mutate({ data: { programs: [res.results] } }).then(response => {
                if (response.status === 'OK') {
                    setProgressSteps(8)
                    setSaveAndBuild('Completed');
                    setSavedAndValidated(false);

                    prDQ.refetch();
                    prvDQ.refetch();
                    pIndDQ.refetch();
                    visualizationsDQ.refetch();
                    eventReportDQ.refetch();
                    mapsDQ.refetch();
                    getUIDs();
                }
            })
        })
    }

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

    const executeStep7B = () => {
        // VI. Enable in-app analytics
        refreshAndroidSettingsSync().then(androidSettings => {
            if (androidSettings?.results) {
                const settings = androidSettings.results;
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
                }

                androidSettingsSyncUpdate({ data: settings }).then(res => {
                    if (res.status === 'OK') {
                        setAndroidSettingsError(undefined)
                    }
                    updateProgramBuildVersion(programId)
                })

            } else {
                updateProgramBuildVersion(programId)
            }
        })
    }

    const executeStep7A = (androidSettingsVisualizations) => {
        // VI. Enable in-app analytics
        refreshAndroidSettings().then(androidSettings => {
            if (androidSettings?.results) {

                const settings = buildAndroidSettings(androidSettings, uidPool.shift(), androidSettingsVisualizations)
                androidSettingsUpdate({ data: settings.results }).then(res => {
                    if (res.status === 'OK') {
                        executeStep7B();
                    } else {
                        updateProgramBuildVersion(programId)
                    }
                })

            } else {
                updateProgramBuildVersion(programId)
            }
        })
    }

    const executeStep6 = ({ metadata, androidSettingsVisualizations, sendToDataStore, dataStoreData }) => {
        createMetadata.mutate({ data: metadata }).then(response => {
            if (response.status === 'OK') {
                sendToDataStore({ data: dataStoreData }).then(dataStoreResp => {
                    if (dataStoreResp.status != 'OK') {
                        console.error(dataStoreResp);
                    } else {
                        setProgressSteps(7);
                        executeStep7A(androidSettingsVisualizations);
                    }
                })
            }
        });
    }

    const executeHNQISProcess = ({pcaMetadata, sharingSettings, actionPlanID}) => {
        // --------------- PROCESSING ---------------- //
        // Globals, States & more...

        // I. Scores Checking
        // Requires: scoresSection
        //      Break point: When duplicated scores found
        setProgressSteps(2);

        const { uniqueScores, compositeScores, duplicatedScores } = checkScores(scoresSection.dataElements);
        if (!uniqueScores) { throw { msg: "Duplicated scores", duplicatedScores, status: 400 } }
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
        if (missingComposites.length > 0) { throw { msg: "Some questions Feedback Order don't match any Score item", missingComposites, status: 400 } }

        // III. Build new metadata
        // Program Rule Variables : Data Elements (questions & labels) , Calculated Values, Critical Steps + Competency Class
        // Also, Program Indicators and Visualizations
        setProgressSteps(4);

        const programRuleVariables = buildProgramRuleVariables(
            {
                sections,
                compositeScores,
                programId,
                useCompetencyClass: programMetadata.useCompetencyClass,
                uidPool
            }
        );

        const { programRules, programRuleActions, scoreMap } = buildProgramRules(
            {
                sections,
                stageId: programStage.id,
                programId,
                compositeValues: compositeScores,
                scoresMapping,
                uidPool,
                useCompetencyClass: programMetadata.useCompetencyClass,
                healthArea: programMetadata.healthArea
            }
        );

        const { programIndicators, indicatorIDs, gsInd } = buildProgramIndicators(
            {
                programId,
                programStage,
                scoreMap,
                uidPool,
                useCompetency: programMetadata.useCompetencyClass,
                sharingSettings,
                PIAggregationType: programMetadata.programIndicatorsAggType
            }
        );

        const { visualizations, androidSettingsVisualizations, maps, dashboards, eventReports } = buildH2BaseVisualizations(
            {
                programId,
                programShortName: programStage.program.shortName,
                gsInd,
                indicatorIDs,
                uidPool,
                useCompetency: programMetadata.useCompetencyClass,
                currentDashboardId: dashboardsDQ?.data?.results?.dashboards[0]?.id,
                userOU: pcaMetadata.useUserOrgUnit,
                ouRoot: pcaMetadata.ouRoot,
                sharingSettings,
                visualizationLevel: pcaMetadata.ouLevelTable,
                mapLevel: pcaMetadata.ouLevelMap,
                actionPlanID
            }
        );

        const metadata = {
            programRuleVariables,
            programRules,
            programRuleActions,
            programIndicators,
            visualizations,
            maps,
            dashboards,
            eventReports
        };

        // IV. Prepare Datastore references 
        getDataStore().then((dataStoreResult) => {
            const programRefereces = {
                programRules: mapIdArray(programRules),
                programRuleVariables: mapIdArray(programRuleVariables),
                programIndicators: mapIdArray(programIndicators),
                visualizations: mapIdArray(visualizations),
                eventReports: mapIdArray(eventReports),
                maps: mapIdArray(maps),
                dashboards: mapIdArray(dashboards)
            };

            let dataStoreData;
            let sendToDataStore;

            if (!dataStoreResult?.results) {
                sendToDataStore = dataStoreCreate;
                dataStoreData = {};
            } else {
                sendToDataStore = dataStoreUpdate;
                dataStoreData = dataStoreResult.results;
            }

            // Saving UIDs of old objects
            const toDeleteReferences = DeepCopy(dataStoreData);
            // Setting new UIDs
            dataStoreData = programRefereces;

            // V. Delete old metadata
            setProgressSteps(5);

            const fallbackRuleVariables = prvDQ.data.results.programRuleVariables.filter(prv => {
                return prv.name[0] == "_";
            });

            const programRulesDel = toDeleteReferences?.programRules || mapIdArray(prDQ.data.results.programRules);
            const programRuleVariablesDel = toDeleteReferences?.programRuleVariables || mapIdArray(fallbackRuleVariables);
            const programIndicatorsDel = toDeleteReferences?.programIndicators || mapIdArray(pIndDQ.data.results.programIndicators);
            const visualizationsDel = toDeleteReferences?.visualizations || mapIdArray(visualizationsDQ.data.results.visualizations);
            const eventReportsDel = toDeleteReferences?.eventReports || mapIdArray(eventReportDQ.data.results.eventReports);
            const mapsDel = toDeleteReferences?.maps || mapIdArray(mapsDQ.data.results.maps);

            const oldMetadata = {
                programRules: (programRulesDel.length > 0 ? programRulesDel : undefined),
                programRuleVariables: (programRuleVariablesDel.length > 0 ? programRuleVariablesDel : undefined),
                programIndicators: (programIndicatorsDel.length > 0 ? programIndicatorsDel : undefined),
                visualizations: (visualizationsDel.length > 0 ? visualizationsDel : undefined),
                eventReports: (eventReportsDel.length > 0 ? eventReportsDel : undefined),
                maps: (mapsDel.length > 0 ? mapsDel : undefined)
            };

            // VI. Import new metadata
            createMetadata.mutate({
                data: {
                    eventReports: eventReportDQ.data.results.eventReports.map(er => {
                        er.columnDimensions = ["pe", "ou"]
                        er.dataElementDimensions = [];
                        er.programIndicatorDimensions = [];
                        return er;
                    })
                }
            }).then(updateEventReportResp => {
                if (updateEventReportResp.status == 'OK') {
                    deleteMetadata({ data: oldMetadata }).then((res) => {
                        if (res.status != 'OK') { return; }
                        sendToDataStore({
                            data: {
                                dashboards: dataStoreData.dashboards,
                            }
                        }).then(dataStoreResp => {
                            if (dataStoreResp.status != 'OK') {
                                console.error(dataStoreResp);
                            } else {
                                setProgressSteps(6);
                                executeStep6({ metadata, androidSettingsVisualizations, sendToDataStore, dataStoreData });
                            }
                        });
                    });
                }
            });
        });
    }

    const executeMWIProcess = ({ pcaMetadata, sharingSettings }) => {
        // --------------- PROCESSING ---------------- //
        // Globals, States & more...

        // I. Scores Checking
        // Requires: scoresSection
        //      Break point: When duplicated scores found
        setProgressSteps(2);

        // II. Read questions
        // Requires: sections (with or WITHOUT scores&critical)
        //      Breakpoint: When a score is missing
        setProgressSteps(3);

        // III. Build new metadata
        // Program Rule Variables : Data Elements (questions & labels) , Calculated Values, Critical Steps + Competency Class
        // Also, Program Indicators and Visualizations
        setProgressSteps(4);

        const { programRuleVariables, dataElementVarMapping } = buildProgramRuleVariablesMWI({ sections, programId, uidPool });

        const { programRules, programRuleActions, criterionRulesGroup, questionsList } = buildProgramRulesMWI(
            {
                programStage,
                sections,
                dataElementVarMapping,
                programId,
                uidPool,
                healthArea: programMetadata.healthArea
            }
        );

        const { programIndicators, indicatorIDs } = buildProgramIndicatorsMWI(
            {
                sections: sections.map(s => s.id),
                programStage,
                criterionRulesGroup,
                questionsList,
                uidPool,
                sharingSettings,
                PIAggregationType: programMetadata.programIndicatorsAggType
            }
        );

        const { visualizations, androidSettingsVisualizations, maps, dashboards, eventReports } = buildH2BaseVisualizationsMWI(
            {
                programId,
                programShortName: programStage.program.shortName,
                indicatorIDs,
                uidPool,
                currentDashboardId: dashboardsDQ?.data?.results?.dashboards[0]?.id,
                userOU: pcaMetadata.useUserOrgUnit,
                ouRoot: pcaMetadata.ouRoot,
                sharingSettings,
                visualizationLevel: pcaMetadata.ouLevelTable,
                mapLevel: pcaMetadata.ouLevelMap
            }
        );

        const metadata = {
            programRuleVariables,
            programRules,
            programRuleActions,
            programIndicators,
            visualizations,
            maps,
            dashboards,
            eventReports
        };

        // IV. Prepare Datastore references 
        getDataStore().then((dataStoreResult) => {
            const programRefereces = {
                programRules: mapIdArray(programRules),
                programRuleVariables: mapIdArray(programRuleVariables),
                programIndicators: mapIdArray(programIndicators),
                visualizations: mapIdArray(visualizations),
                eventReports: mapIdArray(eventReports),
                maps: mapIdArray(maps),
                dashboards: mapIdArray(dashboards)
            };

            let dataStoreData;
            let sendToDataStore;

            if (!dataStoreResult?.results) {
                sendToDataStore = dataStoreCreate;
                dataStoreData = {};
            } else {
                sendToDataStore = dataStoreUpdate;
                dataStoreData = dataStoreResult.results;
            }

            // Saving UIDs of old objects
            const toDeleteReferences = DeepCopy(dataStoreData);
            // Setting new UIDs
            dataStoreData = programRefereces;

            // V. Delete old metadata
            setProgressSteps(5);

            const fallbackRuleVariables = prvDQ.data.results.programRuleVariables.filter(prv => {
                return prv.name[0] == "_";
            });

            const programRulesDel = toDeleteReferences?.programRules || mapIdArray(prDQ.data.results.programRules);
            const programRuleVariablesDel = toDeleteReferences?.programRuleVariables || mapIdArray(fallbackRuleVariables);
            const programIndicatorsDel = toDeleteReferences?.programIndicators || mapIdArray(pIndDQ.data.results.programIndicators);
            const visualizationsDel = toDeleteReferences?.visualizations || mapIdArray(visualizationsDQ.data.results.visualizations);
            const eventReportsDel = toDeleteReferences?.eventReports || mapIdArray(eventReportDQ.data.results.eventReports);
            const mapsDel = toDeleteReferences?.maps || mapIdArray(mapsDQ.data.results.maps);

            const oldMetadata = {
                programRules: (programRulesDel.length > 0 ? programRulesDel : undefined),
                programRuleVariables: (programRuleVariablesDel.length > 0 ? programRuleVariablesDel : undefined),
                programIndicators: (programIndicatorsDel.length > 0 ? programIndicatorsDel : undefined),
                visualizations: (visualizationsDel.length > 0 ? visualizationsDel : undefined),
                eventReports: (eventReportsDel.length > 0 ? eventReportsDel : undefined),
                maps: (mapsDel.length > 0 ? mapsDel : undefined)
            };

            // VI. Import new metadata
            createMetadata.mutate({
                data: {
                    eventReports: eventReportDQ.data.results.eventReports.map(er => {
                        er.columnDimensions = ["pe", "ou"]
                        er.dataElementDimensions = [];
                        er.programIndicatorDimensions = [];
                        return er;
                    })
                }
            }).then(updateEventReportResp => {
                if (updateEventReportResp.status != 'OK') { return; }
                
                deleteMetadata({ data: oldMetadata }).then((res) => {
                    if (res.status != 'OK') { return }
                    
                    setProgressSteps(6);
                    executeStep6({ metadata, androidSettingsVisualizations, sendToDataStore, dataStoreData });
                });
            });
        });
    }

    const run = () => {
        if (!savedAndValidated) { return }
        //--------------------- NEW METADATA --------------------//
        setProgressSteps(1);
        const programConfig = programAttributes.results?.programs[0];
        const pcaMetadata = JSON.parse(programConfig?.attributeValues?.find(pa => pa.attribute.id === METADATA)?.value || "{}");
        const sharingSettings = programConfig?.sharing;
        sharingSettings.public = extractMetadataPermissions(sharingSettings.public);

        //Sharing Settings fix for 2.36
        //------------
        if (!sharingSettings.users) {
            sharingSettings.users = {};
        }

        if (!sharingSettings.userGroups) {
            sharingSettings.userGroups = {};
        }
        //------------

        Object.keys(sharingSettings.users).forEach(key => {
            const access = sharingSettings.users[key]
            access.access = extractMetadataPermissions(access.access)
        });
        Object.keys(sharingSettings.userGroups).forEach(key => {
            const access = sharingSettings.userGroups[key]
            access.access = extractMetadataPermissions(access.access)
        });

        // Set flag to enable/disable actions (buttons)
        setSaveAndBuild('Run');

        //--------------------- Organization Unit Validations -----------//
        if (!Object.hasOwn(pcaMetadata, "ouRoot") ||
            !Object.hasOwn(pcaMetadata, "ouLevelTable") ||
            !Object.hasOwn(pcaMetadata, "ouLevelMap") ||
            !Object.hasOwn(pcaMetadata, "useUserOrgUnit")) {
            setProgramSettingsError(1);
            setSaveAndBuild("Completed");
            return;
        }
        if (pcaMetadata.useUserOrgUnit == "Yes") {
            pcaMetadata.useUserOrgUnit = true
        } else {
            pcaMetadata.useUserOrgUnit = false
        }

        //-------------------------------------------------------//
        setOuLevel({ ouLevel: [pcaMetadata.ouLevelTable, pcaMetadata.ouLevelMap] }).then((data) => {
            if (data?.results?.organisationUnitLevels) {
                const valueLevel = data?.results?.organisationUnitLevels
                const visualizationLevel = valueLevel.find(ouLevel => ouLevel.id === pcaMetadata.ouLevelTable)
                const mapLevel = valueLevel.find(ouLevel => ouLevel.id === pcaMetadata.ouLevelMap)

                pcaMetadata.ouLevelTable = visualizationLevel?.offlineLevels || visualizationLevel?.level
                pcaMetadata.ouLevelMap = mapLevel?.offlineLevels || mapLevel?.level

                if (visualizationLevel == undefined || mapLevel == undefined) {
                    setProgramSettingsError(2);
                    setSaveAndBuild("Completed");
                    return;
                }

                switch (hnqisType) {
                    case TEMPLATE_PROGRAM_TYPES.hnqis2:
                        executeHNQISProcess({
                            pcaMetadata,
                            sharingSettings,
                            actionPlanID: programStage.program.programStages.filter(ps => ps.id != programStage.id)[0].id
                        });
                        break;
                    case TEMPLATE_PROGRAM_TYPES.hnqismwi:
                        executeMWIProcess({ pcaMetadata, sharingSettings });
                        break;
                }
            }
        })
    }

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

    if (hnqisType && !metadataLoading && !versionGTE(hnqis2Metadata?.results?.version, H2_METADATA_VERSION)) {
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
                        {hnqisType && isSectionMode &&
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
                        {hnqisType && isSectionMode &&
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
            {hnqisType && importerEnabled &&
                <Importer
                    displayForm={setImporterEnabled}
                    setImportResults={setImportResults}
                    setValidationResults={setValidationResults}
                    programSpecificType={hnqisType}
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
            {!!hnqisType && exportToExcel &&
                <DataProcessor
                    programName={programStage.program.name}
                    ps={programStage}
                    isLoading={setExportToExcel}
                    hnqisType={hnqisType}
                />}
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
            {!!hnqisType && saveAndBuild &&

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
                        {(progressSteps > 1) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 2 && <CircularLoader small />}
                                {progressSteps === 2 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Checking scores</p>
                            </div>
                        }
                        {(progressSteps > 2) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 3 && <CircularLoader small />}
                                {progressSteps === 3 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Reading assessment&apos;s questions</p>
                            </div>
                        }
                        {(progressSteps > 3) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 4 && <CircularLoader small />}
                                {progressSteps === 4 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Building new metadata and analytics</p>
                            </div>
                        }
                        {(progressSteps > 4) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 5 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 5 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 5 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Deleting old metadata</p>
                            </div>
                        }
                        {(progressSteps > 5) && !programSettingsError &&
                            <div className="progressItem">
                                {progressSteps === 6 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 6 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 6 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Importing new metadata</p>
                            </div>
                        }
                        {(progressSteps > 6) && !programSettingsError &&
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
                                                    hnqisType={hnqisType}
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
                        {hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2 && (isSectionMode) &&
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
                    hnqisType={hnqisType}
                    newDEQty={importResults ? importResults.questions.new + importResults.scores.new + importResults.sections.new : 0}
                    programStage={programStage}
                    importedSections={sections}
                    importedScores={scoresSection}
                    criticalSection={criticalSection}
                    removedItems={importResults ? importResults.questions.removedItems.concat(importResults.scores.removedItems || []) : removedElements}
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
                    stageRefetch={stageRefetch}
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
                    hnqisType={hnqisType}
                    hnqisMode={!!hnqisType}
                    setSaveStatus={setSaveStatus}
                />
            }
            {deManager &&
                <DataElementManager
                    program={programStage.program.id}
                    deRef={deManager}
                    setDeManager={setDeManager}
                    sectionType={getSectionType({name: deManager.sectionName})}
                    programStageDataElements={programStageDataElements}
                    saveAdd={saveAdd}
                    hnqisType={hnqisType}
                    hnqisMode={!!hnqisType}
                    setSaveStatus={setSaveStatus}
                    dePrefix={programMetadata.dePrefix || 'XXXXXXXXXXX'}
                />
            }
        </div>
    )
}

StageSections.propTypes = {
    hnqisType: PropTypes.string,
    programStage: PropTypes.object,
    readOnly: PropTypes.bool,
    stageRefetch: PropTypes.func
}

export default StageSections;
