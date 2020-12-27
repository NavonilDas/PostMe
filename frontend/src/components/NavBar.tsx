import React from 'react';
import { AppBar, Avatar, Button, IconButton, Menu, MenuItem, Modal, Paper, Tab, Tabs, Toolbar, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import axios from 'axios';
import { APIerrorHandler, getCookies, HOST } from '../Config';
import Login from './Login';
import SignUp from './SignUp';


interface Props {
    title: String,
    onLogin?: () => void,
    history?: any
};

interface State {
    isLogin: Boolean,
    username: String,
    openModal: boolean,
    tabIndex: number,
    openMenu: boolean,
    anchorEl: HTMLElement | null;
};

class NavBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            isLogin: false,
            username: "",
            openModal: false,
            tabIndex: 0,
            openMenu: false,
            anchorEl: null,
        };

        this.getUsername = this.getUsername.bind(this);
        this.openLogin = this.openLogin.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.modalClose = this.modalClose.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        this.logout = this.logout.bind(this);
    }

    getUsername() {
        axios.post(`${HOST}users/verify`, {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => {
            if (res.data && res.data.username) {
                this.setState({ isLogin: true, username: res.data.username });
                if (this.props.onLogin) {
                    this.props.onLogin();
                }
            }
        }).catch(err => APIerrorHandler(err, this));
    }


    componentDidMount() {
        const cookie = getCookies();
        if (cookie.ID) {
            this.getUsername();
        }
    }

    openLogin() {
        this.setState({ openModal: true });
    }

    changeTab(event: React.ChangeEvent<{}>, newValue: number): void {
        this.setState({ tabIndex: newValue });
    }

    modalClose() {
        this.setState({
            openModal: false,
            tabIndex: 0
        });
    }

    onLogin() {
        this.getUsername();
        this.modalClose();
    }

    handleOpenMenu(event: React.MouseEvent<HTMLElement>) {
        this.setState({
            anchorEl: event.currentTarget,
            openMenu: true
        });
    }

    handleMenuClose() {
        this.setState({
            anchorEl: null,
            openMenu: false
        });
    }

    logout() {
        document.cookie = 'ID=;expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Clear Cookie
        window.location.href = '/';
    }

    render() {
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        
                        <Typography
                            variant="h6"
                            style={{ flexGrow: 1, cursor: "pointer" }}
                            onClick={() => this.props.history.push('/')}
                        >
                            {this.props.title}
                        </Typography>

                        {
                            (!this.state.isLogin)
                                ?
                                (<Button color="inherit" onClick={this.openLogin}>Login</Button>)
                                :
                                ''
                        }

                        {
                            (this.state.isLogin) ?
                                (
                                    <div className="d-flex">
                                        <IconButton
                                            aria-label="Create Post"
                                            aria-controls="menu-appbar"
                                            aria-haspopup="true"
                                            color="inherit"
                                            onClick={() => {
                                                if (this.props.history) {
                                                    this.props.history.push('/create/post');
                                                }
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <Avatar onClick={this.handleOpenMenu} style={{ cursor: "pointer" }}>{this.state.username.substr(0, 1).toUpperCase()}</Avatar>

                                        <Menu
                                            anchorEl={this.state.anchorEl}
                                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            id="post-me-menu"
                                            keepMounted
                                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            open={this.state.openMenu}
                                            onClose={this.handleMenuClose}
                                        >
                                            <MenuItem onClick={this.handleMenuClose}>{this.state.username}</MenuItem>
                                            <MenuItem onClick={this.logout}>Logout</MenuItem>
                                        </Menu>

                                    </div>
                                )
                                :
                                ''
                        }


                    </Toolbar>
                </AppBar>

                <Modal
                    open={this.state.openModal}
                    onClose={this.modalClose}
                >
                    <div className="modal">
                        <Paper square>
                            <Tabs
                                onChange={this.changeTab}
                                value={this.state.tabIndex}
                                indicatorColor="primary"
                                textColor="primary"
                                aria-label="disabled tabs example"
                            >
                                <Tab label="Login" />
                                <Tab label="Signup" />
                            </Tabs>
                        </Paper>
                        {(this.state.tabIndex === 0) ? <Login onLogin={this.onLogin} /> : <SignUp />}
                    </div>
                </Modal>
            </div>
        );
    }
}


export default NavBar;