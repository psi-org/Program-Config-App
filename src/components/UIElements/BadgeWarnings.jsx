import PropTypes from 'prop-types';
import React from 'react';
import warning_svg from './../../images/i-warning.svg';

const BadgeWarnings = ({ counts }) => {
    return  <>
        <img src={warning_svg} alt={"err"}/>
        <div className={"ml_item-ce"}>
            {counts}
        </div>
    </>
}

BadgeWarnings.propTypes = {
    counts: PropTypes.number
}

export default BadgeWarnings
