import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import React from 'react';

interface Props {
    open: boolean;
    onClose: () => void,
    title: string,
    message: string,
    onConfirm: () => void
};

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class ConfirmDialog extends React.Component<Props> {
    render() {
        return (
            <Dialog
                open={this.props.open}
                TransitionComponent={Transition}
                keepMounted
                onClose={this.props.onClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{this.props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {this.props.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose} color="primary">
                        Cancel
                    </Button>

                    <Button onClick={this.props.onConfirm} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}


export default ConfirmDialog;