import React from 'react';
import NavBar from './NavBar';
import PostCard from './PostCard';

import axios from 'axios';
import { APIerrorHandler, HOST, PostListItem } from '../Config';



interface Props {
    history?: any
};

interface State {
    posts: PostListItem[],
    apiError: string;
};

class Home extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            posts: [],
            apiError: ""
        };
    }

    componentDidMount() {
        axios.get(`${HOST}posts/0`)
            .then(res => {
                this.setState({
                    posts: res.data
                })
            })
            .catch(err => APIerrorHandler(err, this.setState));
    }

    render() {
        return (
            <div>
                <NavBar title="PostMe" history={this.props.history} />
                <span className="errorText">{this.state.apiError}</span>
                {(this.state.posts.length === 0) ? 'No Posts Available' : ''}

                <div className="body">
                    {this.state.posts.map((post, ind) => <PostCard key={ind} post={post} history={this.props.history} />)}
                </div>
            </div>
        );
    }
}


export default Home;
