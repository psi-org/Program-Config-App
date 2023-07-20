import { NoticeBox } from '@dhis2/ui'
import ImportSummaryItem from './ImportSummaryItem'

const ImportSummary = ({ title, importCategories }) => {
    return (
        <NoticeBox title={ title }>
            <div style={{ display: 'grid', gridTemplateRows: `repeat(${importCategories.length}, 1fr)`, gridGap: '1em' }}>
                {importCategories.map(category =>
                    <ImportSummaryItem key={title+category.name} title={category.name} contentsList={[
                        { name: 'Added', value: category.content.new, positive: true },
                        { name: 'Updated', value: category.content.updated, neutral: true },
                        { name: 'Removed', value: category.content.removed, negative: true }
                    ]} />
                )}
            </div>
        </NoticeBox>
    )
}

export default ImportSummary
