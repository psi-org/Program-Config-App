export interface MetadataErrorReport {
  message?: string;
  errorCode?: string;
  mainKlass?: string;
  errorProperties?: string[];
}

export interface MetadataObjectReport {
  klass?: string;
  uid?: string;
  errorReports?: MetadataErrorReport[];
}

export interface MetadataStats {
  created?: number;
  updated?: number;
  deleted?: number;
  ignored?: number;
  total?: number;
}

export interface MetadataTypeReport {
  klass?: string;
  stats?: MetadataStats;
  objectReports?: MetadataObjectReport[];
}

/** Shape returned by DHIS2's /api/metadata endpoint (POST / DELETE strategy). */
export interface MetadataImportResponse {
  status: 'OK' | 'WARNING' | 'ERROR';
  stats?: MetadataStats;
  typeReports?: MetadataTypeReport[];
  message?: string;
}
