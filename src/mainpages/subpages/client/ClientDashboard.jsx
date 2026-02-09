import React, { useState } from "react";
import { logout } from "../../../api/auth"; // Adjust the path based on your file structure

import './ClientDashboard.css';
import ClientCalendar from './pages/ClientCalendar.jsx';
import ClientRequest from './pages/ClientRequest.jsx';

import logo from '../../../assets/image/tgp.png';

function ClientDashboard(){

    const [activeTab, setActiveTab] = useState('calendar');
    const [activeProfileTab, setActiveProfileTab] = useState('profile');
    
    const[showProfile, setShowProfile] = useState(false);
    const[showMenu, setShowMenu] = useState(false);

    const handleClick = () =>{
        setShowProfile(!showProfile);
        setActiveProfileTab('profile');
    };

    const handleMenu = () =>{
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

    const renderContent = () => {
        switch(activeTab) {
            case 'calendar':
                return <ClientCalendar />;
            case 'request':
                return <ClientRequest />;
            default:
                return <ClientCalendar />;
        }
    }

    return(
        <>
        <div className="clienMainBody">

            <div className="clientColumnOne">

                <div className="clientLogo">

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

                <div className="clientMenu">

                    <div className="clientOptions">

                        <span 
                            className={`options mt-4 ${activeTab === 'calendar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calendar')}
                            style={{cursor: 'pointer'}}
                        >
                            <span>Calendar</span>
                        </span>

                        <span 
                            className={`options ${activeTab === 'request' ? 'active' : ''}`}
                            onClick={() => setActiveTab('request')}
                            style={{cursor: 'pointer'}}
                        >
                            Request
                        </span>

                    </div>

                </div>

                <div className="clientProfile">
                    <span className="user_profile" onClick={handleMenu}>
                        <span className="initials">
                            <p className="mt-3">C</p><p className="mt-3">L</p>
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
                                        <span>UserName</span>
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

            <div className="clientColumnTwo">
                {renderContent()}
            </div>

        </div>
        </>
    )
}

export default ClientDashboard;