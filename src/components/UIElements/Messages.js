import { NoticeBox } from "@dhis2/ui";
import PropTypes from 'prop-types';
import React from "react";

const Messages = ({ title, error, warning, messages }) => {
    return (
        <div style={{ marginBottom: '1em' }}>
            <NoticeBox
                error={error}
                warning={warning}
                title={(title) ? title : '_'}
            >
                <ul>{messages.map(messageItem => <li key={messageItem.message.code}>{messageItem.message.text}</li>)}</ul>
            </NoticeBox>
        </div>
    )
}

Messages.propTypes = {
    error: PropTypes.bool,
    messages: PropTypes.array,
    title: PropTypes.string,
    warning: PropTypes.bool,
}

export default Messages