/**
 * JSON structure stored as a string in the METADATA attribute value of a
 * PCA data element. Parsed at runtime with JSON.parse().
 */
export interface PcaDeMetadata {
  elemType?: 'score' | 'question' | 'label';
  varName?: string;
  scoreNum?: number;
  scoreDen?: number;
  isCritical?: 'Yes' | 'No';
  parentQuestion?: string;
  parentValue?: string;
  isCompulsory?: 'Yes' | 'No';
  labelFormName?: string;
  buildVersion?: string;
  dePrefix?: string;
  useCompetencyClass?: string;
  healthArea?: string;
}
