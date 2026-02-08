import React from 'react';
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import LogInPage from './mainpages/LogInPage';
import SignUpPage from './mainpages/SignUpPage';
import ClientDashboard from './mainpages/subpages/client/ClientDashboard';
import AdminDashboard from './mainpages/subpages/admin/AdminDashboard';
import StaffDashboard from './mainpages/subpages/staff/StasffDashboard';
import RegStaffDashboard from './mainpages/subpages/regstaff/RegStaffDashboard.jsx';
import ProtectedRoute from './mainpages/ProtectedRoute';
import SessionGuard from './mainpages/SessionGuard';

// main.jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LogInPage/>,
  },
  {
    path: "/signup",
    element: <SignUpPage/>,
  },
  {
    path: "/client",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <SessionGuard>
          <ClientDashboard/>
        </SessionGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["Administrator"]}>
        <SessionGuard>
          <AdminDashboard/>
        </SessionGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRoles={["Section Head"]}>
        <SessionGuard>
          <StaffDashboard/>
        </SessionGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reg",
    element: (
      <ProtectedRoute allowedRoles={["Staff"]}>
        <SessionGuard>
          <RegStaffDashboard/>
        </SessionGuard>
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);