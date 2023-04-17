import React, {Component} from "react";
import Navbar, {alert} from "../NavBar/NavBar";
import {getStorage, orderStorage} from "../../services/api";
import "./StorageDetail.css";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import {Button, FormControl, FormLabel} from "@mui/material";
import dayjs from "dayjs";
import moment from "moment";
import {redirect} from "react-router-dom";

type StorageDetailState = {
  loader_active: boolean,
  storage: any,
  storage_id: string | null,
  bags: number,
  check_in: any
  check_out: any,
};

interface StorageDetailProps {
}

interface Window {
  QiwiCheckout: any;
}

export class StorageDetail extends Component<StorageDetailProps, StorageDetailState> {
  constructor(props: StorageDetailProps) {
    super(props);
    this.state = {
      loader_active: false,
      storage: null,
      storage_id: this.getStorageIdFromUrl(),
      bags: 1,
      check_in: moment().startOf('day'),
      check_out: moment().startOf('day'),
    }
  }


  private getStorageIdFromUrl() {
    return window.location.pathname.split('/')[2];
  }

  private checkAvailability(): boolean {
    // Check if check_in is before check_out
    if (this.state.check_in.isSameOrAfter(this.state.check_out)) {
      return true;
    }

    // Check if check_in is within storage's opening hours
    const openingHours = moment(this.state.storage.opening_hours, 'HH:mm');

    if (this.state.check_in.isBefore(openingHours)) {
      return true;
    }

    // Check if check_out is within storage's closing hours
    const closingHours = moment(this.state.storage.closing_hours, 'HH:mm');
    if (this.state.check_out.isAfter(closingHours)) {
      return true;
    }

    // Return true if all validations pass
    return false;
  }

  private async bookStorage() {
    const response = await orderStorage(
      {
        storage_poi: this.state.storage_id,
        bags: this.state.bags,
        check_in: this.state.check_in.toISOString(),
        check_out: this.state.check_out.toISOString(),
        payment_type: "qiwi"
      }
    )
    if (response.status === 201) {
      const url = response.data.form_url
      window.location.replace(url)
    }
  }


  async componentWillMount() {
    const response = await getStorage(this.state.storage_id)
    if (response.status === 200) {
      const check_in = this.state.check_in.set('hour', response.data.opening_hours.split(':')[0]).set('minute', response.data.opening_hours.split(':')[1])
      const check_out = this.state.check_out.set('hour', response.data.closing_hours.split(':')[0]).set('minute', response.data.closing_hours.split(':')[1])
      if (response.data.available_bags <= 0) {
        await alert.fire({
          title: "No available bags",
          text: "Sorry, but there are no available bags in this storage",
          icon: "error",
          confirmButtonText: "Ok",
          preConfirm: async() => {
            window.location.href = '/'
          }
        })
      }
      await this.setState({
        storage: response.data,
        check_in: check_in,
        check_out: check_out
      })
    } else {
      window.location.href = '/'
    }
  }

