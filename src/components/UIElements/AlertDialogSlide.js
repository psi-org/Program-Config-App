import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide(props) {

    return (
        <Dialog
            open={props.open}
            TransitionComponent={Transition}
            keepMounted
            onClose={()=>props.actions.secondary()}
        >
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                {props.preContent}
                <div style={{margin:'1em 0 0 0', display:'flex',alignItems:'center', justifyContent:'center', width: '100%'}}> {props.icon || ""} <label style={{textAlign: 'justify'}}>{props.content}</label> </div>
                {props.postContent}
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>props.actions.secondary()} variant="outlined" color={"error"}>{props.secondaryText}</Button>
                <Button onClick={()=>props.actions.primary()} variant="contained" color={props.color || "error"}>{props.primaryText}</Button>
            </DialogActions>
        </Dialog>
    );
}