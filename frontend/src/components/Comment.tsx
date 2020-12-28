import { Button, Paper as div } from '@material-ui/core';
import React from 'react';
import PostComment from './PostComment';
import ReplyIcon from '@material-ui/icons/Reply';

import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import LikeBox from './LikeComponent';

interface Props {
    childrens?: any;
    message: string;
    id: string;
    post_id: string;
    isLogin: boolean;
    by: string;
    my_id: string;
    isMine: boolean;
    likes: number;
    liked: {
        _id: string;
        value: 1 | -1 | 0;
    } | undefined;
    refreshComment: () => void;
    deleteComment: (id: string) => void;
};

interface State {
    reply: boolean,
    childrens: any;
    editComment: boolean;
    message: string;
};

class Comment extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            reply: false,
            childrens: this.props.childrens,
            editComment: false,
            message: this.props.message
        };

        this.addComment = this.addComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
    }

    addComment(_: any) {
        this.setState({
            reply: false,
            editComment: false
        });
        this.props.refreshComment();
    }

    updateComment(message: string) {
        this.setState({
            reply: false,
            editComment: false,
            message
        });
    }

    componentDidUpdate() {
        const new_len = JSON.stringify(this.props.childrens).trim();
        const prev_len = JSON.stringify(this.state.childrens).trim();
        if (new_len !== prev_len) {
            this.setState({
                childrens: this.props.childrens
            });
        }
    }

    renderOptions(): JSX.Element {
        return (
            <div>
                <Button
                    style={{ color: "blue" }}
                    startIcon={<CreateIcon />}
                    size="small"
                    onClick={() => {
                        this.setState({ editComment: true });
                    }}
                >
                    Edit
                </Button>

                <Button
                    style={{ color: "red" }}
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={() => this.props.deleteComment(this.props.id)}
                >
                    Delete
                </Button>

            </div>
        );
    }

    render() {
        return (
            <div className="comment" id={this.props.id}>

                <div>

                    <div className="d-flex">
                        <LikeBox
                            likes={this.props.likes}
                            liked={this.props.liked}
                            commentId={this.props.id}
                        />
                        <div>
                            <span className="comment-by">By {this.props.by}</span>

                            {
                                (!this.state.editComment) ?
                                    (
                                        <div className="comment-message" dangerouslySetInnerHTML={{ __html: this.state.message }} />
                                    )
                                    :
                                    ''
                            }


                            <div className="d-flex">
                                <Button
                                    startIcon={<ReplyIcon />}
                                    disabled={this.state.reply || !this.props.isLogin || this.state.editComment}
                                    size="small"
                                    onClick={() => this.setState({ reply: true })}
                                >
                                    Reply
                        </Button>
                                {(this.props.isMine) ? this.renderOptions() : ''}
                            </div>
                        </div>
                    </div>

                    {((this.state.reply || this.state.editComment) && this.props.isLogin) ?
                        <div style={{ padding: "11px" }}>
                            <PostComment
                                editComment={(this.state.editComment) ? this.state.message : null}
                                post_id={this.props.post_id}
                                parent_id={this.props.id}
                                onCancel={() => this.setState({ reply: false, editComment: false })}
                                onAddComment={this.addComment}
                                onUpdate={this.updateComment}
                            />
                        </div> : ''}

                    <div style={{ marginLeft: "11px" }}>
                        {Object.keys(this.state.childrens || {}).map((key, ind) => {
                            const comment = this.state.childrens[key];
                            if (!comment) return '';
                            const by = comment.USER?.name || '';
                            const com_usr_id = comment.USER?._id || '';
                            const my_id = this.props.my_id;

                            return (
                                <Comment
                                    isLogin={this.props.isLogin}
                                    refreshComment={this.props.refreshComment}
                                    deleteComment={this.props.deleteComment}
                                    message={comment.message}
                                    id={comment._id}
                                    key={ind}
                                    by={by}
                                    childrens={comment.children}
                                    likes={comment.likes}
                                    liked={comment.liked}
                                    post_id={this.props.post_id || ''}
                                    my_id={my_id}
                                    isMine={com_usr_id === my_id}
                                />
                            );
                        })}

                    </div>
                </div>

            </div>
        );
    }
}


export default Comment;