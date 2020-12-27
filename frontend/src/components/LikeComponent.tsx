import React from 'react';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { IconButton } from '@material-ui/core';

interface Props {

};

interface State {

};

class Likes extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {

        };
    }

    like(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();
        // TODO: Like
    }

    dislike(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        event.stopPropagation();
        // TODO: Unlike
    }

    render() {
        return (
            <div className="d-flex flex-column likebox"
                onClick={event => event.stopPropagation()}
            >
                <ExpandLessIcon
                    fontSize="large"
                    onClick={this.like}
                />
                    0
                <ExpandMoreIcon
                    fontSize="large"
                    onClick={this.dislike}
                />
            </div>
        );
    }
}


export default Likes;