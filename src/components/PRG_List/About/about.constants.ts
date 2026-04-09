import {
  DATASTORE_H2_METADATA,
  DATASTORE_PCA_METADATA,
  NAMESPACE,
} from '../../../configs/Constants';
import type { Technology } from './about.types';

export const ABOUT_TABS = {
  BUILD: 'build',
  LIBRARIES: 'libraries',
} as const;

export const queryPCAMetadata = {
  results: {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}`,
  },
} as const;

export const queryHNQIS2Metadata = {
  results: {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
  },
} as const;

export const TECHNOLOGIES: Technology[] = [
  {
    name: 'React',
    url: 'https://react.dev/',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
  {
    name: 'DHIS2 App Runtime',
    url: 'https://developers.dhis2.org/docs/app-runtime/getting-started/',
    license: 'BSD-3-Clause',
    licenseUrl: 'https://opensource.org/license/bsd-3-clause',
  },
  {
    name: 'DHIS2 UI',
    url: 'https://developers.dhis2.org/docs/tutorials/ui-library/',
    license: 'BSD-3-Clause',
    licenseUrl: 'https://opensource.org/license/bsd-3-clause',
  },
  {
    name: 'Material UI',
    url: 'https://mui.com/',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
  {
    name: 'Material Icons',
    url: 'https://mui.com/material-ui/material-icons/',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
  {
    name: 'ExcelJS',
    url: 'https://github.com/exceljs/exceljs',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
  {
    name: 'Beautiful DnD',
    url: 'https://github.com/atlassian/react-beautiful-dnd',
    license: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
  },
  {
    name: 'Semver',
    url: 'https://github.com/npm/node-semver',
    license: 'ISC',
    licenseUrl: 'https://www.isc.org/licenses/',
  },
  {
    name: 'Tinycolor2',
    url: 'https://github.com/bgrins/TinyColor',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
  {
    name: 'React MD Editor',
    url: 'https://github.com/uiwjs/react-md-editor',
    license: 'MIT',
    licenseUrl: 'https://opensource.org/license/mit',
  },
].sort((a, b) => a.name.localeCompare(b.name));
