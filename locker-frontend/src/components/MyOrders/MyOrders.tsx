import React, {Component} from "react";
import Navbar from "../NavBar/NavBar";
import {getOrders, payOrder} from "../../services/api";
import "./MyOrders.css";
import moment from "moment";
import {Table} from "@mui/material";

type MyOrderState = {
  loader_active: boolean,
  order_list: [],
  chosen_order: any
};

interface MyOrderProps {
}

export class MyOrder extends Component<MyOrderProps, MyOrderState> {
  constructor(props: MyOrderProps) {
    super(props);
    this.state = {
      loader_active: false,
      order_list: [],
      chosen_order: null
    }
  }

  async componentWillMount() {
    const response = await getOrders()
    if (response.status === 200) {
      await this.setState({
        order_list: response.data,
        chosen_order: response.data[0]
      })
    } else {
      window.location.href = '/'
    }
  }

  private needToPayForExtra() {
    return !(this.state.chosen_order.status === "created" ||
      this.state.chosen_order.status !== "checked_in" ||
      (this.state.chosen_order.is_payed &&
        (this.state.chosen_order.is_payed_for_extra_days || this.state.chosen_order.is_payed_for_extra_days == null)))
  }


  render() {
    return (
      <>
        <Navbar/>
        <div id="order-page" className="main">
          <div className="container pt-4">
            <h1 className="header-title text-uppercase">My Orders</h1>
            <div className="d-flex">
              <div className="col-md-8 col-12 left-panel">
                <div className="table-wrap">
                  <table className="table table-borderless">
                    <thead className="table-header">
                    <tr>
                      <th scope="col">order ID</th>
                      <th scope="col">status</th>
                      <th scope="col">date</th>
                      <th scope="col">price</th>
                    </tr>
                    </thead>
                    <tbody className="table-body text-center">
                    {this.state.order_list.map((order: any) => {
                      return (
                        <tr onClick={event => {
                          this.setState({
                            chosen_order: order
                          })
                        }}>
                          <th scope="row">{order.id}</th>
                          <td>{order.status}</td>
                          <td>{moment(order.created_at).format("DD/MM/YY HH:mm")}</td>
                          <td>{order.amount}</td>
                        </tr>
                      )
                    })
                    }
                    </tbody>
                  </table>
                </div>
              </div>
              {this.state.chosen_order ? (
                <div className="col-md-6 col-12">
                  <div className="d-flex flex-wrap col-md-8 col-12 right-panel">
                    <h4 className="detail-id text-uppercase">Order: {this.state.chosen_order.id}</h4>
                    <div className="w-100 order-details">
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Status</p>
                        <p>{this.state.chosen_order.status}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Storage</p>
                        <p>{this.state.chosen_order.storage_poi.name}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Address</p>
                        <p className="address-info">{this.state.chosen_order.storage_poi.address_clean}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Bags</p>
                        <p>{this.state.chosen_order.bags}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Check-in</p>
                        <p>{moment(this.state.chosen_order.check_in).format("DD/MM/YY HH:mm")}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Check-out</p>
                        <p>{moment(this.state.chosen_order.check_out).format("DD/MM/YY HH:mm")}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Expired Days</p>
                        <p>{this.state.chosen_order.expired_days}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p className="text-lowercase detail-text">Total Days (Booked + Expired)</p>
                        <p>{moment(this.state.chosen_order.check_out).diff(
                          moment(this.state.chosen_order.check_in
                          ), 'days') + 1 + this.state.chosen_order.expired_days}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <h6 className="text-lowercase"><strong>Extra Amount</strong></h6>
                        <h6><strong>{this.state.chosen_order.extra_amount.toFixed(2)}</strong></h6>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <h5 className="text-lowercase"><strong>Total Price</strong></h5>
                        <h5>
                          <strong>{(parseFloat(this.state.chosen_order.amount.replace(/,/g, '')) + this.state.chosen_order.extra_amount).toFixed(2)}</strong>
                        </h5>
                      </div>
                    </div>
                    {this.needToPayForExtra() ? (
                      <button type="submit"
                              onClick={async (event) => {
                                event.preventDefault();
                                await this.setState({
                                  loader_active: true
                                })
                                const response = await payOrder(this.state.chosen_order.id)
                                if (response.status === 200) {
                                  await this.setState({
                                    loader_active: false,
                                  })
                                } else {
                                  await this.setState({
                                    loader_active: false
                                  })
                                }
                              }}
                              className="btn-book extra">
                        Pay for extra days {this.state.chosen_order.extra_amount.toFixed(2)}
                      </button>
                    ) : (
                      <button type="submit"
                              className="btn-book extra"
                              onMouseEnter={async (event) => {
                                // event.preventDefault();
                                event.currentTarget.innerHTML = this.state.chosen_order.pin_code
                              }}

                              onMouseLeave={async (event) => {
                                event.currentTarget.innerHTML = 'Show Pin Code'
                              }}
                      >
                        Show Pin Code
                      </button>
                    )}
                  </div>
                </div>
              ) : null
              }
            </div>
          </div>
        </div>
      </>
    );
  }
}