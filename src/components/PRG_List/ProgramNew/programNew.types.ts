import { CategoryCombo } from '../../../types';
import { TrackedEntityAttribute } from '../../../../.d2/shell/src/D2App/components/Excel/Importer';

export type ProgramType =
  | ''
  | 'hnqis'
  | 'hnqis2'
  | 'hnqis3'
  | 'tracker'
  | 'event';

export interface SelectOption {
  label: string;
  id: string;
}

export interface ValidationErrors {
  pgrType?: string;
  prefix?: string;
  programName?: string;
  shortName?: string;
  code?: string;
  programTET?: string;
  categoryCombo?: string;
  healthArea?: string;
  ouTableRow?: string;
  ouMapPolygon?: string;
  orgUnitRoot?: string;
}

export interface NotificationPayload {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface SnackParams {
  content: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface MetadataRecord {
  version?: string | number;
  date?: string;
}

export interface QueryResults<T> {
  results?: T;
}

export interface CurrentUserResults {
  id?: string;
  authorities?: string[];
}

export interface TrackedEntityAttribute {
  id: string;
  name?: string;
}

export interface ProgramTrackedEntityAttribute {
  trackedEntityAttribute: TrackedEntityAttribute;
  valueType?: string;
  allowFutureDate?: boolean;
  displayInList?: boolean;
  mandatory?: boolean;
  searchable?: boolean;
  renderType?: unknown;
  sortOrder?: number;
}

export interface FormAttribute {
  id: string;
  name?: string;
}

export interface ProgramSection {
  id: string;
  name: string;
  trackedEntityAttributes: FormAttribute[];
  sortOrder?: number;
  program?: {
    id: string;
  };
}

export interface TrackedEntityTypeAttribute {
  trackedEntityAttribute: {
    id: string;
    name?: string;
  };
}

export interface TrackedEntityType {
  id: string;
  name: string;
  trackedEntityTypeAttributes: TrackedEntityTypeAttribute[];
}

export type ProgramTeaItem = ProgramTrackedEntityAttribute;

export interface ProgramTeaState {
  available: ProgramTeaItem[];
  selected: string[];
}

export interface TransferChangePayload {
  selected: string[];
}

export interface ProgramStyle {
  icon?: string;
  color?: string;
}

export interface ProgramStageSectionRef {
  id: string;
}

export interface DataElementRef {
  id: string;
}

export interface ProgramStageDataElement {
  sortOrder?: number;
  compulsory?: boolean;
  displayInReports?: boolean;
  programStage?: {
    id: string;
  };
  dataElement: DataElementRef;
}

export interface ProgramStage {
  id: string;
  name?: string;
  validationStrategy?: string;
  program?: {
    id: string;
  };
  programStageSections?: Array<
    ProgramStageSectionRef & { dataElements?: DataElementRef[]; name?: string }
  >;
  programStageDataElements?: ProgramStageDataElement[];
}

export interface ProgramAttributeValue {
  attribute: {
    id: string;
  };
  value: string;
}

export interface ExistingProgram {
  id?: string;
  name?: string;
  shortName?: string;
  code?: string;
  style?: ProgramStyle;
  trackedEntityType?: TrackedEntityType;
  categoryCombo?: CategoryCombo;
  programStages?: ProgramStage[];
  programTrackedEntityAttributes?: ProgramTrackedEntityAttribute[];
  programSections?: ProgramSection[];
  attributeValues?: ProgramAttributeValue[];
}

export interface PcaMetadataValue {
  dePrefix?: string;
}

export interface ProgramNewProps {
  data?: ExistingProgram;
  doSearch: (value: string) => void;
  pcaMetadata?: PcaMetadataValue;
  programType?: ProgramType;
  programsRefetch: () => void;
  readOnly?: boolean;
  setNotification: (notification?: NotificationPayload) => void;
  setShowProgramForm: (value: boolean) => void;
}

export interface H2SettingRef {
  handleFormValidation: () => boolean;
  saveMetaData?: () => Record<string, unknown>;
  saveMetadata?: () => Record<string, unknown>;
}

export interface ProgramNewStepperProps {
  activeStep: number;
  basicValidated: boolean;
  hnqisValidated: boolean;
  pgrTypePCA: ProgramType;
  onStepChange: (step: number) => void;
}

export interface BasicSettingsStepProps {
  h2Enabled: boolean;
  hnqisMetadataVersion?: string | number;
  onChangeCode: (value: string) => void;
  onChangeDePrefix: (value: string) => void;
  onChangeProgramName: (value: string) => void;
  onChangeProgramShortName: (value: string) => void;
  onChangeProgramType: (value: ProgramType) => void;
  onProgramTETChange: (value: SelectOption | null) => void;
  pgrTypePCA: ProgramType;
  programCode: string;
  programColor?: string;
  programIcon: string;
  programName: string;
  programShortName: string;
  programTET: SelectOption | null;
  setProgramColor: (value?: string) => void;
  setProgramIcon: (value: string) => void;
  trackedEntityTypes: TrackedEntityType[];
  validationErrors: ValidationErrors;
  dePrefix: string;
  lockedProgramType?: ProgramType;
}

export interface ProgramSettingsStepProps {
  categoryCombo: SelectOption | null;
  onCategoryComboChange: (value: SelectOption | null) => void;
  onChangeTEAs: (payload: TransferChangePayload) => void;
  onValidationStrategyChange: (value: string) => void;
  pgrTypePCA: ProgramType;
  programCategoryCombos: CategoryCombo[];
  programTEAs: ProgramTeaState;
  validationErrors: ValidationErrors;
  validationStrategy: string;
}

export interface AttributesFormStepProps {
  assignedAttributes: ProgramTeaItem[];
  attributesFormSections: ProgramSection[];
  createPublicObjects: boolean;
  onAddNewSection: () => void;
  onToggleUseSections: (checked: boolean) => void;
  programTEAs: ProgramTeaState;
  setAssignedAttributes: (value: ProgramTeaItem[]) => void;
  setAttributesFormSections: (value: ProgramSection[]) => void;
  setProgramTEAs: (value: ProgramTeaState) => void;
  useSections: boolean;
}

export interface MetadataMutateResponse {
  status?: string;
  [key: string]: unknown;
}
