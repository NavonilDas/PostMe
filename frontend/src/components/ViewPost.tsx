import React from 'react';
import NavBar from './NavBar';

import axios from 'axios';
import { APIerrorHandler, HOST, Post } from '../Config';
import { Button, Paper, Typography } from '@material-ui/core';

import ChatIcon from '@material-ui/icons/Chat';
// import ShareIcon from '@material-ui/icons/Share';
import PostComment from './PostComment';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import Comment from './Comment';
import ConfirmDialog from './ConfirmDialog';

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
    post: Post | null,
    isLogin: boolean,
    slug: string,
    comments: any;
    apiError: string,
    deleteComment: string,
    confirmDelete: boolean,
};

class ViewPost extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            post: null,
            isLogin: false,
            slug: (this.props.match?.params?.slug) ? this.props.match.params.slug : '',
            comments: null,
            apiError: "",
            confirmDelete: false,
            deleteComment: ""
        };

        this.fetchComments = this.fetchComments.bind(this);
        this.addComment = this.addComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.deleteCommentFromDB = this.deleteCommentFromDB.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.refreshComments = this.refreshComments.bind(this);
    }

    componentDidMount() {
        axios.get(`${HOST}posts/view/${this.state.slug}`, { withCredentials: true })
            .then(res => {
                this.setState({
                    post: res.data
                });
                this.fetchComments(res.data.post._id);
            }).catch(err => APIerrorHandler(err, this));
    }

    addComment() {
        if (!this.state.post?.post._id) return;
        this.fetchComments(this.state.post?.post._id || '');
    }

    deleteComment(id: string) {
        this.setState({
            deleteComment: id,
            confirmDelete: true
        });
    }

    deleteCommentFromDB(id: string) {
        if (!this.state.post?.post._id) return;
        axios.delete(`${HOST}comments/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data && res.data.status) {
                    this.fetchComments(this.state.post?.post._id || '');
                }
            })
            .catch(err => APIerrorHandler(err, this))
    }

    deletePost() {
        if (this.state.post?.post._id) {
            axios.delete(`${HOST}posts/${this.state.post?.post._id || ''}`, { withCredentials: true })
                .then(res => {
                    if (res.data && res.data.status) {
                        this.props.history.push('/');
                    }
                })
                .catch(err => APIerrorHandler(err, this));
        }
    }

    fetchComments(post_id: string) {
        if (post_id === '') return;

        axios.get(`${HOST}comments/${post_id}`, { withCredentials: true })
            .then(res => {
                this.setState({
                    comments: res.data
                });
            })
            .catch(err => APIerrorHandler(err, this));
    }
    refreshComments() {
        if (this.state.post?.post._id) {
            this.fetchComments(this.state.post.post._id);
        }
    }

    renderPostOptions(): JSX.Element {
        return (
            <div>
                <Button
                    startIcon={<CreateIcon />}
                    size="small"
                    style={{ color: "blue" }}
                    onClick={() => {
                        if (!this.state.post || !this.state.isLogin) return;
                        this.props.history.push(`/edit/${this.state.post?.post._id || ''}`);
                    }}
                >
                    Edit
                </Button>

                <Button
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={() => this.setState({ confirmDelete: true })}
                    style={{ color: "red" }}
                >
                    Delete
                </Button>
            </div>
        );
    }

    renderPostHead(): JSX.Element {
        return (
            <Paper className="view-post">

                <span className="comment-by">By {this.state.post?.post.USER.name || ''}</span>

                <Typography variant="h4" gutterBottom>
                    {this.state.post?.post.title}
                </Typography>

                <div dangerouslySetInnerHTML={{ __html: (this.state.post) ? this.state.post.post.content : '' }} />

                <div className="d-flex">
                    <div style={{ flexGrow: 1 }}>
                        <Button
                            startIcon={<ChatIcon />}
                            size="small"
                        >
                            {(this.state.comments) ? this.state.comments.count : 0} Comments
                        </Button>

                        {/* <Button
                        startIcon={<ShareIcon />}
                        size="small"
                    >
                        Share
                    </Button> */}

                    </div>

                    {(this.state.post?.me) ? this.renderPostOptions() : ''}

                </div>
                {(this.state.isLogin) ?
                    <PostComment
                        post_id={this.state.post?.post._id}
                        parent_id={null}
                        onAddComment={this.addComment}
                    /> : ''}

            </Paper>
        );
    }

    renderComments(): JSX.Element {
        return (
            <div id="comments">
                {Object.keys(this.state.comments?.comments || {}).map((key, ind) => {
                    const comment = this.state.comments.comments[key];
                    if (!comment) return '';
                    const by = comment.USER?.name || '';
                    const com_usr_id = comment.USER?._id || '';
                    const my_id = this.state.comments?.my_id || '-1';
                    return (
                        <Comment
                            deleteComment={this.deleteComment}
                            refreshComment={this.refreshComments}
                            isLogin={this.state.isLogin}
                            message={comment.message}
                            id={comment._id}
                            key={ind}
                            by={by}
                            childrens={comment.children}
                            post_id={this.state.post?.post._id || ''}
                            my_id={my_id}
                            isMine={com_usr_id === my_id}
                        />
                    );
                })}
            </div>
        );
    }

    render() {
        return (
            <div>
                <NavBar title="PostMe" history={this.props.history} onLogin={() => this.setState({ isLogin: true })} />

                <span className="errorText">{this.state.apiError}</span>

                {(this.state.post) ? this.renderPostHead() : ''}
                {this.renderComments()}

                <ConfirmDialog
                    open={this.state.confirmDelete}
                    message="Are You Sure, You Want to delete this"
                    title="Confirm Delete"
                    onClose={() => this.setState({ confirmDelete: false, deleteComment: "" })}
                    onConfirm={() => {
                        this.setState({
                            confirmDelete: false,
                        });
                        if (this.state.deleteComment !== "") {
                            this.deleteCommentFromDB(this.state.deleteComment);
                        } else {
                            this.deletePost();
                        }
                    }}
                />
            </div>
        );
    }
}


export default ViewPost;