  render() {
    return this.state.storage && (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Navbar/>
        <div id="storage-page" className="main">
          <div className="container pt-4">
            <div className="row">
              <div className="d-flex flex-wrap col-md-6 col-12">
                <div className="storage-content d-flex flex-column">
                  <div className="px-0 my-2 order-first">
                    <div className="d-flex align-items-start">
                      <h1 className="title title-page text-fs-20 mb-0">
                        {this.state.storage.name}
                      </h1>
                    </div>
                  </div>
                  <div className="storage-underlined-block col-12 px-0"></div>
                  <div className="col-12 px-0">
                    <h6 className="gray-h">Location</h6>
                    <h4>{this.state.storage.address_clean}</h4>
                    <h6>{this.state.storage.dadata_info.city_district_with_type}</h6>
                    {this.state.storage.dadata_info.metro ? (
                      <h6>Distance to nearest metro {this.state.storage.dadata_info.metro[0].distance} км
                        ({this.state.storage.dadata_info.metro[0].name})</h6>
                    ) : null}
                  </div>
                  <div className="storage-underlined-block col-12 px-0"></div>
                  <div className="col-12 px-0">
                    <h6 className="gray-h">Opening hours</h6>
                    <h4>Today: {this.state.storage.opening_hours} - {this.state.storage.closing_hours}</h4>
                  </div>
                  <div className="storage-underlined-block col-12 px-0"></div>
                  <div className="col-12 px-0">
                    <h6 className="gray-h">Description</h6>
                    <h6>{this.state.storage.description}</h6>
                    <h6>Url: {this.state.storage.url}</h6>
                  </div>
                  <div className="storage-underlined-block col-12 px-0"></div>
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="book-storage px-4">
                  <div className="book-title">
                    <h4>Book for 500 ₽ bag/day</h4>
                  </div>
                  <div className="book-form">
                    <div className="form-group">
                      <FormLabel>Check-in</FormLabel>
                      <div className="d-flex">
                        <DatePicker className="m-2"
                                    disablePast={true}
                                    onChange={(date) => {
                                      // @ts-ignore
                                      const change = this.state.check_in.set('date', date.date()).set('month', date.month()).set('year', date.year())
                                      this.setState({check_in: change})
                                    }}
                                    defaultValue={dayjs(this.state.check_in.format('YYYY-MM-DD'))}
                        />
                        <TimePicker label="Time"
                                    onChange={(time) => {
                                      // @ts-ignore
                                      const change = this.state.check_in.set('hour', time.hour()).set('minute', time.minute())
                                      this.setState({check_in: change})
                                      // this.setState({check_out: time})
                                    }}
                                    minTime={dayjs(this.state.storage.opening_hours, "HH:mm:ss")}
                                    maxTime={dayjs(this.state.storage.closing_hours, "HH:mm:ss")}
                                    className="m-2"
                                    defaultValue={dayjs(this.state.check_in.format('YYYY-MM-DDTHH:mm'))}
                          // value={this.state.check_in.getTime()}
                                    ampm={false}/>
                      </div>
                      <FormLabel>Check-out</FormLabel>
                      <div className="d-flex">
                        <DatePicker className="m-2"
                                    onChange={(date) => {
                                      // @ts-ignore
                                      const change = this.state.check_out.set('date', date.date()).set('month', date.month()).set('year', date.year())
                                      this.setState({check_out: change})
                                    }}
                                    defaultValue={dayjs(this.state.check_out.format('YYYY-MM-DD'))}/>
                        <TimePicker label="Time"
                                    onChange={(time) => {
                                      // @ts-ignore
                                      const change = this.state.check_out.set('hour', time.hour()).set('minute', time.minute())
                                      this.setState({check_out: change})
                                      // this.setState({check_out: time})
                                    }}
                                    defaultValue={dayjs(this.state.check_out.format('YYYY-MM-DDTHH:mm'))}
                                    minTime={dayjs(this.state.storage.opening_hours, "HH:mm:ss")}
                                    maxTime={dayjs(this.state.storage.closing_hours, "HH:mm:ss")}
                                    className="m-2"
                                    ampm={false}/>
                      </div>
                      <label>Number of bags</label>
                      <span className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary btn-number position-relative"
                          type="button"
                          disabled={this.state.bags === 1}
                          onClick={() => this.setState({bags: this.state.bags > 1 ? this.state.bags - 1 : this.state.bags})}
                          datatype="minus">
                          <i className="horizontal-stick-btn"></i>
                        </button>
                        <input type="text" className="form-control input-number" value={this.state.bags} min="1"
                               max="10"/>
                        <button
                          className="btn btn-outline-secondary btn-number position-relative"
                          type="button"
                          disabled={this.state.bags === this.state.storage.available_bags}
                          onClick={() => this.setState({bags: this.state.bags < this.state.storage.available_bags ? this.state.bags + 1 : this.state.bags})}
                          datatype="plus">
                          <i className="horizontal-stick-btn"></i>
                          <i className="vertical-stick-btn"></i>
                        </button>
                      </span>
                      <button type="submit"
                              onClick={async (event) => {
                                event.currentTarget.value = "Loading..."
                                event.currentTarget.disabled = true
                                await this.bookStorage()
                              }}
                              disabled={this.checkAvailability()}
                              className="btn-book">
                        Choose Payment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LocalizationProvider>
    )
  }

  private async choosePayment() {
    await alert.fire({
      title: 'Choose payment method',
    })
  }
}
