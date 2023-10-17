import PropTypes from 'prop-types';
import React from "react";
import tinycolor from 'tinycolor2';
import ColorPicker from '../UIElements/ColorPicker.js';
import IconPicker from '../UIElements/IconPicker.js';


const StyleManager = ({ icon, setIcon, color, setColor, style }) => {

    return (
        <div style={style}>
            <div><IconPicker parentIcon={icon} setParentIcon={setIcon} /></div>
            <div><ColorPicker parentColor={color} setParentColor={setColor} /></div>
            {(icon || color) &&
                <div style={{ backgroundColor: color, width: '5em', height: '5em', minWidth: '5em', minHeight: '5em', border: '1px solid #DDD', marginLeft: '0.5em', borderRadius: '10%' }}>
                    {icon && <img
                        src={`${(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)}/api/icons/${icon}/icon.svg`}
                        style={{ width: '100%', height: 'auto', borderRadius: '10%', zIndex: '999', filter: `brightness(0) invert(${color && tinycolor(color).isDark() ? 1 : 0})` }}
                    />}
                    {!icon && <p></p>}
                </div>
            }
        </div>
    )
}

StyleManager.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.string,
    setColor: PropTypes.func,
    setIcon: PropTypes.func,
    style: PropTypes.object
}

export default StyleManager