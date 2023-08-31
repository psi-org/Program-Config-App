import { NoticeBox } from "@dhis2/ui";

const Messages = ({ title, error, warning,  messages }) => {
    return (
        <div style={{marginBottom: '1em'}}>
            <NoticeBox
                error={error}
                warning={warning}
                title={(title) ? title : '_'}
            >
                <ul>{messages.map(messageItem => <li key={messageItem.message.code}>{messageItem.message.text}</li> )}</ul>
            </NoticeBox>
        </div>
    )
}

export default Messages