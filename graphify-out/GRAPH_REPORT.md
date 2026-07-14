# Graph Report - Program-Config-App (2026-07-14)

## Corpus Check

- 216 files · ~103,873 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1088 nodes · 2435 edges · 77 communities (53 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `90122b72`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- [[_COMMUNITY_Data Types & Interfaces|Data Types & Interfaces]]
- [[_COMMUNITY_Excel Data Processor|Excel Data Processor]]
- [[_COMMUNITY_Excel Importer|Excel Importer]]
- [[_COMMUNITY_Import Validation Engine|Import Validation Engine]]
- [[_COMMUNITY_HNQIS2 Converter UI|HNQIS2 Converter UI]]
- [[_COMMUNITY_PCA Scripting & Rule Types|PCA Scripting & Rule Types]]
- [[_COMMUNITY_Stage Section Queries|Stage Section Queries]]
- [[_COMMUNITY_Data Element Editor|Data Element Editor]]
- [[_COMMUNITY_Program Attributes Modal|Program Attributes Modal]]
- [[_COMMUNITY_Setup Progress Dialog|Setup Progress Dialog]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Stage Creation & Export|Stage Creation & Export]]
- [[_COMMUNITY_Scripting Rule Builder|Scripting Rule Builder]]
- [[_COMMUNITY_Program Details Editor|Program Details Editor]]
- [[_COMMUNITY_HNQIS2 Metadata Transfer|HNQIS2 Metadata Transfer]]
- [[_COMMUNITY_App Bootstrap & Routing|App Bootstrap & Routing]]
- [[_COMMUNITY_Program Stage & Utilities|Program Stage & Utilities]]
- [[_COMMUNITY_About Page|About Page]]
- [[_COMMUNITY_Program Settings Step|Program Settings Step]]
- [[_COMMUNITY_New Program Creation|New Program Creation]]
- [[_COMMUNITY_Stage Section Types|Stage Section Types]]
- [[_COMMUNITY_Data Element Form|Data Element Form]]
- [[_COMMUNITY_New Program Type Defs|New Program Type Defs]]
- [[_COMMUNITY_Sharing UI Components|Sharing UI Components]]
- [[_COMMUNITY_PCA Config Constants|PCA Config Constants]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Org Units Screen|Org Units Screen]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Build Scripts|Build Scripts]]
- [[_COMMUNITY_TEA Editor|TEA Editor]]
- [[_COMMUNITY_Restore & Backup|Restore & Backup]]
- [[_COMMUNITY_Object Sharing|Object Sharing]]
- [[_COMMUNITY_PCA API Types|PCA API Types]]
- [[_COMMUNITY_Project Docs & CI|Project Docs & CI]]
- [[_COMMUNITY_State Reducers|State Reducers]]
- [[_COMMUNITY_Dev Dependencies & Tooling|Dev Dependencies & Tooling]]
- [[_COMMUNITY_App Icons & Logos|App Icons & Logos]]
- [[_COMMUNITY_Program New Stepper|Program New Stepper]]
- [[_COMMUNITY_Score Builder Rules|Score Builder Rules]]
- [[_COMMUNITY_Program Rules List|Program Rules List]]
- [[_COMMUNITY_Basic Settings Step|Basic Settings Step]]
- [[_COMMUNITY_Arrow Collapse Expand Icons|Arrow Collapse Expand Icons]]
- [[_COMMUNITY_Program & Sublevel Nav Icons|Program & Sublevel Nav Icons]]
- [[_COMMUNITY_Expand Chevron Icons|Expand Chevron Icons]]
- [[_COMMUNITY_Share & Upload Icons|Share & Upload Icons]]
- [[_COMMUNITY_Attributes Form Step|Attributes Form Step]]
- [[_COMMUNITY_Program New Utils|Program New Utils]]
- [[_COMMUNITY_Setup Split Button|Setup Split Button]]
- [[_COMMUNITY_Graphic E Series|Graphic E Series]]
- [[_COMMUNITY_Help & Compiling Icons|Help & Compiling Icons]]
- [[_COMMUNITY_Drag Handle Icons|Drag Handle Icons]]
- [[_COMMUNITY_Program Stage Actions|Program Stage Actions]]
- [[_COMMUNITY_Dev Tooling Docs|Dev Tooling Docs]]
- [[_COMMUNITY_D2 Config|D2 Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Close Icons|Close Icons]]
- [[_COMMUNITY_Download Icons|Download Icons]]
- [[_COMMUNITY_Data Element Icons|Data Element Icons]]
- [[_COMMUNITY_FAB Add Icons|FAB Add Icons]]
- [[_COMMUNITY_More Vert Icons|More Vert Icons]]
- [[_COMMUNITY_HNQIS & PATH Logos|HNQIS & PATH Logos]]
- [[_COMMUNITY_More Vert Alt Icons|More Vert Alt Icons]]
- [[_COMMUNITY_BAO Logo|BAO Logo]]
- [[_COMMUNITY_Cogs Icon|Cogs Icon]]
- [[_COMMUNITY_Hash Icon|Hash Icon]]
- [[_COMMUNITY_Edit Icon Black|Edit Icon Black]]
- [[_COMMUNITY_Edit Icon White|Edit Icon White]]
- [[_COMMUNITY_Error Icon|Error Icon]]
- [[_COMMUNITY_Warning Icon|Warning Icon]]
- [[_COMMUNITY_Scores Icon|Scores Icon]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)

