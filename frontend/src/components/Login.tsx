import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, TextField } from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import axios from 'axios';
import { APIerrorHandler, HOST } from '../Config';


interface Props {
    onLogin?: () => void
};

interface State {
    username: String,
    usernameError: String,
    password: String,
    passwordError: String,
    apiError: String,
    passwordVisible: Boolean
};

class Login extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            username: "",
            usernameError: "",
            password: "",
            passwordError: "",
            passwordVisible: false,
            apiError: ""
        };

        this.onChange = this.onChange.bind(this);
        this.submit = this.submit.bind(this);
        this.changeUsername = this.changeUsername.bind(this);
    }

    onChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { name, value } = event.target;
        const tmp: any = {};
        tmp[name] = value;
        tmp[`${name}Error`] = "";
        this.setState(tmp);
    }

    changeUsername(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        let { value } = event.target;
        value = value.toLowerCase();
        value = value.replace(/[^a-z0-9]/g, "");
        this.setState({
            username: value,
            usernameError: ""
        });
    }


    submit() {
        if (this.state.username === "") {
            return this.setState({ usernameError: "Empty Username" });
        }
        if (this.state.password === "") {
            return this.setState({ passwordError: "Empty Password" });
        }
        // TODO: Request API
        const body = {
            username: this.state.username,
            password: this.state.password
        };
        axios.post(`${HOST}users/login`, body)
            .then(res => {
                if (res.data && res.data.status) {
                    const expire = new Date();
                    expire.setTime(expire.getTime() + 30 * 24 * 60 * 60 * 1000); // 30days
                    document.cookie = `ID=${res.data.status}; expires=${expire.toUTCString()}; path=/`;
                    if (this.props.onLogin) {
                        this.props.onLogin();
                    }
                }
            })
            .catch(err => APIerrorHandler(err, this));
    }

    render() {
        return (
            <div className="d-flex flex-column signup-form">
                <AccountCircleIcon style={{ width: "160px", height: "150px", margin: "0 auto 0 auto" }} />

                <span className="errorText">{this.state.apiError}</span>

                <TextField
                    value={this.state.username}
                    required
                    onChange={this.changeUsername}
                    name="username"
                    label="Username"
                    helperText={this.state.usernameError}
                    error={this.state.usernameError !== ""}
                />

                <FormControl
                    error={this.state.passwordError !== ""}
                >
                    <InputLabel htmlFor="standard-password">Password *</InputLabel>
                    <Input
                        value={this.state.password}
                        id="standard-password"
                        name="password"
                        required
                        onChange={this.onChange}
                        type={this.state.passwordVisible ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => this.setState({ passwordVisible: !this.state.passwordVisible })}
                                    aria-label="toggle password visibility"
                                >
                                    {this.state.passwordVisible ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText>{this.state.passwordError}</FormHelperText>
                </FormControl>

                <Button
                    onClick={this.submit}
                    variant="contained"
                    color="primary"
                >
                    Login
                </Button>


            </div>
        );
    }
}


export default Login;