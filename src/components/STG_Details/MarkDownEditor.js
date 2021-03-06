import React from "react";
import MDEditor, {
    commands,
    ICommand,
    TextState,
    TextAreaTextApi
} from "@uiw/react-md-editor";

import rehypeSanitize from "rehype-sanitize";

//import { bold, italic, divider, unorderedListCommand, orderedListCommand, checkedListCommand, title, image, link } from '@uiw/react-md-editor/lib/commands';

const MarkDownEditor = (props) => {
    return <MDEditor
        fullscreen={false}
        value={!props.disabled?props.value:''}
        onChange={(val) => {
            if (!props.disabled) props.setValue(val);
        }}
        height='200'
        previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
        }}
    />
}

export default MarkDownEditor