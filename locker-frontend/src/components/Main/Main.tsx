import {render} from "@testing-library/react";
import Navbar from "../NavBar/NavBar";
import HomePage from "../HomePage/HomePage";
import {MyOrder} from "../MyOrders/MyOrders";
import {About} from "../About/About";


export const Main = (props: {step: string}) => {

  function getPage() {
    if (props.step === 'home')
      return <HomePage/>

    if (props.step === 'my_orders')
      return <MyOrder/>

    if (props.step === 'about')
      return <About/>
  }

  return (
    <>
      <Navbar/>
      {getPage()}
    </>
  )
}