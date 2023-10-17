import { NoticeBox } from "@dhis2/ui";
import PropTypes from 'prop-types';
import React from 'react';
import ImportTask from "./ImportTask.js";

const ImportStatusBox = ({ title, currentTask, executedTasks, isError }) => {

    return <NoticeBox error={isError} title={title}>
        {executedTasks.map(task =>
            <ImportTask key={task.step} name={task.name} type={task.status} />
        )}
        {currentTask &&
            <ImportTask name={currentTask} type='loading' />
        }
    </NoticeBox>
}

ImportStatusBox.propTypes = {
    currentTask: PropTypes.string,
    executedTasks: PropTypes.array,
    isError: PropTypes.bool,
    title: PropTypes.string,
}

export default ImportStatusBox