import PropTypes from 'prop-types';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import DataElementItem from './DataElementItem.tsx';

const DraggableDataElement = ({
  program,
  dePrefix,
  dataElement,
  stageDE,
  DEActions,
  section,
  sectionType,
  index,
  hnqisMode,
  deStatus,
  isSectionMode,
  readOnly,
  setSaveStatus,
}) => {
  const isDisabled = () => {
    return (
      dataElement.importStatus != undefined ||
      DEActions.deToEdit !== '' ||
      !isSectionMode ||
      readOnly
    );
  };

  return (
    <>
      <Draggable
        key={dataElement.id || index}
        draggableId={
          dataElement.id || dataElement.formName?.slice(-15) || index
        }
        index={index}
        isDragDisabled={isDisabled()}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DataElementItem
              program={program}
              dePrefix={dePrefix}
              dataElement={dataElement}
              stageDE={stageDE}
              DEActions={DEActions}
              section={section}
              sectionType={sectionType}
              index={index}
              hnqisMode={hnqisMode}
              deStatus={deStatus}
              isSectionMode={isSectionMode}
              readOnly={readOnly}
              setSaveStatus={setSaveStatus}
            />
          </div>
        )}
      </Draggable>
    </>
  );
};

DraggableDataElement.propTypes = {
  DEActions: PropTypes.object,
  dataElement: PropTypes.object,
  dePrefix: PropTypes.string,
  deStatus: PropTypes.object,
  hnqisMode: PropTypes.string,
  index: PropTypes.number,
  isSectionMode: PropTypes.bool,
  program: PropTypes.string,
  readOnly: PropTypes.bool,
  section: PropTypes.string,
  sectionType: PropTypes.string,
  setSaveStatus: PropTypes.func,
  stageDE: PropTypes.object,
};

export default DraggableDataElement;
