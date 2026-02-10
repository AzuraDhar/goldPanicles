import React, { useState, useEffect } from "react";
import { getUserData, logout } from "../../../api/auth"; // Import getUserData

import AdminMainDashboard from "./pages/AdminMainDashboard";
import AssignmentManagement from "./pages/AssignmentManagement";
import RequestManagement from "./pages/RequestManagement";
import StaffAccount from "./pages/StaffAccount";
import MySched from "./pages/MySched";
import AdminCalendar from "./pages/AdminCalendar";

import logo from "../../../assets/image/tgp.png";
import "./AdminDashboard.css";

// ✅ MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";

function AdminDashboard() {
  // State declarations
  const [activeTab, setActiveTab] = useState('maindashboard');
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Fetch user data on component mount
  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleClick = () => {
    setShowProfile(!showProfile);
    setActiveProfileTab('profile');
  };

  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleProfileTabClick = (tab) => {
    setActiveProfileTab(tab);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  // Function to get user initials
  const getUserInitials = () => {
    if (!userData) return { firstInitial: "D", secondInitial: "E" };
    
    // Try to extract names from different possible fields
    const fullName = userData.full_name || "";
    const firstName = userData.firstName || userData.first_name || "";
    const lastName = userData.lastName || userData.last_name || "";
    
    let firstInitial = "";
    let secondInitial = "";
    
    // Option 1: If full_name exists (e.g., "John Doe")
    if (fullName.trim()) {
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        firstInitial = nameParts[0].charAt(0).toUpperCase();
        secondInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      } else if (nameParts.length === 1) {
        firstInitial = nameParts[0].charAt(0).toUpperCase();
        secondInitial = nameParts[0].length > 1 ? nameParts[0].charAt(1).toUpperCase() : "";
      }
    }
    // Option 2: If firstName and lastName exist separately
    else if (firstName || lastName) {
      firstInitial = firstName.charAt(0).toUpperCase();
      secondInitial = lastName.charAt(0).toUpperCase();
    }
    // Option 3: Fallback to email or username
    else if (userData.email) {
      const emailPrefix = userData.email.split('@')[0];
      firstInitial = emailPrefix.charAt(0).toUpperCase();
      secondInitial = emailPrefix.length > 1 ? emailPrefix.charAt(1).toUpperCase() : "";
    } 
    // Option 4: Fallback to user_id or staff_id
    else if (userData.user_id || userData.staff_id || userData.id) {
      const id = (userData.user_id || userData.staff_id || userData.id).toString();
      firstInitial = id.charAt(0).toUpperCase();
      secondInitial = id.length > 1 ? id.charAt(1).toUpperCase() : "";
    }
    
    // Ensure we always have at least "DE" as fallback
    if (!firstInitial) firstInitial = "D";
    if (!secondInitial) secondInitial = "E";
    
    return { firstInitial, secondInitial };
  };

  // Get initials
  const { firstInitial, secondInitial } = getUserInitials();

  const renderContent = () => {
    switch(activeTab) {
      case 'maindashboard':
        return <AdminMainDashboard />;
      case 'assignment':
        return <AssignmentManagement />;
      case 'request':
        return <RequestManagement />;
      case 'staff':
        return <StaffAccount />;
      case 'sched':
        return <MySched />;
      case 'calendar':
        return <AdminCalendar />;
      default:
        return <AdminMainDashboard />;
    }
  };

  return (
    <div className="adminMain_Body">
      <div className="admin_columnOne">
        <div className="staffLogo">
          <span className="tgp_logo">
            <span className="img_logo">
              <img src={logo} alt="TGP Logo" />
            </span>
          </span>
          <span className="tgp_title">
            <span className="tgp_name">
              <p className="mt-4">THE GOLD PANICLES</p>
            </span>
          </span>
        </div>

        <div className="adminMenu">
          <div className="adminOptions">
            <span
              className={`options mt-4 ${activeTab === 'maindashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('maindashboard')}
              style={{cursor: 'pointer'}}
            >
              <DashboardIcon sx={{ fontSize: 24, marginRight: 2 }} />
              Dashboard
            </span>

            <span
              className={`options mt-2 ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
              style={{cursor: 'pointer'}}
            >
              <RequestPageIcon sx={{ fontSize: 22, marginRight: 2 }} />
              Request Management
            </span>

            <span
              className={`options mt-2 ${activeTab === 'assignment' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignment')}
              style={{cursor: 'pointer'}}
            >
              <AssignmentIcon sx={{ fontSize: 24, marginRight: 2 }} />
              Assignment Management
            </span>

            <span
              className={`options mt-2 ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
              style={{cursor: 'pointer'}}
            >
              <CalendarMonthIcon sx={{ fontSize: 24, marginRight: 2 }} />
              Calendar Management
            </span>

            <span
              className={`options mt-2 ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
              style={{cursor: 'pointer'}}
            >
              <PeopleAltIcon sx={{ fontSize: 24, marginRight: 2 }} />
              Staffers Account Management
            </span>

            <span
              className={`options mt-2 ${activeTab === 'sched' ? 'active' : ''}`}
              onClick={() => setActiveTab('sched')}
              style={{cursor: 'pointer'}}
            >
              <ScheduleIcon sx={{ fontSize: 24, marginRight: 2 }} />
              My Schedule
            </span>
          </div>
        </div>

        <div className="adminUserProfile">
          <span className="user_profile" onClick={handleMenu}>
            <span className="initials">
              <p className="mt-3">{firstInitial}</p>
              <p className="mt-3">{secondInitial}</p>
            </span>
            <span className="user_acc">
              <p className="mt-3 ms-2">User Profile</p>
            </span>
          </span>
        </div>
      </div>

      {/* ... rest of your JSX remains the same ... */}
      {showProfile && (
        <div className="user_Acc">
          <div className="userprofile_container">
            <div className="user_col1">
              <div className="userprofile_img mt-1"></div>

              <div className="userinfo mt-1">
                <div className="userinfo_container">
                  <span
                    className={`mt-3 ${activeProfileTab === 'profile' ? 'active-profile-tab' : ''}`}
                    onClick={() => handleProfileTabClick('profile')}
                    style={{cursor: 'pointer'}}
                  >
                    Profile
                  </span>

                  <span
                    className={`${activeProfileTab === 'password' ? 'active-profile-tab' : ''}`}
                    onClick={() => handleProfileTabClick('password')}
                    style={{cursor: 'pointer'}}
                  >
                    Password
                  </span>

                  <span
                    className={`${activeProfileTab === 'delete' ? 'active-profile-tab' : ''}`}
                    onClick={() => handleProfileTabClick('delete')}
                    style={{cursor: 'pointer'}}
                  >
                    Delete Account
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Tab - You can now display actual user data here */}
            {activeProfileTab === 'profile' && (
              <div className="user_col2_one">
                <div className="user_row">
                  <div className="user_imgprofile">
                    <div className="user_imglogo mb-3 me-3">
                      <img src={logo} alt="Profile Logo" />
                    </div>
                  </div>
                </div>

                <div className="user_row profile">
                  <div className="userName">
                    {/* Display actual user name */}
                    <span>{userData?.full_name || userData?.firstName || "User Name"}</span>
                  </div>
                  <button className="mt-2 save_user">Save</button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeProfileTab === 'password' && (
              <div className="user_col2_two">
                <div className="user_row">
                  <div className="user_imgprofile">
                    <div className="user_imglogo mb-3 me-3"></div>
                  </div>
                </div>

                <div className="user_row profile">
                  <div className="userName">
                    <span>Password Settings</span>
                  </div>

                  <span>Change Password</span>

                  <div className="password_choice mt-3">
                    <div className="form-floating mb-3">
                      <input type="password" className="form-control" id="oldPassword" placeholder="Old Password" />
                      <label htmlFor="oldPassword">Old Password</label>
                    </div>

                    <div className="form-floating mb-3">
                      <input type="password" className="form-control" id="newPassword" placeholder="New Password" />
                      <label htmlFor="newPassword">New Password</label>
                    </div>

                    <button className="">Save</button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeProfileTab === 'delete' && (
              <div className="user_col2_three">
                <div className="user_row">
                  <div className="user_imgprofile">
                    <div className="user_imglogo mb-3 me-3"></div>
                  </div>
                </div>

                <div className="user_row profile">
                  <div className="userName">
                    <span>Delete Account</span>
                  </div>
                  <button className="mt-2 delete_user">Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMenu && (
        <div className="showmenu ms-4">
          <div className="user_menu">
            <span onClick={handleClick} style={{cursor: 'pointer'}}>Profile Settings</span>
          </div>
          <div className="user_menu">
            <span onClick={handleLogout} style={{cursor: 'pointer'}}>Log Out</span>
          </div>
        </div>
      )}

      <div className="admin_columnTwo">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminDashboard;