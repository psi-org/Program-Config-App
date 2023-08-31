import { Tag } from "@dhis2/ui";

const ImportSummaryItem = ({ title, contentsList }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${contentsList.length + 1}, 1fr)`,
                alignContent: 'center',
                width: '100%',
                gridGap: '1em'
            }}>
            <strong>{title}</strong>
            {contentsList.map(content => (
                <Tag
                    positive={content.positive}
                    negative={content.negative}
                    neutral={content.neutral}
                    key={title+content.name}
                >
                    {`${content.name}: ` + content.value}
                </Tag>
            ))}
        </div>
    )
}

export default ImportSummaryItem
