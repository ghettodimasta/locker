import {getOrder, payOrder} from "../../services/api";
import React, {useEffect, useState} from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'
import moment from "moment";

export const OrderDetails = (props: { chosen_order: any }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [order, setOrder] = useState(
    {
      "id": 0,
      "status": "",
      "is_payed": false,
      "is_payed_for_extra_days": false,
      "storage_poi": {
        "name": "",
        "address_clean": "",
      },
      "bags": 0,
      "check_in": "",
      "check_out": "",
      "expired_days": 0,
      "extra_amount": 0,
      "amount": "",
      "pin_code": "",

    }
  )

  function getData() {
    getOrder(props.chosen_order).then((response) => {
      if (response.status === 200) {
        setOrder(response.data)
        setIsLoaded(true)
      }
    })
  }

  useEffect(() => {
      setIsLoaded(false)
      getData();
    }, [props.chosen_order]
  );

  function needToPayForExtra() {
    return !(order.status === "created" ||
      order.status !== "checked_in" ||
      (order.is_payed &&
        (order.is_payed_for_extra_days || order.is_payed_for_extra_days == null)))
  }


  if (!isLoaded) {
    return (
      <div className="col-md-6 col-12">
        <div className="d-flex flex-wrap col-md-8 col-12 right-panel">
          <h4 className="detail-id text-uppercase">
            <Skeleton width="6rem"/>
          </h4>
          <div className="w-100 order-details">
            <div className="d-flex justify-content-between info-text">
              <Skeleton count={9} width="6rem"/>
              <Skeleton count={9} width="6rem"/>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="col-md-6 col-12">
        <div className="d-flex flex-wrap col-md-8 col-12 right-panel">
          <h4 className="detail-id text-uppercase">Order: {order.id}</h4>
          <div className="w-100 order-details">
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Status</p>
              <p>{order.status}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Storage</p>
              <p>{order.storage_poi.name}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Address</p>
              <p className="address-info">{order.storage_poi.address_clean}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Bags</p>
              <p>{order.bags}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Check-in</p>
              <p>{moment(order.check_in).format("DD/MM/YY HH:mm")}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Check-out</p>
              <p>{moment(order.check_out).format("DD/MM/YY HH:mm")}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Expired Days</p>
              <p>{order.expired_days}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <p className="text-lowercase detail-text">Total Days (Booked + Expired)</p>
              <p>{moment(order.check_out).diff(
                moment(order.check_in
                ), 'days') + 1 + order.expired_days}</p>
            </div>
            <div className="d-flex justify-content-between info-text">
              <h6 className="text-lowercase"><strong>Extra Amount</strong></h6>
              <h6><strong>{order.extra_amount.toFixed(2)}</strong></h6>
            </div>
            <div className="d-flex justify-content-between info-text">
              <h5 className="text-lowercase"><strong>Total Price</strong></h5>
              <h5>
                <strong>{(parseFloat(order.amount.replace(/,/g, '')) + order.extra_amount).toFixed(2)}</strong>
              </h5>
            </div>
          </div>
          {needToPayForExtra() ? (
            <button type="submit"
                    onClick={async (event) => {
                      event.preventDefault();
                      setIsLoaded(false)
                      const response = await payOrder(order.id)
                      if (response.status === 200) {
                        setIsLoaded(false)
                      } else {
                        setIsLoaded(false)
                      }
                    }}
                    className="btn-book extra">
              Pay for extra days {order.extra_amount.toFixed(2)}
            </button>
          ) : (
            <button type="submit"
                    className="btn-book extra"
                    onMouseEnter={async (event) => {
                      // event.preventDefault();
                      event.currentTarget.innerHTML = order.pin_code
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
    )
  }
}