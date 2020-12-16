import React from 'react';
import { EditorState, convertToRaw } from 'draft-js';

import Draft, { htmlToDraft, draftToHtml, EmptyState } from 'react-wysiwyg-typescript';
import { Button } from '@material-ui/core';

import axios from 'axios';
import { APIerrorHandler, HOST } from '../Config';


interface Props {
    post_id: string | undefined,
    parent_id: string | null,
    onAddComment?: (comment: any) => void,
    onCancel?: () => void,
    editComment?: string | null;
    onUpdate?: (newHtml: string) => void;
};

interface State {
    editorState: EditorState,
    apiError: String,
};

class PostComment extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            editorState: EmptyState,
            apiError: ""
        };

        this.submit = this.submit.bind(this);
        this.handleEditorChange = this.handleEditorChange.bind(this);
        this.addComment = this.addComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
    }

    handleEditorChange(editorState: EditorState) {
        this.setState({
            editorState
        });
    }

    componentDidMount() {
        if (this.props.editComment) {
            this.setState({
                editorState: htmlToDraft(this.props.editComment),
            });
        }
    }

    addComment(body: any) {
        axios.post(`${HOST}comments/${this.props.post_id}`, body, { withCredentials: true })
            .then(res => {
                if (res.data && res.data.status) {
                    this.setState({
                        editorState: EmptyState
                    });
                    body._id = res.data.status;
                    body.children = {};
                    if (this.props.onAddComment) {
                        this.props.onAddComment(body);
                    }
                    if (this.props.onCancel) {
                        this.props.onCancel();
                    }
                }
            })
            .catch(err => APIerrorHandler(err, this));
    }

    updateComment(id: string, body: any) {
        if (id === '') return;

        axios.put(`${HOST}comments/${id}`, body, { withCredentials: true })
            .then(res => {
                if (res && res.data.status) {
                    if (this.props.onUpdate) {
                        this.props.onUpdate(body.message);
                    }
                }
            })
            .catch(err => APIerrorHandler(err, this));
    }

    submit() {
        const rawContentState = convertToRaw(this.state.editorState.getCurrentContent());
        const html = draftToHtml(rawContentState);
        if (html.trim() === '<p></p>') {
            return alert('Comment Can\'t Be Empty!');
        }
        const body: any = {
            message: html
        };
        if (this.props.parent_id) {
            body.parent = this.props.parent_id;
        }

        if (this.props.editComment) {
            this.updateComment(this.props.parent_id || '', body);
        } else {
            this.addComment(body);
        }
    }

    render() {
        return (
            <div className="post-comment">

                <span className="errorText">{this.state.apiError}</span>

                <div className="post-editor">
                    <Draft
                        editorState={this.state.editorState}
                        onEditorStateChange={this.handleEditorChange}
                    />
                </div>
                <div className="d-flex">

                    <div
                        style={{ marginLeft: "auto" }}
                    >


                        {(this.props.onCancel) ? (
                            <Button
                                style={{ marginRight: "11px", color: "red" }}
                                variant="contained"
                                size="small"
                                onClick={this.props.onCancel}
                            >
                                Cancel
                            </Button>
                        ) : ''}

                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.submit}
                        >
                            {(this.props.editComment) ? 'Update' : 'Comment'}
                        </Button>

                    </div>

                </div>
            </div>
        );
    }
}


export default PostComment;