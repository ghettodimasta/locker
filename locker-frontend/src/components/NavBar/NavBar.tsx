import React, {Component, useState} from 'react';
import './NavBar.css';
import logo from '../../assets/logo.svg';
import {render} from "@testing-library/react";
import Swal from 'sweetalert2'
import withReactContent from "sweetalert2-react-content";
import back, {authUser, getCurrentUser, logout} from "../../services/api";
import instance from "../../services/api";

export const alert = withReactContent(Swal);

type NavbarState = {
  user?: {
    id: number,
    email: string,
    role: string,
  }
}

interface NavbarProps {

}

class Navbar extends Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps) {
    super(props);
    this.state = {
      user: undefined,
    }
  }

  async componentDidMount() {
    if (document.cookie) {
      const response = await getCurrentUser();
      if (response.status === 200) {
        await this.setState({
          user: response.data
        })
      } else {
        await this.setState({
          user: undefined
        })
      }
    }
  }


  //get user email from backend

  async login() {
    await alert.fire({
      title: 'Login',
      html: (
        <div id="login-modal" className="d-flex fd" style={{flexDirection: "column"}}>
          <input className="swal2-input d-flex" id="swal2-input email" placeholder="Enter your email address"
                 type="email"/>
          <input className="swal2-input d-flex" id="swal2-input pass" placeholder="Enter your password"
                 type="password"/>
        </div>
      ),
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Log in',
      showCancelButton: true,
      confirmButtonColor: '#87BC24',
      cancelButtonColor: 'black',
      preConfirm: async () => {
        const email = (document.getElementById('swal2-input email') as HTMLInputElement).value;
        const password = (document.getElementById('swal2-input pass') as HTMLInputElement).value;
        if (!email || !password) {
          await alert.showValidationMessage(
            `Please enter your email and password`
          )
        }
        const response = await authUser(email, password);
        if (response.status !== 200) {
          await alert.showValidationMessage(
            `Request failed with status code ${response.status}`
          )
        }
        await this.setState({
          user: response.data
        })
      },
    })
  }

  async register() {
    await alert.fire({
      title: 'Create your account',
      html: (
        <div id="login-modal" className="d-flex fd" style={{flexDirection: "column"}}>
          <input className="swal2-input d-flex" id="swal2-input email" placeholder="Enter your email address"
                 type="email"/>
          <input className="swal2-input d-flex" id="swal2-input pass" placeholder="Enter your password"
                 type="password"/>
        </div>
      )
    })
  }

  async handleLogoutClick() {
    await alert.fire({
      title: 'Are you sure want to logout?',
      showCancelButton: true,
      confirmButtonColor: '#87BC24',
      cancelButtonColor: 'black',
      confirmButtonText: 'Yes, logout!',
      preConfirm: async () => {
        await logout();
        await this.setState({
          user: undefined
        });
      }
    })
  };

  render() {
    return (
      <header className="header">
        <div className="container">
          <div className="col">
            <div className="row">
              <nav className="navbar navbar-expand-lg navbar-light menu-wrap">
                <div className="menu-wrap-logo d-flex justify-content-between justify-content-lg-start">


                  <a className="header-logo" href="/">

                    <img className="header-logo-img"
                         src={logo}
                         alt="Looking for a luggage storage solution? Store your luggage with Radical Storage! ✓Available worldwide ✓ Best price ever ✓100% safe ✓Highly rated ✓Open 24/7"
                         width="261" height="54" loading="eager"/>

                  </a>
                </div>
                <div className="navbar-wrap">
                  <ul className="nav navbar-nav menu">
                    <li className="nav-item">
                      <ul className="d-flex flex-column flex-lg-row align-items-lg-center">
                        <li>
                          <a className="menu-link font-weight-semibold collapsed" href="/">Home</a>
                        </li>
                        <li>
                          <a className="menu-link font-weight-semibold collapsed" href="/about">About</a>
                        </li>
                        {this.state.user ? (
                          <>
                            <li>
                              <div className="dropdown show">
                                <a className="dropdown-toggle menu-link font-weight-semibold collapsed"
                                   href="javascript:void(0)"
                                   role="button"
                                   id="dropdownMenuLink"
                                   data-bs-toggle="dropdown"
                                   aria-haspopup="true"
                                   aria-expanded="false">
                                  {this.state.user.email}
                                </a>

                                <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                  <a className="dropdown-item menu-link" href="/my-orders">My Orders</a>
                                  <div className="dropdown-divider"></div>
                                  <a className="dropdown-item menu-link"
                                     href="javascript:void(0)"
                                     aria-expanded={false}
                                     onClick={async () => {
                                       await this.handleLogoutClick();
                                     }}>
                                    Logout
                                  </a>
                                </div>
                              </div>
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <a className="menu-link font-weight-semibold collapsed"
                                 href="javascript:void(0)"
                                 aria-expanded={false}
                                 onClick={async () => {
                                   await this.login();
                                 }}
                              >Login</a>
                            </li>
                            <li>
                              <a className="menu-link font-weight-semibold collapsed" href="/register"
                                 aria-expanded={false}>Register</a>
                            </li>
                          </>
                        )}
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="navbar-wrap-hack">

                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Navbar;