1. `DeepCopy()` - 36 edges
2. `CustomMUIDialog` - 24 edges
3. `CustomMUIDialogTitle()` - 23 edges
4. `BaseMetadataObject` - 22 edges
5. `BaseIdentifiableObject` - 21 edges
6. `DataElement` - 19 edges
7. `Exporter()` - 17 edges
8. `ExporterTracker()` - 17 edges
9. `truncateString()` - 17 edges
10. `User` - 15 edges

## Surprising Connections (you probably didn't know these)

- `DHIS2 App Icon (src)` --semantically_similar_to--> `DHIS2 App Icon (public)` [INFERRED] [semantically similar]
  src/images/dhis2-app-icon.png → public/dhis2-app-icon.png
- `PCA App Icon (clipboard + gear configuration metaphor)` --semantically_similar_to--> `DHIS2 App Icon (public)` [INFERRED] [semantically similar]
  src/images/PCA-logo.png → public/dhis2-app-icon.png
- `ProgramDetails()` --calls--> `setProgram()` [INFERRED]
  src/components/PRG_Details/ProgramDetails.jsx → src/state/action-creators/program.js
- `BackupScreen()` --calls--> `formatDate()` [INFERRED]
  src/components/PRG_List/BackupScreen.jsx → src/utils/ExcelUtils.js
- `ExistingProgram` --references--> `CategoryCombo` [EXTRACTED]
  src/components/PRG_List/ProgramNew/programNew.types.ts → src/types/CategoryCombo.ts

## Import Cycles

- 3-file cycle: `src/types/BaseMetadataObject.ts -> src/types/User.ts -> src/types/Category.ts -> src/types/BaseMetadataObject.ts`
- 3-file cycle: `src/types/BaseMetadataObject.ts -> src/types/User.ts -> src/types/FileResource.ts -> src/types/BaseMetadataObject.ts`
- 3-file cycle: `src/types/BaseIdentifiableObject.ts -> src/types/User.ts -> src/types/CategoryOptionGroupSet.ts -> src/types/BaseIdentifiableObject.ts`
- 3-file cycle: `src/types/BaseIdentifiableObject.ts -> src/types/User.ts -> src/types/UserGroup.ts -> src/types/BaseIdentifiableObject.ts`
- 3-file cycle: `src/types/BaseIdentifiableObject.ts -> src/types/User.ts -> src/types/UserRole.ts -> src/types/BaseIdentifiableObject.ts`
- 5-file cycle: `src/types/BaseDimensionalItemObject.ts -> src/types/LegendSet.ts -> src/types/BaseMetadataObject.ts -> src/types/User.ts -> src/types/OrganisationUnit.ts -> src/types/BaseDimensionalItemObject.ts`
- 5-file cycle: `src/types/BaseDimensionalItemObject.ts -> src/types/BaseNameableObject.ts -> src/types/BaseIdentifiableObject.ts -> src/types/User.ts -> src/types/OrganisationUnit.ts -> src/types/BaseDimensionalItemObject.ts`

