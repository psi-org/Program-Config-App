import type { BaseIdentifiableObject } from './BaseIdentifiableObject';
import type { DataElement } from './DataElement';
import type { DeviceRenderTypeMap } from './DeviceRenderTypeMap';
import type { ProgramStage } from './ProgramStage';

export interface ProgramStageDataElement extends BaseIdentifiableObject {
  programStage?: ProgramStage;
  dataElement?: DataElement;
  compulsory?: boolean;
  allowProvidedElsewhere?: boolean;
  sortOrder?: number;
  displayInReports?: boolean;
  allowFutureDate?: boolean;
  renderOptionsAsRadio?: boolean;
  renderType?: DeviceRenderTypeMap;
  skipSynchronization?: boolean;
  skipAnalytics?: boolean;
}
