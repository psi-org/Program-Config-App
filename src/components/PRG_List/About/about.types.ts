export interface AboutProps {
  aboutModal: boolean;
  setAboutModal: (value: boolean) => void;
}

export interface MetadataRecord {
  version: string | number;
  date: string;
}

export interface MetadataQueryResponse {
  results?: MetadataRecord;
}

export interface Technology {
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
}

export type AboutTabValue = 'build' | 'libraries';