## Hyperedges (group relationships)

- **Release Pipeline: Workflow, Semantic Release, and Changelog** — \_github_workflows_release_yml, semantic_release_concept, changelog [INFERRED 0.90]
- **PCA built on DHIS2 to implement HNQIS methodology** — pca_program_config_app, dhis2_platform, hnqis_methodology [EXTRACTED 1.00]
- **Collapse / Expand Arrow Icon Set (Black and White variants)** — src_images_i_arrow_colaps_black_arrow_collapse_black, src_images_i_arrow_colaps_white_arrow_collapse_white, src_images_i_arrow_expand_black_arrow_expand_black, src_images_i_arrow_expand_white_arrow_expand_white [INFERRED 0.95]
- **Drag Handle Icon Set (Black, Gray, White variants)** — src_images_i_drag_black_drag_black, src_images_i_drag_gray_drag_gray, src_images_i_drag_white_drag_white [INFERRED 0.95]
- **Download Icon State Set (Default and Active)** — src_images_i_download_download, src_images_i_download_active_download_active [INFERRED 0.95]
- **Expand/Navigation Chevron Icon Set** — src_images_i_expand_left_black_svg, src_images_i_expand_left_white_svg, src_images_i_expanded_bottom_black_svg, src_images_i_expanded_bottom_white_svg, src_images_i_list_menu_arrow_svg [INFERRED 0.85]
- **HNQIS Help and Compiling Rules State Icon Set** — src_images_i_help_svg, src_images_i_help_active_svg, src_images_i_hnqis_compiling_rules_svg, src_images_i_hnqis_compiling_rules_active_svg [INFERRED 0.85]
- **Dark/Light Color Variant UI Icon Set** — src_images_i_edit_white_svg, src_images_i_more_vert_black_svg, src_images_i_more_vert_white_svg, src_images_i_fab_add_dark_svg, src_images_i_fab_add_light_svg [INFERRED 0.75]
- **Program Configuration Navigation Icon Set (black/white pairs)** — src_images_i_program_black_svg, src_images_i_program_white_svg, src_images_i_survey_black_svg, src_images_i_survey_white_svg, src_images_i_sublevel_arrow_black_svg, src_images_i_sublevel_arrow_white_svg, src_images_more_vert_black_svg, src_images_more_vert_white_svg, src_images_i_share_black_svg, src_images_i_share_white_svg [INFERRED 0.95]
- **Upload Action Icon State Pair (default and active)** — src_images_i_upload_svg, src_images_i_upload_active_svg [EXTRACTED 1.00]
- **HNQIS / PATH Application Brand Assets** — src_images_logo_hnqis_svg, src_images_path_logo_svg, src_images_scores_svg [INFERRED 0.75]

## Communities (77 total, 24 thin omitted)

### Community 0 - "Data Types & Interfaces"

Cohesion: 0.07
Nodes (50): Access, AccessData, AggregationType, AttributeValueObject, AttributeValues, BaseDimensionalItemObject, BaseIdentifiableObject, BaseLinkableObject (+42 more)

### Community 1 - "Excel Data Processor"

Cohesion: 0.07
Nodes (68): DataProcessor(), healthAreasQuery, legendSetsQuery, optionSetQuery, programsQuery, currentProgramQuery, DataProcessorTracker(), dePropertiesQuery (+60 more)

