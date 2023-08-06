import { NoticeBox } from "@dhis2/ui";

const Messages = (props) => {
    return (
        <NoticeBox
            error={props.error}
            warning={props.warning}
            title={(props.title) ? props.title : '_'}
            style={{ marginBottom: "5px !important" }}
        >
                <ul>{props.messages.map(messageItem => <li key={messageItem.message.code}>{messageItem.message.text}</li> )}</ul>
        </NoticeBox>
    )
}

export default Messages