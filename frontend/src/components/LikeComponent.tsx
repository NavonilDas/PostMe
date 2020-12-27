import React from 'react';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { IconButton } from '@material-ui/core';

interface Props {
    postId?: string;
    commentId?: string;
    liked: { _id: string; value: -1 | 1 | 0; } | undefined;
    likes: number;
};

interface State {
    noOfLikes: number,
    busy: boolean;
    vote: 0 | 1 | -1;
};

class LikeBox extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            noOfLikes: 0,
            busy: false,
            vote: 0
        };
    }

    componentDidMount() {
        // console.log(this.props.liked);
        this.setState({
            noOfLikes: this.props.likes,
            vote: (this.props.liked) ? this.props.liked.value : 0
        });
    }

    like(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();
        if (typeof this.props.liked === "undefined" || this.props.liked.value === 0) {
            // TODO: Check Login and if Login Like
        } else if (this.props.liked.value === 1) {
            // TODO: Delete Like
        } else {
            // TODO: Update Like
        }
    }

    dislike(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();
        if (typeof this.props.liked === "undefined" || this.props.liked.value === 0) {
            // TODO: Check Login and if Login Like
        } else if (this.props.liked.value === -1) {
            // TODO: Delete Like
        } else {
            // TODO: Update Like
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