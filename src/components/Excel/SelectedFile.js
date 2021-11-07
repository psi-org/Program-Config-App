import { IconAttachment16, colors } from '@dhis2/ui'

const SelectedFile = (props) => {
    function removeFile(e) 
    {
        e.preventDefault();
        console.log("remove File");
    }
    return  <p>
                <span> <IconAttachment16 /> </span>
                <span> {props.fileName}</span>
                <span> <a type="remove" onClick={removeFile(e)}>remove</a>  </span>
            </p>
}

export default SelectedFile;