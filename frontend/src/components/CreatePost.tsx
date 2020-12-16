import React, { ChangeEvent } from 'react';
import NavBar from './NavBar';

import { EditorState, convertToRaw } from 'draft-js';

import Draft, { htmlToDraft, draftToHtml, EmptyState } from 'react-wysiwyg-typescript';
import { Button, IconButton, Paper, Snackbar, TextField, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import axios from 'axios';
import { APIerrorHandler, HOST } from '../Config';



interface Props {
    history?: any,
    match?: {
        params: any
    },
    location: {
        pathname: String
    }
};

interface State {
    isLogin: boolean,
    post_id: String | null,
    postSlug: String | null,
    editorState: EditorState,
    title: string,
    titleError: string,
    openSnackbar: boolean,
    apiError: String,
    created: boolean
};

class CreatePost extends React.Component<Props, State> {
    prevLocation: String | null;
    constructor(props: Props) {
        super(props);

        this.state = {
            isLogin: false,
            post_id: (this.props.match?.params?.id) ? this.props.match.params.id : null,
            editorState: EmptyState,
            title: "",
            titleError: "",
            openSnackbar: false,
            apiError: "",
            postSlug: null,
            created: true
        };

        this.prevLocation = this.props.location.pathname;
        this.onChange = this.onChange.bind(this);
        this.submit = this.submit.bind(this);
        this.handleEditorChange = this.handleEditorChange.bind(this);
        this.closeSnackbar = this.closeSnackbar.bind(this);
    }

    handleEditorChange(editorState: EditorState) {
        this.setState({
            editorState
        });
    }

    onChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { name, value } = event.target;
        const tmp: any = {};
        tmp[name] = value;
        tmp[`${name}Error`] = "";
        this.setState(tmp);
    }

    submit() {
        if (this.state.title === "") {
            return this.setState({ titleError: "Title Can't be Empty!" });
        }
        const rawContentState = convertToRaw(this.state.editorState.getCurrentContent());
        const html = draftToHtml(rawContentState);
        if (html.trim() === '<p></p>') {
            return alert('Content Can\'t Be Empty!');
        }
        const body = {
            title: this.state.title,
            content: html
        };

        if (this.state.post_id) {
            axios.put(`${HOST}posts/${this.state.post_id}`, body, { withCredentials: true })
                .then(res => {
                    if (res.data && res.data.status) {
                        this.setState({
                            openSnackbar: true,
                            created: false
                        });
                    }
                })
                .catch(err => APIerrorHandler(err, this));
        } else {
            axios.post(`${HOST}posts`, body, { withCredentials: true })
                .then(res => {
                    console.log(res.data);
                    if (res.data && res.data.status) {
                        this.props.history.push(`/edit/${res.data.status}`);
                        this.setState({
                            openSnackbar: true,
                            post_id: res.data.status,
                            postSlug: res.data.slug,
                            created: true
                        });
                    }
                })
                .catch(err => APIerrorHandler(err, this));
        }
    }


    componentDidMount() {
        if (this.state.post_id) {
            // Fetch Detail
            axios.get(`${HOST}posts/my/${this.state.post_id}`, { withCredentials: true })
                .then((res) => {
                    if (res.data && res.data.post) {
                        const { title, content, slug } = res.data.post;
                        this.setState({
                            editorState: htmlToDraft(content),
                            title,
                            postSlug: slug
                        });
                    }
                })
                .catch(err => APIerrorHandler(err, this));
        }
    }

    componentDidUpdate() {
        if (this.props.location.pathname === '/create/post' && this.props.location.pathname !== this.prevLocation) {
            this.setState({
                title: "",
                titleError: "",
                editorState: EmptyState,
                post_id: null,
                postSlug: null,
                apiError: ""
            });
        }

        this.prevLocation = this.props.location.pathname;
    }

    closeSnackbar() {
        this.setState({
            openSnackbar: false
        });
    }

    renderBody(): JSX.Element {
        return (
            <Paper className="post-container">
                <Typography variant="h4" gutterBottom>
                    {(!this.state.post_id) ? 'Create' : 'Update'} Post
                </Typography>

                <TextField
                    onChange={this.onChange}
                    value={this.state.title}
                    error={this.state.titleError !== ""}
                    helperText={this.state.titleError}
                    name="title"
                    label="Tilte"
                />

                <div className="post-editor">
                    <Draft
                        editorState={this.state.editorState}
                        onEditorStateChange={this.handleEditorChange}
                    />
                </div>

                <div className="d-flex">
                    <Button
                        style={{ marginLeft: "auto" }}
                        variant="contained"
                        color="primary"
                        onClick={this.submit}
                    >
                        {(!this.state.post_id) ? 'Create' : 'Update'} Post
                    </Button>
                </div>
            </Paper>
        );
    }
    // 

    render() {
        return (
            <div>
                <NavBar title="PostMe" history={this.props.history} onLogin={() => this.setState({ isLogin: true })} />

                {(!this.state.isLogin) ? (
                    <span className="errorText">Please Login</span>
                ) : (
                        <div>
                            {(this.state.apiError === "") ? this.renderBody() : <span className="errorText">{this.state.apiError}</span>}
                        </div>
                    )}


                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.openSnackbar}
                    onClose={this.closeSnackbar}
                    autoHideDuration={6000}
                    message={(!this.state.created) ? "Update Successfully!" : "Post Created"}
                    action={
                        <React.Fragment>

                            <Button color="primary" size="small" onClick={() => {
                                if (this.props.history) {
                                    this.props.history.push(`/read/${this.state.postSlug}`);
                                }
                            }}>
                                View
                            </Button>

                            <IconButton size="small" aria-label="close" color="inherit" onClick={this.closeSnackbar}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </div>
        );
    }
}


export default CreatePost;