import { NoticeBox, IconCheckmarkCircle24, colors } from "@dhis2/ui"
import CompletedTask from "./CompletedTask"
import RunningTask from "./RunningTask"

const NoticesBox = (props) =>{

    return <NoticeBox error={props.isError} title="HNQIS Configuration - Import Status">
        {props.executedTasks.map(executedTask => <CompletedTask key={executedTask.step} name={executedTask.name} status={executedTask.status} />)}
        {props.currentTask && <RunningTask task={props.currentTask} />}
    </NoticeBox>
}

export default NoticesBox