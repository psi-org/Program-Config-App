import { IconCheckmarkCircle24, IconError24, colors } from "@dhis2/ui"

const CompletedTask = (props) => {
    return <div style={{position: 'relative'}} key="{props.key}">
                <span style={{position: 'absolute', top: '2px', left: '30px'}}>{props.name}</span>
                {(props.status === 'success') ? <IconCheckmarkCircle24 color={colors.blue600} /> : <IconError24 color={colors.red500} /> }
            </div>
}

export default CompletedTask;