### Community 2 - "Excel Importer"

Cohesion: 0.06
Nodes (49): CurrentSectionsData, CurrentStagesData, HNQISSummary, Importer(), ImportResults, ImportSummaryState, PreviousData, ProgramMetadata (+41 more)

### Community 3 - "Import Validation Engine"

Cohesion: 0.06
Nodes (55): ValidateTracker(), ValidateMetadata(), metadataMutation, processProgramData(), processStageData(), queryId, queryProgram, SaveMetadata() (+47 more)

### Community 4 - "HNQIS2 Converter UI"

Cohesion: 0.09
Nodes (28): AssessmentPreviewProps, ModernSettingsAccordionProps, H2Convert(), HNQIS_VERSIONS, metadataMutation, queryHealthAreas, queryId, queryOptions (+20 more)

### Community 5 - "PCA Scripting & Rule Types"

Cohesion: 0.08
Nodes (33): DhisApiError, MetadataErrorReport, MetadataImportResponse, MetadataObjectReport, MetadataStats, MetadataTypeReport, PcaDataElement, PcaDeMetadata (+25 more)

### Community 6 - "Stage Section Queries"

Cohesion: 0.10
Nodes (34): CriticalCalculations(), createMutation, deleteMetadataMutation, queryAndroidSettingsAnalytics, queryAndroidSettingsSynchronization, queryCurrentUser, queryDashboards, QueryDataAndroidSettings (+26 more)

### Community 7 - "Data Element Editor"

Cohesion: 0.15
Nodes (17): DraggableDataElement(), DataElementItem(), DataElementStatusPool, DEActionsProps, DEStatus, getDEIcon(), ImportDataElement, Scores() (+9 more)

### Community 8 - "Program Attributes Modal"

Cohesion: 0.13
Nodes (16): AttributesModal(), createMutation, exitDisclaimerModal(), queryIds, queryProgram, queryTEA, InputModal(), ConversionStatusDialogProps (+8 more)

### Community 9 - "Setup Progress Dialog"

Cohesion: 0.14
Nodes (18): ICONS, ProgressStepProps, StepStatus, androidStatus(), androidText(), ErrorAccordionProps, formatFallbackError(), ParsedError (+10 more)

### Community 10 - "NPM Dependencies"

Cohesion: 0.07
Nodes (28): dependencies, core-js, @dhis2/app-runtime, @dhis2/data-engine, @dhis2/ui, @emotion/react, @emotion/styled, exceljs (+20 more)

### Community 11 - "Stage Creation & Export"

Cohesion: 0.26
Nodes (10): queryLegends, queryProgramSections, DHIS2_KEY_MAP, EXPORT_HNQIS_PRESETS, EXPORT_PRESETS, H2_ATTRIBUTES_TO_KEEP, H2_ENABLED_IMPORT_REMOVE_KEYS, JSON_ATTRIBUTE_SETTINGS (+2 more)

### Community 12 - "Scripting Rule Builder"

Cohesion: 0.09
Nodes (30): buildAttributesRules(), buildCompetencyRules(), buildCriticalScore(), buildFeedbackRules(), buildFeedbackTree(), buildNonCriticalScore(), buildProgramRules(), buildProgramRuleVariables() (+22 more)

### Community 13 - "Program Details Editor"

Cohesion: 0.13
Nodes (14): Alert, createMutation, deleteMetadataMutation, query, queryHNQIS2Metadata, queryIds, queryPR, queryProgramSettings (+6 more)

### Community 14 - "HNQIS2 Metadata Transfer"

Cohesion: 0.17
Nodes (12): dataStoreMutation, H2Metadata(), metadataMutation, queryHNQIS2Metadata, updateDataStoreMutation, Alert, ProgramList(), query (+4 more)

### Community 15 - "App Bootstrap & Routing"

