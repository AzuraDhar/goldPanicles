// mainpages/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../api/auth"; // or "../utils/auth"

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Check if user is authenticated using the utility function
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const userRole = getUserRole();
    
    console.log("ProtectedRoute - User role:", userRole);
    console.log("ProtectedRoute - Allowed roles:", allowedRoles);
    
    // Check if user has one of the allowed roles
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // User doesn't have required role - redirect based on their actual role
      console.log("Access denied. Redirecting...");
      
      switch (userRole) {
        case "Administrator":
          return <Navigate to="/admin" replace />;
        case "Section Head":
          return <Navigate to="/reg" replace />;
        case "Staff":
          return <Navigate to="/staff" replace />;
        case "client":
          return <Navigate to="/client" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
    
    // All checks passed
    console.log("Access granted");
    return children;
  } catch (error) {
    console.error("ProtectedRoute error:", error);
    // Clear all storage on error
    localStorage.removeItem("user");
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;