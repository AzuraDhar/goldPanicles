import React, { useState } from "react";
import { logout } from "../../../api/auth"; // Adjust the path based on your file structure

import MyTeam from "./pages/MyTeam";
import MyCoverage from "./pages/MyCoverage";
import MyCalendar from "./pages/MyCalendar";
import StaffSchedule from "./pages/StaffSchedule";
import StaffAssignmentManagement from "./pages/StaffAssignmentManagement";

import logo from '../../../assets/image/tgp.png';

import './StaffDashboard.css';


function StaffDashboard(){

    const [activeTab, setActiveTab] = useState('myteam');
    const [activeProfileTab, setActiveProfileTab] = useState('profile'); // New state for profile tabs
    
    const[showProfile, setShowProfile] = useState(false);
    const[showMenu, setShowMenu] = useState(false);

    const handleClick = () =>{
        setShowProfile(!showProfile);
        setActiveProfileTab('profile'); // Reset to profile tab when opening
    };

    const handleMenu = () =>{
        setShowMenu(!showMenu);
    };

    const handleProfileTabClick = (tab) => {
        setActiveProfileTab(tab);
    };

    // Add logout handler
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout(); // This will clear storage and redirect to login
        }
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'myteam':
                return <MyTeam />;
            case 'mycoverage':
                return <MyCoverage />;
            case 'mycalendar':
                return <MyCalendar />;
            case 'staffsched':
                return <StaffSchedule />;
            case 'management':
                return <StaffAssignmentManagement />;
            default:
                return <MyTeam />;
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
                                    <span>My Team</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'mycoverage' ? 'active' : ''}`}
                                onClick={() => setActiveTab('mycoverage')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>My Coverage</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'mycalendar' ? 'active' : ''}`}
                                onClick={() => setActiveTab('mycalendar')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>My Calendar</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'staffsched' ? 'active' : ''}`}
                                onClick={() => setActiveTab('staffsched')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>My Schedule</span>
                            </span>

                            
                            <span 
                                className={`options mt-2 ${activeTab === 'management' ? 'active' : ''}`}
                                onClick={() => setActiveTab('management')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Assignment Management</span>
                            </span>
                        </div>

                    </div>

                    {/* Add User Profile Section */}
                    <div className="staffUserProfile">
                        <span className="user_profile" onClick={handleMenu}>
                            <span className="initials">
                                <p className="mt-3">S</p><p className="mt-3">T</p> {/* You can customize initials */}
                            </span>

                            <span className="user_acc">
                                <p className="mt-3 ms-2">User Profile</p>
                            </span>
                        </span>
                    </div>

                </div>
                
                {/* Add Profile Settings Panel */}
                {showProfile && (
                    <div className="user_Acc">

                        <div className="userprofile_container">
                                <div className="user_col1">
                                        <div className="userprofile_img mt-1">

                                        </div>

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

                                {/* Profile Tab */}
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
                                                    UserName 
                                                </span>
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
                                                <div className="user_imglogo mb-3 me-3">
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user_row profile">
                                            <div className="userName">
                                                <span>
                                                    Password Settings 
                                                </span>
                                            </div>

                                            <span>Change Password</span>

                                            <div className="password_choice mt-3">
                                                    <div className="form-floating mb-3">
                                                        <input type="password" className="form-control" id="floatingInput" placeholder="name@example.com" />
                                                        <label htmlFor="floatingInput">Old Password</label>
                                                    </div>

                                                     <div className="form-floating mb-3">
                                                        <input type="password" className="form-control" id="floatingInput" placeholder="name@example.com" />
                                                        <label htmlFor="floatingInput">New Password</label>
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
                                                <div className="user_imglogo mb-3 me-3">
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user_row profile">
                                            <div className="userName">
                                                <span>
                                                    Delete Account 
                                                </span>
                                            </div>
                                            <button className="mt-2 delete_user">Delete</button>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                {/* Add User Menu Dropdown */}
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

export default StaffDashboard;