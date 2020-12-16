import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, Snackbar, TextField } from '@material-ui/core';
import React, { ChangeEvent } from 'react';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import axios from 'axios';
import { APIerrorHandler, HOST } from '../Config';

import CloseIcon from '@material-ui/icons/Close';

interface Props { };

interface State {
    name: String,
    nameError: String,
    email: string,
    emailError: String,
    username: String,
    usernameError: String,
    password: String,
    passwordError: String,
    passwordVisible: Boolean,
    confirmPassword: String,
    confirmError: String,
    confirmVisible: Boolean,
    openSnackbar: boolean,
    apiError: string
};

class SignUp extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            name: "",
            nameError: "",
            email: "",
            emailError: "",
            username: "",
            usernameError: "",
            password: "",
            passwordError: "",
            passwordVisible: false,
            confirmPassword: "",
            confirmError: "",
            confirmVisible: false,
            openSnackbar: false,
            apiError: ""
        };

        this.onChange = this.onChange.bind(this);
        this.confirmPassword = this.confirmPassword.bind(this);
        this.validateUsername = this.validateUsername.bind(this);
        this.submit = this.submit.bind(this);
        this.closeSnackbar = this.closeSnackbar.bind(this);
    }

    onChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { name, value } = event.target;
        const tmp: any = {};
        tmp[name] = value;
        tmp[`${name}Error`] = "";
        this.setState(tmp);
    }

    validateUsername(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        let { value } = event.target;
        value = value.toLowerCase();
        value = value.replace(/[^a-z0-9]/g, "");
        this.setState({
            username: value,
            usernameError: ""
        });

        if (value === '') return;

        axios.post(`${HOST}users/check/username`, { username: value })
            .then(res => {
                if (res.data?.found) {
                    this.setState({
                        usernameError: "Username Already Taken"
                    });
                }
            })
            .catch(err => APIerrorHandler(err, this));
    }

    validateEmail(email: string) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    confirmPassword(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        let confirmError = "";
        if (this.state.password !== event.target.value) {
            confirmError = "Password Not Matching";
        }
        this.setState({ confirmError, confirmPassword: event.target.value });
    }

    closeSnackbar() {
        this.setState({
            openSnackbar: false
        });
    }

    submit() {
        if (this.state.name === "") {
            return this.setState({ nameError: "Empty Name" });
        }
        if (this.state.email === "") {
            return this.setState({ emailError: "Empty Email" });
        }
        if (!this.validateEmail(this.state.email)) {
            return this.setState({ emailError: "Invalid Email" });
        }
        if (this.state.username === "") {
            return this.setState({ usernameError: "Empty Username" });
        }
        if (this.state.password.length < 8) {
            return this.setState({ passwordError: "Password is Less Than 8" });
        }
        if (!this.state.password.match(/[a-z]/g)) {
            return this.setState({ passwordError: "Password at least needs one LowerCase charecter" });
        }
        if (!this.state.password.match(/[A-Z]/g)) {
            return this.setState({ passwordError: "Password at least needs one UpperCase charecter" });
        }
        if (!this.state.password.match(/[0-9]/g)) {
            return this.setState({ passwordError: "Password at least needs one digit!" });
        }
        if (this.state.password !== this.state.confirmPassword) {
            return this.setState({ passwordError: "Password Don't match" });
        }

        const body = {
            email: this.state.email,
            username: this.state.username,
            name: this.state.name,
            password: this.state.password
        };

        const config = {
            headers: {
                // 'Content-Type': 'multipart/form-data'
            }
        };

        axios.post(`${HOST}users/signup`, body, config)
            .then(res => {
                console.log(res);
                if (res.data && res.data.id) {
                    this.setState({
                        openSnackbar: true,
                        name: "",
                        username: "",
                        password: "",
                        confirmPassword: "",
                        email: ""
                    });
                }
            })
            .catch(err => APIerrorHandler(err, this));
    }

    render() {
        return (
            <div className="d-flex flex-column signup-form">

                <span className="errorText">{this.state.apiError}</span>

                <TextField
                    value={this.state.name}
                    required
                    onChange={this.onChange}
                    name="name"
                    label="Full Name"
                    helperText={this.state.nameError}
                    error={this.state.nameError !== ""}
                />
                <TextField
                    value={this.state.email}
                    type="email"
                    required
                    onChange={this.onChange}
                    name="email"
                    label="Email"
                    helperText={this.state.emailError}
                    error={this.state.emailError !== ""}
                />

                <TextField
                    value={this.state.username}
                    required
                    label="Username"
                    onChange={this.validateUsername}
                    helperText={this.state.usernameError}
                    error={this.state.usernameError !== ""}
                />

                <FormControl
                    error={this.state.passwordError !== ""}
                >
                    <InputLabel htmlFor="standard-password">Password</InputLabel>
                    <Input
                        value={this.state.password}
                        id="standard-password"
                        name="password"
                        type={this.state.passwordVisible ? 'text' : 'password'}
                        onChange={this.onChange}
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

                <FormControl
                    error={this.state.confirmError !== ""}
                >
                    <InputLabel htmlFor="standard-confirm-password">Confirm Password</InputLabel>
                    <Input
                        value={this.state.confirmPassword}
                        id="standard-confirm-password"
                        name="confirmPassword"
                        onChange={this.confirmPassword}
                        type={this.state.confirmVisible ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => this.setState({ confirmVisible: !this.state.confirmVisible })}
                                    aria-label="toggle password visibility"
                                >
                                    {this.state.confirmVisible ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText>{this.state.confirmError}</FormHelperText>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={this.submit}
                >
                    Sign Up
                </Button>



                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.openSnackbar}
                    autoHideDuration={6000}
                    onClose={this.closeSnackbar}
                    message="Your Account is Created Please Login!"
                    action={
                        <React.Fragment>
                            <IconButton size="small" aria-label="close" color="inherit" onClick={this.closeSnackbar}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                    }
                />


            </div>
        );
    }
}


export default SignUp;