Cohesion: 0.11
Nodes (12): App(), queryPCAAvailableMetadata, queryServerInfo, LoadingPage(), dataStoreMutation, dataStoreMutationUpdate, MetadataErrorPage(), metadataMutation (+4 more)

### Community 16 - "Program Stage & Utilities"

Cohesion: 0.14
Nodes (16): DependencyExport(), StageSections(), buildBasicFormStage(), changeAttributeValue(), characterPos(), getDataElementQuery(), getHnqisPCAType(), getJSONKeyTree() (+8 more)

### Community 17 - "About Page"

Cohesion: 0.14
Nodes (16): ABOUT_TABS, queryHNQIS2Metadata, queryPCAMetadata, TECHNOLOGIES, styles, AboutProps, AboutTabValue, MetadataQueryResponse (+8 more)

### Community 18 - "Program Settings Step"

Cohesion: 0.09
Nodes (21): CurrentUserResults, DataElementRef, ExistingProgram, FormAttribute, MetadataMutateResponse, MetadataRecord, NotificationPayload, PcaMetadataValue (+13 more)

### Community 19 - "New Program Creation"

Cohesion: 0.18
Nodes (18): metadataMutation, queryAvailablePrefix, queryCatCombos, queryCurrentUser, queryHNQIS2Metadata, queryId, queryIds, queryProgramType (+10 more)

### Community 20 - "Stage Section Types"

Cohesion: 0.13
Nodes (16): DataElementItemProps, AddedSectionState, AttributeValue, BackupData, DEActionsInterface, DEManagerState, ProgramInfo, ProgramStageData (+8 more)

### Community 21 - "Data Element Form"

Cohesion: 0.13
Nodes (13): legendSetsQuery, optionSetQuery, programRuleVariableQuery, queryId, MarkDownEditor(), RowRadioButtonsGroup(), ColorPicker(), InfoBox() (+5 more)

### Community 22 - "New Program Type Defs"

Cohesion: 0.11
Nodes (18): H2SettingRef, ProgramAttributeValue, ProgramSection, ProgramTeaState, ProgramTrackedEntityAttribute, SelectOption, ValidationErrors, buildTrackerTeaState() (+10 more)

### Community 23 - "Sharing UI Components"

Cohesion: 0.13
Nodes (14): ObjectSharing(), sharingQuery, SharingItem(), SharingOptions(), btnOptions, entitiesQuery, metadataMutation, psDataElementAccess (+6 more)

### Community 24 - "PCA Config Constants"

Cohesion: 0.12
Nodes (16): H2_REQUIRED, PCA_ATTRIBUTES, PCA_OPTION_SETS, PCA_OPTIONS, PCA_USER_ROLES, queryH2Attributes, queryH2DataElements, queryH2LegendSets (+8 more)

### Community 25 - "TypeScript Config"

Cohesion: 0.13
Nodes (14): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, moduleResolution (+6 more)

### Community 26 - "Org Units Screen"

Cohesion: 0.16
Nodes (13): metadataMutation, orgUnitsQuery, ouGroupQuery, OunitScreen(), ouQuery, programOrgUnitsQuery, searchOrgUnitQuery, dataStoreMutationUpdate (+5 more)

### Community 27 - "Package Metadata"

Cohesion: 0.15
Nodes (12): author, description, license, lint-staged, \*.{js,jsx,ts,tsx,css,md,json}, name, packageManager, private (+4 more)

### Community 28 - "Build Scripts"

Cohesion: 0.17
Nodes (12): scripts, build, deploy, format, format-d2, format:staged, lint, lint:staged (+4 more)

### Community 29 - "TEA Editor"

Cohesion: 0.31
Nodes (5): AssignedAttributes(), BasicForm(), FormAttribute(), FormSection(), SectionsForm()

### Community 30 - "Restore & Backup"

