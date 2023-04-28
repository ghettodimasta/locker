import React, {Component} from "react";
import logo from '../../assets/logo.svg'
import frame from '../../assets/frame_5.webp'
import './Register.css'
import {createUser} from "../../services/api";
import {alert} from "../NavBar/NavBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';


type RegisterState = {
  loader_active: boolean,
  email: string,
  password: string,
  password_confirmation: string,
};

interface RegisterProps {
}

export class Register extends Component<RegisterProps, RegisterState> {

  constructor(props: RegisterProps) {
    super(props);
    this.state = {
      loader_active: false,
      email: "",
      password: "",
      password_confirmation: "",
    }
  }

  private validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  private validatePassword(password: string, password_confirmation: string) {
    return password_confirmation === password;
  }

  private signUpButtonDisabled() {
    return !this.validateEmail(this.state.email) || !this.validatePassword(this.state.password, this.state.password_confirmation) || this.state.password === "" || this.state.password_confirmation === "";

  }

  private async register() {
    const response = await createUser({
      "email": this.state.email,
      "password": this.state.password,
      "role": 2
    })
    if (response.status === 201) {
      await alert.fire({
        title: 'Success!',
        text: 'Your account has been created!\nCheck your email for confirmation.',
        icon: 'success',
        confirmButtonText: 'Ok',
        showCancelButton: false,
        showConfirmButton: true,
      }).then(() => {
        window.location.href = "/"
      })
    } else {
      await alert.fire({
        title: 'Error!',
        text: 'Something went wrong, please try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        showCancelButton: false,
        showConfirmButton: true,
      })
    }
  }

  render() {
    return (
      <div className="container">
        <a className="header-logo" href="/">

          <img className="header-logo-img"
               src={logo}
               width="261" height="54" loading="eager"/>

        </a>
        <div className="reg-panel">
          <div className="reg-form d-flex w-100 justify-content-center">
            <div className="overflow-hidden d-flex flex-column-reverse"
            >
              <img
                className="img-wrap position-absolute h-100"
                src={frame}
              />
            </div>
            <div className="flex-row-reverse d-flex w-50">
              <div className="register-form-wrap">
                <h4 className="text-uppercase"><strong>sign up</strong></h4>
                <form className="register-form">
                  <div className="form-group">
                    <label htmlFor="email" className="input-wrap">email</label>
                    <input type="email" className="form-control new-user-input" id="email" aria-describedby="emailHelp"
                           placeholder="email@email.com"
                           onChange={(e) => {
                             this.setState({
                               email: e.target.value
                             })
                           }}
                    />
                    <label htmlFor="password" className="input-wrap">password</label>
                    <input type="password" className="form-control new-user-input" id="password" placeholder="••••••••"
                           onChange={(e) => {
                             this.setState({
                               password: e.target.value
                             })
                           }}
                    />
                    <label htmlFor="password" className="input-wrap">confirm password</label>
                    <input type="password" className="form-control new-user-input" id="password" placeholder="••••••••"
                           onChange={(e) => {
                             this.setState({
                               password_confirmation: e.target.value
                             })
                           }}
                    />
                  </div>
                  <button type="submit" className="btn-sign-up form-control text-lowercase"
                          onClick={async (e) => {
                            e.preventDefault()
                            await this.register()
                          }}
                          disabled={this.signUpButtonDisabled()}
                  > <span className="text-center">sign up</span>
                    <span><FontAwesomeIcon icon={faArrowRight} className="ml-2"/></span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}