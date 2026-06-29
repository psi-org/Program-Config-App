import type { DataElement } from '../DataElement';
import type { OptionSet } from '../OptionSet';

/**
 * A plain attribute-value pair as returned by the DHIS2 API and used
 * throughout the PCA app (array form, not the record form).
 */
export interface PcaAttributeValue {
  attribute: { id: string; name?: string };
  value: string;
}

/**
 * A DHIS2 DataElement as it appears inside a PCA program stage section.
 *
 * Extends the base DataElement with:
 * - a required `id` (always present in API responses used by the app)
 * - `attributeValues` typed as the array form (DHIS2 always returns arrays
 *   for metadata objects, never the record form)
 * - PCA-specific attribute values carry FEEDBACK_ORDER, METADATA (JSON),
 *   etc. — see PcaDeMetadata for the parsed shape of the METADATA attribute
 */
export interface PcaDataElement extends Omit<DataElement, 'attributeValues'> {
  id: string;
  attributeValues: PcaAttributeValue[];
  optionSet?: OptionSet & { id: string };
  formName?: string;
}

/**
 * A program stage section whose data elements are PCA-extended.
 */
export interface PcaSection {
  id: string;
  name: string;
  displayName?: string;
  dataElements: PcaDataElement[];
  sortOrder?: number;
  errors?: unknown;
}