Cohesion: 0.22
Nodes (10): BackupScreen(), RestoreItem(), metadataMutation, metadataValidation, programRulesNVariableMutation, RestoreOptions(), StyledTableCell, RestoreScreen() (+2 more)

### Community 31 - "Object Sharing"

Cohesion: 0.15
Nodes (13): H2Transfer(), metadataMutation, queryEventList, queryProgramEvent, queryProgramMetadata, sharingQuery, VisualizationSharing(), buildH2BaseVisualizations() (+5 more)

### Community 32 - "PCA API Types"

Cohesion: 0.28
Nodes (6): DataElementForm(), a11yProps(), DataElementManager(), dataElementsSearchQuery, AlertDialogSlide(), Transition

### Community 33 - "Project Docs & CI"

Cohesion: 0.29
Nodes (7): Release GitHub Actions Workflow, Bootstrap Baseline Version Tag (v2.2.1), [3.0.0](https://github.com/psi-org/Program-Config-App/compare/v2.0.7...v3.0.0) (2026-06-29), ⚠ BREAKING CHANGES, Bug Fixes, Features, Semantic Release — Automated Versioning and Changelog

### Community 34 - "State Reducers"

Cohesion: 0.31
Nodes (5): reducers, reducer(), reducer(), composedEnhancer, store

### Community 35 - "Dev Dependencies & Tooling"

Cohesion: 0.25
Nodes (7): husky.sh script, devDependencies, @dhis2/cli-app-scripts, @dhis2/cli-style, dotenv, husky, react-error-overlay

### Community 36 - "App Icons & Logos"

Cohesion: 0.32
Nodes (8): DHIS2 App Icon (public), Favicon 16x16, Favicon 32x32, Favicon 48x48, DHIS2 App Icon (src), KTT (KnowTechture) Logo, PCA App Icon (clipboard + gear configuration metaphor), PSI (Population Services International) Logo

### Community 37 - "Program New Stepper"

Cohesion: 0.29
Nodes (7): clickableStepSx, ProgramNewStepper(), ProgramNewStepperProps, createOrUpdateMetaData(), getH2Metadata(), validateProgramForm(), isHnqisProgramType()

### Community 38 - "Score Builder Rules"

Cohesion: 0.25
Nodes (7): metadataMutation, queryId, StageNew(), FEATURE_TYPES, PERIOD_TYPES, REPORT_DATE_TO_USE, PS_Generic

### Community 39 - "Program Rules List"

Cohesion: 0.33
Nodes (5): ProgramRulesGroup(), ProgramRulesList(), queryActions, queryRules, scoreActions

### Community 40 - "Basic Settings Step"

Cohesion: 0.33
Nodes (3): BasicSettingsStepProps, ProgramType, HNQIS_VERSIONS

### Community 41 - "Arrow Collapse Expand Icons"

Cohesion: 0.33
Nodes (6): Collapse Arrow Icon (Black) - Right-pointing triangle, collapse/hide panel, Collapse Arrow Icon (White) - Right-pointing triangle, collapse/hide panel, Expand Arrow Icon (Black) - Down-pointing triangle, expand dropdown, Expand Arrow Icon (White) - Down-pointing triangle, expand dropdown, Contracted / Collapse Up Icon (Black) - Upward-pointing chevron, Contracted / Collapse Up Icon (White) - Upward-pointing chevron

### Community 42 - "Program & Sublevel Nav Icons"

Cohesion: 0.33
Nodes (6): Program Icon Black, Program Icon White, Sub-Level Arrow Icon Black, Sub-Level Arrow Icon White, Survey Icon Black, Survey Icon White

### Community 43 - "Expand Chevron Icons"

Cohesion: 0.40
Nodes (5): Expand Left / Chevron Right Icon (Black), Expand Left / Chevron Right Icon (White), Expand Bottom / Chevron Down Icon (Black), Expand Bottom / Chevron Down Icon (White), List Menu Arrow / Play Arrow Icon (Black)

### Community 44 - "Share & Upload Icons"

Cohesion: 0.40
Nodes (5): Share Icon Black, Share Icon White, Upload Icon (Active State), Upload Icon (Default), Open External Link Icon

### Community 46 - "Program New Utils"

Cohesion: 0.50
Nodes (4): ProgramNew(), cloneDeep(), getInitialSectionsEnabled(), toOption()

### Community 48 - "Graphic E Series"

Cohesion: 1.00
Nodes (4): Graphic E-1, Graphic E-2, Graphic E-3, Graphic E-4

### Community 49 - "Help & Compiling Icons"

Cohesion: 0.50
Nodes (4): Help Icon Active (Orange), Help Icon (Blue), HNQIS Compiling Rules Icon Active (Orange) — Monitor with Sparkles, HNQIS Compiling Rules Icon (Blue) — Monitor with Sparkles

### Community 50 - "Drag Handle Icons"

Cohesion: 0.67
Nodes (3): Drag Handle Icon (Black) - Two horizontal bars for drag-to-reorder, Drag Handle Icon (Gray/Semi-transparent) - Two horizontal bars for drag-to-reorder, Drag Handle Icon (White) - Two horizontal bars for drag-to-reorder

### Community 51 - "Program Stage Actions"

Cohesion: 0.24
Nodes (9): ProgramItem(), ProgramStage(), query, actionCreators, setProgramStage(), getAttributeValue(), getHnqisType(), isHnqisPCAType() (+1 more)

### Community 70 - "Community 70"

Cohesion: 0.29
Nodes (6): fieldSetStyle, orgUnitsQuery, ouUnitQuery, query, SelectOptions(), AGG_TYPES_H2_PI

### Community 71 - "Community 71"

Cohesion: 0.29
Nodes (5): Credits, Introduction, License, Program Configuration App, Usage and Installation

### Community 72 - "Community 72"

Cohesion: 0.33
Nodes (4): ProgramDetails(), hideShowLogic(), setProgram(), mapIdArray()

## Knowledge Gaps

- **291 isolated node(s):** `{ config }`, `husky.sh script`, `config`, `name`, `title` (+286 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `DeepCopy()` connect `Object Sharing` to `Excel Data Processor`, `Import Validation Engine`, `HNQIS2 Converter UI`, `Stage Section Queries`, `Community 72`, `Stage Creation & Export`, `Scripting Rule Builder`, `Program Details Editor`, `Program Stage & Utilities`, `Program Stage Actions`, `Sharing UI Components`, `Org Units Screen`, `Restore & Backup`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `CustomMUIDialog` connect `Program Attributes Modal` to `PCA API Types`, `Excel Importer`, `Import Validation Engine`, `HNQIS2 Converter UI`, `Score Builder Rules`, `Data Element Editor`, `Stage Creation & Export`, `Program Details Editor`, `HNQIS2 Metadata Transfer`, `About Page`, `New Program Creation`, `Org Units Screen`, `Restore & Backup`, `Object Sharing`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `CustomMUIDialogTitle()` connect `Program Attributes Modal` to `PCA API Types`, `Excel Importer`, `Import Validation Engine`, `HNQIS2 Converter UI`, `Score Builder Rules`, `Data Element Editor`, `Stage Creation & Export`, `Program Details Editor`, `HNQIS2 Metadata Transfer`, `About Page`, `New Program Creation`, `Org Units Screen`, `Restore & Backup`, `Object Sharing`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `{ config }`, `husky.sh script`, `config` to the rest of the system?**
  _292 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Types & Interfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.06891089108910892 - nodes in this community are weakly interconnected._
- **Should `Excel Data Processor` be split into smaller, more focused modules?**
  _Cohesion score 0.07315315315315316 - nodes in this community are weakly interconnected._
- **Should `Excel Importer` be split into smaller, more focused modules?**
  _Cohesion score 0.061367621274108705 - nodes in this community are weakly interconnected._
