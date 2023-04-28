import React from 'react';
import {
  Await,
  createBrowserRouter,
  createRoutesFromElements,
  defer,
  Form,
  Link,
  Outlet,
  Route,
  RouterProvider,
  Routes,
  useAsyncError,
  useAsyncValue,
  useFetcher,
  useFetchers,
  useLoaderData,
  useNavigation,
  useParams,
  useRevalidator,
  useRouteError,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css';
import HomePage from "./components/HomePage/HomePage";
import {Storage} from "./components/Storages/Storages";
import {StorageDetail} from "./components/StorageDetail/StorageDetail";
import {MyOrder} from "./components/MyOrders/MyOrders";
import {Register} from "./components/Register/Register";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Activate from "./components/Activate/Activate";
import {PageNotFound} from "./components/PageNotFound/PageNotFound";
import {Main} from "./components/Main/Main";


let router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Main step="home"/>}/>
      <Route path="/storages" element={<Storage/>}/>
      <Route path="/storages/:id" element={<StorageDetail/>}/>
      <Route path="/my-orders" element={<Main step="my_orders"/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/activate/:token" element={<Activate/>}/>
      <Route path="/about" element={<Main step="about"/>}/>
      <Route path="/not-found" element={<PageNotFound/>}/>
      <Route path="*" element={<PageNotFound/>}/>
    </Route>
  )
);


function App() {
  return (
    <>
      <RouterProvider router={router}/>
      <LocalizationProvider dateAdapter={AdapterDayjs}/>
    </>
  )
}


export default App;
