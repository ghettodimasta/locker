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
// import SideBar from "./components/AdminPanel/SideBar/SideBar";
// import PageNotFound from "./components/PageNotFound/PageNotFound";
import HomePage from "./components/HomePage/HomePage";


let router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<HomePage/>}/>
    </Route>
  )
  // <Route path="/" element={<SideBar/>}>
  //     {/*<Route index loader={homeLoader} element={<Home />} />*/}
  //     <Route index element={<AdminPanel/>}/>
  //     {/*<Route path="about" element={<About />} />*/}
  //     {/*<Route path="dashboard" element={<Dashboard />} />*/}
  //     {/*<Route path="*" element={<NoMatch />} />*/}
  //   </Route>
);


function App() {
  return <RouterProvider router={router}/>;
}

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<AdminPanel/>}></Route>
//       {/*<Route path="*" element={<NoMatch />} />*/}
//     </Routes>
//   );
// }

export default App;
