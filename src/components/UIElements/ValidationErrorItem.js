import PropTypes from 'prop-types';
import React from "react";
import error_svg from './../../images/i-error.svg';
import BadgeErrors from "./BadgeErrors.js";
import BadgeWarnings from "./BadgeWarnings.js";

const ValidationErrorItem = (
    {
        id,
        tagName,
        errorTitle,
        errorObject = {},
        setShowValidationMessage,
        setErrors,
        displayBadges = true
    }
) => {

    const showIssues = function (objects) {
        setShowValidationMessage(true);
        setErrors(objects.map(err => ({ errors: err })));
    }

    return (
        <div id={id} className={"ml_item"}>
            <div className="ml_item-icon">
                <img src={error_svg} alt={`error_${tagName}`} className="ml_list-img" />
            </div>
            <div className="ml_item-title">
                <div><strong>{tagName} </strong>{errorTitle}</div>
            </div>
            {displayBadges &&
                <div className="ml_item-warning_error" onClick={() => showIssues([errorObject])}>
                    {errorObject.warnings && errorObject.warnings.length > 0 &&
                        <BadgeWarnings counts={errorObject.warnings.length} />
                    }
                    {errorObject.errors && errorObject.errors.length > 0 &&
                        <BadgeErrors counts={errorObject.errors.length} />
                    }
                </div>
            }

        </div>
    )
}

ValidationErrorItem.propTypes = {
    displayBadges: PropTypes.bool,
    errorObject: PropTypes.object,
    errorTitle: PropTypes.string,
    id: PropTypes.string,
    setErrors: PropTypes.func,
    setShowValidationMessage: PropTypes.func,
    tagName: PropTypes.string
}

export default ValidationErrorItem;