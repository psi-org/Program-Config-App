import MDEditor from "@uiw/react-md-editor";
import PropTypes from 'prop-types';
import React from "react";
import rehypeSanitize from "rehype-sanitize";

const MarkDownEditor = ({ disabled, setValue, value }) => {
    return <MDEditor
        fullscreen={false}
        value={!disabled ? value : ''}
        onChange={(val) => {
            if (!disabled) { setValue(val) }
        }}
        height='200'
        previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
        }}
    />
}

MarkDownEditor.propTypes = {
    disabled: PropTypes.bool,
    setValue: PropTypes.func,
    value: PropTypes.string
}

export default MarkDownEditor