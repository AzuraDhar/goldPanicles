import React, { useState } from "react";
import { logout } from "../../../api/auth"; // Adjust the path based on your file structure

import AdminMainDashboard from "./pages/AdminMainDashboard";
import AssignmentManagement from "./pages/AssignmentManagement";
import RequestManagement from "./pages/RequestManagement";
import StaffAccount from "./pages/StaffAccount";
import MySched from "./pages/MySched";
import AdminCalendar from "./pages/AdminCalendar";

import logo from '../../../assets/image/tgp.png';

import './AdminDashboard.css';


function AdminDashboard(){

    const [activeTab, setActiveTab] = useState('maindashboard');
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
    }

    return(
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
                                    <span>Dashboard</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'request' ? 'active' : ''}`}
                                onClick={() => setActiveTab('request')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Request Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'assignment' ? 'active' : ''}`}
                                onClick={() => setActiveTab('assignment')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Assignment Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'calendar' ? 'active' : ''}`}
                                onClick={() => setActiveTab('calendar')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Calendar Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'staff' ? 'active' : ''}`}
                                onClick={() => setActiveTab('staff')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Staffers Account Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'sched' ? 'active' : ''}`}
                                onClick={() => setActiveTab('sched')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>My Schedule</span>
                            </span>

                        </div>

                    </div>

                    <div className="adminUserProfile">

                        <span className="user_profile" onClick={handleMenu}>
                                <span className="initials">
                                    <p className="mt-3">D</p><p className="mt-3">E</p>
                                </span>

                                <span className="user_acc">
                                    <p className="mt-3 ms-2">User Profile</p>
                                </span>
                        </span>

                    </div>

                </div>
                
                {showProfile&&(
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

                {showMenu&&(
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
    )
}

export default AdminDashboard;