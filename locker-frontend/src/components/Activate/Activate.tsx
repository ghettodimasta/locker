import React, {Component} from "react";
import {activate} from "../../services/api";
import {alert} from "../NavBar/NavBar";

type ActivateState = {
  loader_active: boolean,
};

interface ActivateProps {
}


export default class Activate extends Component<ActivateProps, ActivateState> {
  constructor(props: ActivateProps) {
    super(props);
    this.state = {
      loader_active: false,
    }
  }

  getTokenFromUrl() {
    const url = window.location.href;
    return url.split('/').at(-1);
  }

  async activate() {
    const response = await activate(this.getTokenFromUrl())
    if (response.data.status === 'ok') {
      await alert.fire({
        title: 'Success!',
        text: 'Your account has been activated!\nYou can now log in.',
        icon: 'success',
        confirmButtonText: 'Ok',
        showCancelButton: false,
        showConfirmButton: true,
      }).then(() => {
        window.location.href = "/"
      })
    }
    else {
      await alert.fire({
        title: 'Error!',
        text: 'Something went wrong.\nPlease try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        showCancelButton: false,
        showConfirmButton: true,
      }).then(() => {
        window.location.href = "/"
      })
    }
  }

  async componentDidMount() {
    await this.activate()
  }

  render() {
    return (
      <>
      </>
    )
  }
}