import { NoticeBox } from "@dhis2/ui"
import ImportTask from "./ImportTask"

const ImportStatusBox = ({ title, currentTask, executedTasks, isError}) =>{

    return <NoticeBox error={ isError } title={ title }>
        {executedTasks.map(task =>
            <ImportTask key={task.step} name={task.name} type={task.status} />
        )}
        {currentTask &&
            <ImportTask name={currentTask} type='loading' />
        }
    </NoticeBox>
}

export default ImportStatusBox