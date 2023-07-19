import { IconCheckmarkCircle24, IconError24, colors } from "@dhis2/ui"

const CompletedTask = (props) => {
    return <div style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '0.5em 0' }} key="{props.key}">
                {(props.status === 'success') ? <IconCheckmarkCircle24 color={colors.blue600} /> : <IconError24 color={colors.red500} />}
                <span style={{marginLeft: '0.5em'}}>{props.name}</span>
            </div>
}

export default CompletedTask;