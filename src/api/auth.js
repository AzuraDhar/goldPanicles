// api/auth.js (or utils/auth.js)
// Authentication helper functions

// Store user data
export const storeUserData = (userData) => {
  try {
    // Store full user object in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Store sensitive data in sessionStorage
    sessionStorage.setItem("userId", userData.id || userData.staff_id || userData.user_id);
    sessionStorage.setItem("userRole", userData.role);
    sessionStorage.setItem("userEmail", userData.email);
    sessionStorage.setItem("userName", userData.full_name || userData.firstName + " " + userData.lastName);
    
    return true;
  } catch (error) {
    console.error("Error storing user data:", error);
    return false;
  }
};

// Get user data
export const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Get user ID from sessionStorage (more secure)
export const getUserId = () => {
  return sessionStorage.getItem("userId");
};

// Get user role
export const getUserRole = () => {
  return sessionStorage.getItem("userRole") || (getUserData()?.role);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const userId = getUserId();
  const userRole = getUserRole();
  return !!(userId && userRole);
};

// Logout function
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem("user");
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Redirect to login
  window.location.href = "/login";
};

// Check specific role
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};