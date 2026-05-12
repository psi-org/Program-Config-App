import type React from 'react';
import type { DataElement, ProgramStageDataElement } from '../../../types';

export interface AttributeValue {
  attribute: { id: string };
  value: string;
}

export interface SharingAccess {
  access: string;
  id?: string;
  displayName?: string;
}

export interface SharingSettings {
  public: string;
  users: Record<string, SharingAccess>;
  userGroups: Record<string, SharingAccess>;
  external?: boolean;
  owner?: string;
}

export interface ProgramStageSection {
  id: string;
  name: string;
  displayName?: string;
  dataElements: DataElement[];
  sortOrder?: number;
}

export interface ProgramInfo {
  id: string;
  name: string;
  shortName: string;
  attributeValues: AttributeValue[];
  programStages: Array<{ id: string }>;
}

export interface ProgramStageData {
  id: string;
  displayName: string;
  name: string;
  formType: string;
  programStageDataElements: ProgramStageDataElement[];
  programStageSections: ProgramStageSection[];
  program: ProgramInfo;
}

export interface StageSectionsProps {
  programStage: ProgramStageData;
  stageRefetch: () => void;
  hnqisMode: boolean;
  readOnly: boolean;
}

export interface SnackParams {
  content: React.ReactNode;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface BackupData {
  sections: ProgramStageSection[];
  scoresSection: ProgramStageSection | undefined;
  currentSectionsData: ProgramStageSection[];
}

export interface DEManagerState {
  index: number;
  section: string;
  stage: string;
  sectionName: string;
}

export interface DEActionsInterface {
  deToEdit: string;
  setEdit: (de: string) => void;
  update: (
    de: string,
    section: string,
    stageDe: ProgramStageDataElement
  ) => void;
  remove: (de: string, section: string) => void;
  add: (index: number, section: string) => void;
}

export interface SectionActionsInterface {
  append: () => void;
  handleSectionEdit: (section?: number, newSection?: number) => void;
  remove: (section: ProgramStageSection) => void;
}

export interface AddedSectionState {
  index: number;
  mode: string;
  dataElements: Array<{ id: string; mode: string }>;
}

export interface NormalizedError {
  message: string;
  raw?: unknown;
}

export interface ResolvedPcaMetadata {
  ouRoot: string;
  ouLevelTable: number;
  ouLevelMap: number;
  useUserOrgUnit: boolean;
  healthArea?: string;
  useCompetencyClass?: string;
  teiDownloadAmount?: number;
  createAndroidAnalytics?: string;
  programIndicatorsAggType?: string;
  buildVersion?: string;
  dePrefix?: string;
  [key: string]: unknown;
}

export interface RunStepContext {
  pcaMetadata: ResolvedPcaMetadata;
  programConfig: {
    attributeValues: AttributeValue[];
    sharing: SharingSettings;
    programStages: Array<{ id: string }>;
  };
}

export type SaveAndBuildState = false | 'Run' | 'Completed';
