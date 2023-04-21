import React, {Component} from "react";
import Navbar from "../NavBar/NavBar";
import {getOrders, payOrder} from "../../services/api";
import "./MyOrders.css";
import moment from "moment";

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
            <div className="d-flex">
              <div className="col-md-8 col-12 left-panel">
                <h1>My Orders</h1>
                <div className="order-list">
                  <table className="table table-borderless">
                    <thead className="table-header">
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Status</th>
                      <th scope="col">Date</th>
                      <th scope="col">Price</th>
                    </tr>
                    </thead>
                    <tbody className="table-body">
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
                    <h4>Order: {this.state.chosen_order.id}</h4>
                    <div className="w-100 order-details">
                      <div className="d-flex justify-content-between info-text">
                        <p>Status</p>
                        <p>{this.state.chosen_order.status}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Storage</p>
                        <p>{this.state.chosen_order.storage_poi.name}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Address</p>
                        <p className="address-info">{this.state.chosen_order.storage_poi.address_clean}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Bags</p>
                        <p>{this.state.chosen_order.bags}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Check-in</p>
                        <p>{moment(this.state.chosen_order.check_in).format("DD/MM/YY HH:mm")}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Check-out</p>
                        <p>{moment(this.state.chosen_order.check_out).format("DD/MM/YY HH:mm")}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Expired Days</p>
                        <p>{this.state.chosen_order.expired_days}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <p>Total Days (Booked + Expired)</p>
                        <p>{moment(this.state.chosen_order.check_out).diff(
                          moment(this.state.chosen_order.check_in
                          ), 'days') + 1 + this.state.chosen_order.expired_days}</p>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <h6><strong>Extra Amount</strong></h6>
                        <h6><strong>{this.state.chosen_order.extra_amount.toFixed(2)}</strong></h6>
                      </div>
                      <div className="d-flex justify-content-between info-text">
                        <h5><strong>Total Price</strong></h5>
                        <h5><strong>{(parseFloat(this.state.chosen_order.amount.replace(/,/g, '')) + this.state.chosen_order.extra_amount).toFixed(2)}</strong></h5>
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
                            className="btn-book">
                      Pay for extra days {this.state.chosen_order.extra_amount.toFixed(2)}
                    </button>
                    ) : (
                      <button type="submit"
                              className="btn-book"
                              onMouseEnter={async (event) => {
                                // event.preventDefault();
                                console.log('event', event)
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