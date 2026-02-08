// components/SessionGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData, getUserId } from "../api/auth";

const SessionGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session exists on mount
    const userId = getUserId();
    
    if (!userId) {
      // If session doesn't exist but localStorage does, restore session
      const userData = getUserData();
      if (userData) {
        try {
          // Restore session from localStorage
          sessionStorage.setItem("userId", userData.id || userData.staff_id);
          sessionStorage.setItem("userRole", userData.role);
          sessionStorage.setItem("userEmail", userData.email);
        } catch (error) {
          console.error("Error restoring session:", error);
          navigate("/login");
        }
      }
      // If no user data at all, stay on current page
      // (might be login page)
    }
  }, [navigate]);

  return children;
};

export default SessionGuard;