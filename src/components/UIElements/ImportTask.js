import { IconCheckmarkCircle24, IconError24, colors, CircularLoader } from "@dhis2/ui"

const ImportTask = ({ type, name }) => {
    return (
        <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            margin: '0.5em 0'
        }}>
            {(type === 'loading')
                ? <CircularLoader extrasmall />
                : ((type === 'success')
                    ? <IconCheckmarkCircle24 color={colors.blue600} />
                    : <IconError24 color={colors.red500} />
                )
            }
            <span style={{ marginLeft: '0.5em' }}>{name}</span>
        </div>
    )
}

export default ImportTask;