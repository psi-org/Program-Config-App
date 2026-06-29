import { FlyoutMenu, MenuItem, Popper, Layer, Tag } from '@dhis2/ui';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import DEIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import LabelIcon from '@mui/icons-material/LabelImportant';
import LaunchIcon from '@mui/icons-material/Launch';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QuizIcon from '@mui/icons-material/Quiz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IconButton, Tooltip } from '@mui/material';
import Chip from '@mui/material/Chip';
import React, { useState } from 'react';
import { METADATA } from '../../configs/Constants.jsx';
import { ProgramStageDataElement, DataElement } from '../../types';
import AlertDialogSlide from '../UIElements/AlertDialogSlide.jsx';
import BadgeErrors from '../UIElements/BadgeErrors.jsx';
import BadgeWarnings from '../UIElements/BadgeWarnings.jsx';
import ValidationMessages from '../UIElements/ValidationMessages.jsx';
import DataElementForm from './DataElementForm.jsx';

const getDEIcon = (elemType: string, hnqisMode: boolean) => {
  if (!hnqisMode) {
    return <DEIcon />;
  }

  if (elemType === 'label') {
    return <LabelIcon />;
  }

  return <QuizIcon />;
};

interface ImportDataElement extends DataElement {
  importStatus?: 'new' | 'update';
  warnings?: any;
  errors?: any;
}

interface DataElementStatusPool {
  id: string;
  mode: string;
}

interface DEStatus {
  index: number;
  mode: string;
  dataElements: DataElementStatusPool[];
}

interface DEActionsProps {
  deToEdit: string;
  add: (index: number, section: string) => void;
  remove: (de: string, section: string) => void;
  setEdit: (de: string) => void;
  update: (de: string, section: string, stageDe: string) => void;
}

interface DataElementItemProps {
  program: string;
  dePrefix: string;
  dataElement: ImportDataElement;
  stageDE: ProgramStageDataElement;
  DEActions: DEActionsProps;
  section: string;
  index: number;
  hnqisMode: boolean;
  deStatus?: DEStatus;
  isSectionMode: boolean;
  readOnly: boolean;
  setSaveStatus: React.Dispatch<React.SetStateAction<string>>;
}

