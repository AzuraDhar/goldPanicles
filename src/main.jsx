import React from 'react';
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import LogInPage from './mainpages/LogInPage';
import SignUpPage from './mainpages/SignUpPage';
import ClientDashboard from './mainpages/subpages/client/ClientDashboard';

const router = createBrowserRouter([

  {
    path: "/",
    element: <LogInPage/>,
  },
  {
    path: "/signup",
    element: <SignUpPage/>,
  },
  {
    path: "/client",
    element: <ClientDashboard/>,
  },
 
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);