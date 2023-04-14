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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'


let router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/storages" element={<Storage/>}/>
      <Route path="/storages/:id" element={<StorageDetail/>}/>
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