const DataElementItem = ({
  program,
  dePrefix,
  dataElement,
  stageDE,
  DEActions,
  section,
  index,
  hnqisMode,
  deStatus,
  isSectionMode,
  readOnly,
  setSaveStatus,
}: DataElementItemProps) => {
  const [ref, setRef] = useState<HTMLElement | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState(false);
  const [deToRemove, setDeToRemove] = useState<DataElement | null>(null);

  const toggle = () => setOpenMenu(!openMenu);

  const removeDataElement = () => {
    if (!deToRemove || !deToRemove.id) {
      return;
    }
    DEActions.remove(deToRemove.id, section);
  };

  const [showValidationMessage, setShowValidationMessage] = useState(false);

  let classNames = '';

  const metadata = JSON.parse(
    dataElement.attributeValues.find((att) => att.attribute.id == METADATA)
      ?.value || '{}'
  );
  const renderFormName =
    metadata?.elemType === 'label' ? metadata?.labelFormName : null;

  classNames += ' ml_item';
  classNames += dataElement.importStatus
    ? ' import_' + dataElement.importStatus
    : '';

  // Import Values //
  let deImportStatus = undefined;

  if (dataElement.importStatus) {
    switch (dataElement.importStatus) {
      case 'new':
        deImportStatus = <Tag positive>New</Tag>;
        break;
      case 'update':
      default:
        deImportStatus = <Tag neutral>Updated</Tag>;
        break;
    }
  }

  return (
    <>
      <div
        id={'de_' + dataElement.id}
        className={
          'data-element-header ' +
          (openMenu ? 'data-element-selected ' : '') +
          classNames
        }
      >
        <div
          className="ml_item-icon"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {getDEIcon(metadata.elemType, hnqisMode)}
        </div>
        <div className="ml_item-title" style={{ maxWidth: '80vw' }}>
          {deImportStatus}
          {renderFormName ? (
            renderFormName
          ) : dataElement.formName &&
            dataElement.formName?.replaceAll(' ', '') !== '' ? (
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {dataElement.formName}
            </div>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <em style={{ marginRight: '0.5em' }}>{dataElement.name}</em>
              <Tooltip
                title="No Form Name provided"
                placement="right"
                color="warning"
              >
                <WarningAmberIcon fontSize="small" />
              </Tooltip>
            </span>
          )}
        </div>
        <div
          className="ml_item-warning_error"
          onClick={() => setShowValidationMessage(!showValidationMessage)}
        >
          {dataElement.warnings && dataElement.warnings.length > 0 && (
            <BadgeWarnings counts={dataElement.warnings.length} />
          )}
          {dataElement.errors && dataElement.errors.errors.length > 0 && (
            <BadgeErrors counts={dataElement.errors.errors.length} />
          )}
        </div>
        <div className="ml_item-cta">
          {!deStatus && (
            <a
              target="_blank"
              rel="noreferrer"
              href={
                (window.localStorage.DHIS2_BASE_URL ||
                  process.env.REACT_APP_DHIS2_BASE_URL) +
                '/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/' +
                dataElement.id
              }
              style={{ textDecoration: 'none', color: 'black' }}
            >
              <Tooltip title="Open in Maintenance App" placement="top">
                <IconButton size="small">
                  <LaunchIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </a>
          )}
          {deStatus && (
            <Chip
              label={deStatus.mode.toUpperCase()}
              color="success"
              className="blink-opacity-2"
              style={{ marginLeft: '1em' }}
            />
          )}
          {isSectionMode && !readOnly && (
            <MoreVertIcon
              id={'menu' + dataElement.id}
              onClick={() => {
                setRef(
                  document.getElementById('menu' + dataElement.id) ?? undefined
                );
                toggle();
              }}
              style={{ cursor: 'pointer' }}
            />
          )}
          {openMenu && (
            <Layer onClick={toggle}>
              <Popper reference={ref} placement="bottom-end">
                <FlyoutMenu>
                  <MenuItem
                    disabled={!stageDE}
                    label={
                      stageDE
                        ? 'Edit This Data Element'
                        : '(Reload to Enable Edit)'
                    }
                    dataTest={'EDIT'}
                    icon={stageDE ? <EditIcon /> : <EditOffIcon />}
                    onClick={() => {
                      toggle();
                      DEActions.setEdit(dataElement.id);
                    }}
                  />
                  <MenuItem
                    disabled={false}
                    label="Add Data Element(s) Above"
                    icon={<UpIcon />}
                    onClick={() => {
                      toggle();
                      DEActions.add(index, section);
                    }}
                  />
                  <MenuItem
                    disabled={false}
                    label="Add Data Element(s) Below"
                    icon={<DownIcon />}
                    onClick={() => {
                      toggle();
                      DEActions.add(index + 1, section);
                    }}
                  />
                  <MenuItem
                    destructive
                    disabled={false}
                    label="Remove This Data Element"
                    icon={<DeleteIcon />}
                    onClick={() => {
                      toggle();
                      setDeToRemove(dataElement);
                    }}
                  />
                </FlyoutMenu>
              </Popper>
            </Layer>
          )}
        </div>
      </div>
      {DEActions.deToEdit === dataElement.id && (
        <DataElementForm
          program={program}
          dePrefix={dePrefix}
          programStageDataElement={stageDE}
          section={section}
          setDeToEdit={DEActions.setEdit}
          save={DEActions.update}
          hnqisMode={hnqisMode}
          setSaveStatus={setSaveStatus}
        />
      )}
      {showValidationMessage && (
        <ValidationMessages
          objects={[dataElement]}
          showValidationMessage={setShowValidationMessage}
        />
      )}

      {!!deToRemove && (
        <AlertDialogSlide
          open={!!deToRemove}
          title={'Remove this Data Element from the Stage?'}
          icon={<WarningAmberIcon fontSize="large" color="warning" />}
          preContent={<span>{deToRemove.name}</span>}
          content={"Warning: This action can't be undone"}
          primaryText={'Yes, remove it'}
          secondaryText={'No, keep it'}
          actions={{
            primary: function () {
              setDeToRemove(null);
              removeDataElement();
            },
            secondary: function () {
              setDeToRemove(null);
            },
          }}
        />
      )}
    </>
  );
};

export default DataElementItem;
