import type { MetadataStats } from './MetadataImportResponse';

export interface TrackerErrorReport {
  message: string;
  errorCode?: string;
  trackerType?: string;
  uid?: string;
  args?: string[];
}

export interface TrackerValidationReport {
  errorReports: TrackerErrorReport[];
  warningReports?: TrackerErrorReport[];
}

export interface TrackerObjectReport {
  uid?: string;
}

export interface TrackerTypeReport {
  objectReports?: TrackerObjectReport[];
  stats?: MetadataStats;
}

export interface TrackerBundleReport {
  typeReportMap?: Record<string, TrackerTypeReport>;
}

/** Shape returned by DHIS2's /api/tracker import endpoint. */
export interface TrackerImportResponse {
  status: 'OK' | 'WARNING' | 'ERROR';
  validationReport?: TrackerValidationReport;
  bundleReport?: TrackerBundleReport;
  stats?: MetadataStats;
  message?: string;
}
