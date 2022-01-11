import { CircularLoader } from "@dhis2/ui";

const RunningTask = (props) => {
    return <div style={{position: 'relative', width: '100%'}}>
                <span style={{position: 'absolute', top: '0px', left: '20px'}}>{props.task}</span>
                <CircularLoader extrasmall />
            </div>
}

export default RunningTask;