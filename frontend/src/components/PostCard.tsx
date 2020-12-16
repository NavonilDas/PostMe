import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import ChatIcon from '@material-ui/icons/Chat';
// import ShareIcon from '@material-ui/icons/Share';
import { PostListItem } from '../Config';

interface Props {
    post: PostListItem,
    history: any
};

class PostCard extends React.Component<Props> {
    render() {
        return (
            <Card
                style={{ marginBottom: "15px", cursor: "pointer" }}
                onClick={() => {
                    if (this.props.history) {
                        this.props.history.push(`/read/${this.props.post.slug}`);
                    }
                }}
            >
                <CardContent>
                    <Typography
                        style={{ fontSize: "14px" }}
                        color="textSecondary"
                        gutterBottom
                    >
                        By {this.props.post.USER.name}
                    </Typography>

                    <Typography variant="h5" component="h2">
                        {this.props.post.title}
                    </Typography>

                    <div dangerouslySetInnerHTML={{ __html: this.props.post.content }} />

                </CardContent>

                <CardActions>
                    <Button
                        startIcon={<ChatIcon />}
                        size="small"
                        onClick={event => {
                            event.stopPropagation();
                            if (this.props.history) {
                                this.props.history.push(`/read/${this.props.post.slug}#comments`);
                            }
                        }}
                    >
                        {this.props.post.comments} Comments
                    </Button>

                    {/* <Button
                        startIcon={<ShareIcon />}
                        size="small"
                    >
                        Share
                    </Button> */}

                </CardActions>
            </Card>
        );
    }
}


export default PostCard;