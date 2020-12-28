import React from 'react';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { getCookies, HOST } from '../Config';
import axios from 'axios';

// import { IconButton } from '@material-ui/core';

interface Props {
    postId?: string;
    commentId?: string;
    liked: { _id: string; value: -1 | 1 | 0; } | undefined;
    likes: number;
};

interface State {
    noOfLikes: number,
    vote: 0 | 1 | -1;
};

class LikeBox extends React.Component<Props, State> {

    busy: boolean;

    constructor(props: Props) {
        super(props);
        this.state = {
            noOfLikes: 0,
            vote: 0,
        };

        this.busy = false;
        this.isLogin = this.isLogin.bind(this);
        this.like = this.like.bind(this);
        this.dislike = this.dislike.bind(this);
        this.updateLike = this.updateLike.bind(this);
        this.deleteLike = this.deleteLike.bind(this);
        this.changeLike = this.changeLike.bind(this);

    }

    componentDidMount() {
        this.setState({
            noOfLikes: this.props.likes,
            vote: (this.props.liked) ? this.props.liked.value : 0
        });
    }

    isLogin() {
        const cookies = getCookies();
        const type = typeof cookies.ID;
        return (type !== 'undefined' && cookies.ID !== null);
    }

    updateLike(status: string) {
        if (this.busy) return;

        this.busy = true;
        let URL = `${HOST}like/`;
        if (this.props.postId) {
            URL += `post/${this.props.postId}/`;
        } else if (this.props.commentId) {
            URL += `comment/${this.props.commentId}/`;
        } else return null;
        URL += status;
        axios.put(URL, {}, { withCredentials: true })
            .then(res => {
                this.setState({
                    vote: (status === 'up') ? 1 : -1,
                    noOfLikes: this.state.noOfLikes + ((status === 'up') ? 2 : -2)
                });
                this.busy = false;
            })
            .catch(err => {
                console.error(err);
                alert('Something Went Wrong');
            });
    }

    deleteLike() {
        if (this.busy) return;
        this.busy = true;
        let URL = `${HOST}like/`;
        if (this.props.postId) {
            URL += `post/${this.props.postId}`;
        } else if (this.props.commentId) {
            URL += `comment/${this.props.commentId}`;
        } else return null;
        axios.delete(URL, { withCredentials: true })
            .then(res => {
                const ini = this.state.vote;
                this.setState({
                    vote: 0,
                    noOfLikes: this.state.noOfLikes - ini
                });
                this.busy = false;
            })
            .catch(err => {
                console.error(err);
                alert('Something Went Wrong');
            });
    }

    changeLike(status: string) {
        if (this.busy) return;

        this.busy = true;
        let URL = `${HOST}like/`;
        if (this.props.postId) {
            URL += `post/${this.props.postId}/`;
        } else if (this.props.commentId) {
            URL += `comment/${this.props.commentId}/`;
        } else return null;
        URL += status;
        axios.post(URL, {}, { withCredentials: true })
            .then(res => {
                this.setState({
                    vote: (status === 'up') ? 1 : -1,
                    noOfLikes: this.state.noOfLikes + ((status === 'up') ? 1 : -1)
                });
                this.busy = false;
            })
            .catch(err => {
                console.error(err);
                alert('Something Went Wrong');
            });
    }

    like(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();

        if (!this.isLogin()) {
            return alert('Please Login');
        }

        if (typeof this.props.liked === "undefined" || this.state.vote === 0) {
            this.changeLike('up');
        } else if (this.state.vote === 1) {
            this.deleteLike();
        } else {
            this.updateLike('up');
        }
    }

    dislike(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();

        if (!this.isLogin()) {
            return alert('Please Login');
        }

        if (typeof this.props.liked === "undefined" || this.state.vote === 0) {
            this.changeLike('down');
        } else if (this.state.vote === -1) {
            this.deleteLike();
        } else {
            this.updateLike('down');
        }
    }

    render() {
        return (
            <div className="d-flex flex-column likebox"
                onClick={event => event.stopPropagation()}
            >
                <ExpandLessIcon
                    fontSize="large"
                    onClick={this.like}
                    className={(this.state.vote === 1) ? 'liked' : ''}
                />
                {this.state.noOfLikes}
                <ExpandMoreIcon
                    fontSize="large"
                    onClick={this.dislike}
                    className={(this.state.vote === -1) ? 'liked' : ''}
                />
            </div>
        );
    }
}


export default LikeBox;