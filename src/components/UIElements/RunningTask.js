import { CircularLoader } from "@dhis2/ui";

const RunningTask = (props) => {
    return <div style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '0.5em 0' }}>
        <CircularLoader extrasmall />
        <span style={{ marginLeft: '0.5em' }}>{props.task}</span>
    </div>
}

export default RunningTask;