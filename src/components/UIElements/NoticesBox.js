import { NoticeBox, IconCheckmarkCircle24, colors } from "@dhis2/ui"
import CompletedTask from "./CompletedTask"
import RunningTask from "./RunningTask"

const NoticesBox = (props) =>{

    return  <NoticeBox title="HNQIS Configuration - Import Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;">
                {props.executedTasks.map(executedTask => <CompletedTask key={executedTask.step} name={executedTask.name} status={executedTask.status}/>)}
                {props.currentTask && <RunningTask task={props.currentTask}/>}
            </NoticeBox>
}

export default NoticesBox