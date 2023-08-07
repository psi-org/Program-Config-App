import { NoticeBox } from "@dhis2/ui";

const Messages = ({ title, error, warning,  messages }) => {
    return (
        <NoticeBox
            error={error}
            warning={warning}
            title={(title) ? title : '_'}
            style={{ marginBottom: "5px !important" }}
        >
                <ul>{messages.map(messageItem => <li key={messageItem.message.code}>{messageItem.message.text}</li> )}</ul>
        </NoticeBox>
    )
}

export default Messages