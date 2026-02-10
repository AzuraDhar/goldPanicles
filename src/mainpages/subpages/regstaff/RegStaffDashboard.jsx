import React, { useState, useEffect } from "react";
import { getUserData, logout } from "../../../api/auth"; // Import getUserData

import StaffMyCoverage from "./pages/StaffMyCoverage";
import StaffCalendar from "./pages/StaffCalendar";
import RegStaffSchedule from "./pages/RegStaffSchedule";

import logo from '../../../assets/image/tgp.png';

import './RegStaffDashboard.css';

function RegStaffDashboard() {
    const [activeTab, setActiveTab] = useState('myteam');
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
        if (!userData) return { firstInitial: "R", secondInitial: "S" };
        
        // Try to extract names from different possible fields
        const fullName = userData.full_name || "";
        const firstName = userData.firstName || userData.first_name || "";
        const lastName = userData.lastName || userData.last_name || "";
        const name = userData.name || "";
        
        let firstInitial = "";
        let secondInitial = "";
        
        // Priority 1: If full_name exists (e.g., "John Doe")
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
        // Priority 2: If firstName and lastName exist separately
        else if (firstName || lastName) {
            firstInitial = firstName.charAt(0).toUpperCase();
            secondInitial = lastName.charAt(0).toUpperCase();
        }
        // Priority 3: If name field exists
        else if (name.trim()) {
            const nameParts = name.trim().split(" ");
            if (nameParts.length >= 2) {
                firstInitial = nameParts[0].charAt(0).toUpperCase();
                secondInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            } else if (nameParts.length === 1) {
                firstInitial = nameParts[0].charAt(0).toUpperCase();
                secondInitial = nameParts[0].length > 1 ? nameParts[0].charAt(1).toUpperCase() : "";
            }
        }
        // Priority 4: Fallback to email
        else if (userData.email) {
            const emailPrefix = userData.email.split('@')[0];
            // Remove any numbers from email prefix for better initials
            const cleanPrefix = emailPrefix.replace(/[0-9]/g, '');
            if (cleanPrefix.length >= 2) {
                firstInitial = cleanPrefix.charAt(0).toUpperCase();
                secondInitial = cleanPrefix.charAt(1).toUpperCase();
            } else if (cleanPrefix.length === 1) {
                firstInitial = cleanPrefix.charAt(0).toUpperCase();
                secondInitial = cleanPrefix.charAt(0).toUpperCase(); // Use same letter twice
            } else {
                // If email is just numbers, use first two characters
                firstInitial = emailPrefix.charAt(0).toUpperCase();
                secondInitial = emailPrefix.length > 1 ? emailPrefix.charAt(1).toUpperCase() : emailPrefix.charAt(0).toUpperCase();
            }
        } 
        // Priority 5: Fallback to user_id or staff_id
        else if (userData.user_id || userData.staff_id || userData.id) {
            const id = (userData.user_id || userData.staff_id || userData.id).toString();
            firstInitial = id.charAt(0).toUpperCase();
            secondInitial = id.length > 1 ? id.charAt(1).toUpperCase() : id.charAt(0).toUpperCase();
        }
        
        // Ensure we always have at least "RS" as fallback
        if (!firstInitial) firstInitial = "R";
        if (!secondInitial) secondInitial = "S";
        
        return { firstInitial, secondInitial };
    };

    // Get initials
    const { firstInitial, secondInitial } = getUserInitials();

    const renderContent = () => {
        switch(activeTab) {
            case 'myteam':
                return <StaffMyCoverage />;
            case 'mycoverage':
                return <StaffCalendar />;
            case 'mycalendar':
                return <RegStaffSchedule />;
            default:
                return <StaffMyCoverage />;
        }
    }

    return(
        <div className="staffMain_Body">
            <div className="staff_columnOne">
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

                <div className="staffMenu">
                    <div className="staffOptions">
                        <span 
                            className={`options mt-4 ${activeTab === 'myteam' ? 'active' : ''}`}
                            onClick={() => setActiveTab('myteam')}
                            style={{cursor: 'pointer'}}
                        >
                            <span>My Coverage</span>
                        </span>

                        <span 
                            className={`options mt-2 ${activeTab === 'mycoverage' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mycoverage')}
                            style={{cursor: 'pointer'}}
                        >
                            <span>My Calendar</span>
                        </span>

                        <span 
                            className={`options mt-2 ${activeTab === 'mycalendar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mycalendar')}
                            style={{cursor: 'pointer'}}
                        >
                            <span>My Schedule</span>
                        </span>
                    </div>
                </div>

                <div className="staffUserProfile">
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
            
            {/* Profile Settings Panel */}
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

                        {/* Profile Tab - Updated with actual user data */}
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
                                        <span>
                                            {userData?.full_name || 
                                             userData?.name || 
                                             `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 
                                             userData?.email?.split('@')[0] || 
                                             "Regular Staff"}
                                        </span>
                                    </div>
                                    <button className="mt-2 save_user">Save</button>
                                </div>
                            </div>
                        )}

                        {/* Password Tab - Fixed duplicate IDs */}
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
                                            <input type="password" className="form-control" id="regStaffOldPassword" placeholder="Old Password" />
                                            <label htmlFor="regStaffOldPassword">Old Password</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input type="password" className="form-control" id="regStaffNewPassword" placeholder="New Password" />
                                            <label htmlFor="regStaffNewPassword">New Password</label>
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

            {/* User Menu Dropdown */}
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

            <div className="staff_columnTwo">
                {renderContent()}
            </div>
        </div>
    )
}

export default RegStaffDashboard;