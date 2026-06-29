export interface H2ConvertProps {
  program?: string;
  setConversionH2ProgramId: (value: string | undefined) => void;
  setNotification: (value: {
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }) => void;
  doSearch: (value: string) => void;
}

export interface H2SettingRef {
  handleFormValidation: () => boolean;
  saveMetaData: () => Record<string, unknown> & { useCompetencyClass?: string };
}

export interface AttributeValue {
  attribute: { id: string; name?: string };
  value: string;
}

export interface DataElement {
  id: string;
  name?: string;
  shortName?: string;
  code?: string;
  formName?: string;
  description?: string;
  displayDescription?: string;
  valueType?: string;
  aggregationType?: string;
  legendSets?: Array<{ id: string }>;
  attributeValues: AttributeValue[];
}

export interface ProgramStageDataElement {
  dataElement: DataElement;
  compulsory: boolean;
  displayInReports?: boolean;
  sortOrder?: number;
  programStage?: { id: string };
}

export interface PreviewDataElement {
  tabName: string;
  programStageDataElement: ProgramStageDataElement;
  metadata: Record<string, string>;
}

export interface PreviewSection {
  name: string;
  dataElements: PreviewDataElement[];
  sortOrder?: number;
  programStage?: { id: string };
  id?: string;
}

export interface PreviewScore {
  dataElement: DataElement;
  metadata: Record<string, string>;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ProgramQueryResponse {
  results?: {
    programs?: any[];
  };
}

export interface OptionSetQueryResponse {
  results?: {
    optionSets?: Array<{
      options: Array<{ code: string; name: string }>;
    }>;
  };
}

export interface OptionsQueryResponse {
  results?: {
    options?: Array<{ id: string; code: string }>;
  };
}

export interface IdQueryResponse {
  results?: {
    codes?: string[];
  };
}

export interface ProgramTypeQueryResponse {
  results?: {
    attributes?: Array<{ id: string }>;
  };
}
