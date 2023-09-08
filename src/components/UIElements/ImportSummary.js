import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types';
import React from 'react';
import ImportSummaryItem from './ImportSummaryItem.js'

const ImportSummary = ({ title, importCategories }) => {
    return (
        <div style={{ width: '100%', marginBottom: '0.5em' }}>
            <NoticeBox title={title}>
                <div style={{ display: 'grid', gridTemplateRows: `repeat(${importCategories.length}, 1fr)`, gridGap: '1em' }}>
                    {importCategories.map(category =>
                        <ImportSummaryItem key={title + category.name} title={category.name} contentsList={[
                            { name: 'Added', value: category.content.new, positive: true },
                            { name: 'Updated', value: category.content.updated, neutral: true },
                            { name: 'Removed', value: category.content.removed, negative: true }
                        ]} />
                    )}
                </div>
            </NoticeBox>
        </div>
    )
}

ImportSummary.propTypes = {
    importCategories: PropTypes.string,
    title: PropTypes.string
}

export default ImportSummary
