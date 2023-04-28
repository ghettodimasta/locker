import React, {Component} from "react";
import Navbar from "../NavBar/NavBar";
import {getOrders, payOrder} from "../../services/api";
import "./MyOrders.css";
import moment from "moment";
import {Table} from "@mui/material";
import {OrderDetails} from "./OrderDetail";

type MyOrderState = {
  loader_active: boolean,
  order_list: any[],
  chosen_order: any
};

interface MyOrderProps {
}

export class MyOrder extends Component<MyOrderProps, MyOrderState> {
  constructor(props: MyOrderProps) {
    super(props);
    this.state = {
      loader_active: true,
      order_list: [],
      chosen_order: null
    }
  }

  async componentDidMount() {
    const response = await getOrders()
    if (response.status === 200) {
      await this.setState({
        order_list: response.data,
        chosen_order: response.data.length > 0 ? response.data[0].id : null,
        loader_active: false
      })
    } else {
      window.location.href = '/'
    }
  }


  render() {
    if (this.state.order_list.length !== 0) {
      return (
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
                      {this.state.order_list.map((order: any, index) => {
                        return (
                          <tr key={index} onClick={event => {
                            this.setState({
                              chosen_order: order.id
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
                <OrderDetails chosen_order={this.state.chosen_order}/>
              ) : null}
            </div>
          </div>
        </div>
      );
    } else {
      return !this.state.loader_active && (
        <div id="order-page" className="main">
          <div className="container pt-4">
            <h1 className="header-title text-uppercase">My Orders</h1>
            <div className="d-flex">
              <div className="col-md-8 col-12 left-panel">
                <h1>You don't have any orders yet</h1>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

}