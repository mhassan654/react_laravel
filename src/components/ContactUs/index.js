import React, {Component} from 'react';
// import Row from "@material-ui/core/Row";
import {withTranslation} from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import {connect} from 'react-redux'

// images
import Shape7 from '../../images/shape7.png';
import bgShape8 from '../../images/bg-shape-n1.png';
import TextField from "@material-ui/core/TextField";

import './style.scss';
// import Button from "@material-ui/core/Button";

import {
   Col, Form, Button, Row
} from 'react-bootstrap';
import {toast} from "react-toastify";

import Joi from 'joi-browser';
import {postRequest} from "../../utils/request";

class ContactUs extends Component {

    state = {
        name: '',
        email: '',
        message: '',
        subject: '',
        error: {},
        gcaptcha_code: '',
    };

    onChange = (value) => {
        this.setState({
            gcaptcha_code: value
        })
    };

    schema = {
        name: Joi.string()
            .required(),
        subject: Joi.string(),
        email: Joi.string()
            .required()
            .email()
            .error(errors => {
                errors.forEach(err => {
                    switch (err.type) {
                        case 'string.email':
                            err.message = 'Email Must be Email Format';
                            break;
                        case 'any.required':
                            err.message = 'Email is Requared';
                            break;
                        default:
                            break;
                    }
                });
                return errors;
            }),
        message: Joi.string()
            .required()
            .error(errors => ({
                message: 'Please Provide a Message',
            })),
    };

    changeHandler = event => {
        const error = {...this.state.error};
        const errorMassage = this.validationProperty(event);
        if (errorMassage) {
            error[event.target.name] = errorMassage;
        } else {
            delete error[event.target.name];
        }
        this.setState({
            [event.target.name]: event.target.value,
            error,
        });
    };


    validationProperty = event => {
        const Obj = {[event.target.name]: event.target.value};
        const schema = {[event.target.name]: this.schema[event.target.name]};
        const {error} = Joi.validate(Obj, schema);
        return error ? error.details[0].message : null;
    };

    validate = () => {
        const options = {abortEarly: false};
        const form = {
            name: this.state.name,
            email: this.state.email,
            subject: this.state.subject,
            message: this.state.message,
        };
        const {error} = Joi.validate(form, this.schema, options);
        if (!error) return null;

        const errors = {};
        for (const item of error.details) errors[item.path[0]] = item.message;
        return errors;
    };

    submitHandler = event => {
        event.preventDefault();
        const error = this.validate();

        this.setState({
            error: error || {},
        });

        const data = {
            name: this.state.name,
            email: this.state.email,
            subject: this.state.subject,
            description: this.state.message
        };
        if (!error && this.state.gcaptcha_code !== '') {
            postRequest('contact-process', data)
                .then(res => {
                    if (res.data.success === true) {
                        toast.success(res.data.message);
                        this.setState({
                            name: '',
                            email: '',
                            subject: '',
                            message: '',
                        })
                    } else {
                        toast.error(res.data.message);
                    }
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Server error!');
                });
        }
    };

    render() {

        const {name, email, message, subject} = this.state;
        const {className = ''} = this.props;

        return (
            <Row className={`contactUsWrapper ${className}`}>
                <Row
                    className="container"
                    container
                    spacing={4}>
                    <Col item xs={12} md={6}>
                        <div className="thumb">
                            <img src={Shape7} alt="thumb"/>
                        </div>
                    </Col>
                    <Col item xs={12} md={6}>
                        <Row className="contactRight">
                            <Col className="textContent">
                                <strong>{this.props.t('Home.ContactUs.SubTitle')}</strong>
                                <h4>{this.props.t('Home.ContactUs.Title')}</h4>
                            </Col>

                            <Form className="mb-3" onSubmit={this.submitHandler}>
                                <Row
                                    // spacing={2}
                                    container>
                                    <Row item xs={12} md={12}>
                                        <TextField
                                            name="name"
                                            value={name}
                                            helperText={
                                                this.state.error.name ? this.state.error.name : ''
                                            }
                                            placeholder="Name*"

                                            // className="inputStyleBasic"
                                            margin="normal"
                                            variant="outlined"
                                            onChange={this.changeHandler}
                                        />

                                    </Row>
                                    <Row item xs={12} md={12}>
                                        <TextField
                                            name="email"
                                            helperText={
                                                this.state.error.email ? this.state.error.email : ''
                                            }
                                            value={email}
                                            placeholder="Email*"
                                            className="inputStyleBasic"
                                            margin="normal"
                                            variant="outlined"
                                            onChange={this.changeHandler}
                                        />
                                    </Row>
                                    <Row item xs={12}>
                                        <TextField
                                            name="subject"
                                            value={subject}
                                            helperText={
                                                this.state.error.subject ? this.state.error.subject : ''
                                            }
                                            placeholder="Subject*"
                                            className="inputStyleBasic"
                                            margin="normal"
                                            variant="outlined"
                                            onChange={this.changeHandler}
                                        />
                                    </Row>
                                    <Row item xs={12}>
                                        <TextField
                                            multiline
                                            helperText={
                                                this.state.error.message ? this.state.error.message : ''
                                            }
                                            value={message}
                                            className="inputStyleBasic"
                                            name="message"
                                            placeholder="Message*"
                                            variant="outlined"
                                            onChange={this.changeHandler}
                                        />
                                    </Row>
                                    <Row item xs={12}>
                                        {this.props.google_capcha_site_key !== undefined ? <ReCAPTCHA
                                            sitekey={this.props.google_capcha_site_key !== '' ? this.props.google_capcha_site_key : '6LeDrckUAAAAAP2PISECcnuOO8agpcPgB2PXVAPb'}
                                            onChange={this.onChange}
                                        /> : ''}
                                    </Row>
                                    <Row item xs={12}>
                                        <Button type="submit"
                                                className="cBtn cBtnShadow mt-20 pr-50 pl-50">Send</Button>
                                    </Row>
                                </Row>
                            </Form>
                        </Row>
                    </Col>
                </Row>
                <img className="bgShape8" src={bgShape8} alt="shape"/>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    return {
        google_capcha_site_key: state.header.google_capcha_site_key
    }
};

export default withTranslation('common')(connect(mapStateToProps)(ContactUs));