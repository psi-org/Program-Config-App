import PropTypes from 'prop-types';
import React from 'react';
import error_svg from './../../images/i-error.svg';

const BadgeErrors = ({ counts }) => {
    return (
        <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img src={error_svg} alt={"err"} />
            <div className={"ml_item-cw"}>
                {counts}
            </div>
        </div>
    )
}

BadgeErrors.propTypes = {
    counts: PropTypes.number
}

export default BadgeErrors
