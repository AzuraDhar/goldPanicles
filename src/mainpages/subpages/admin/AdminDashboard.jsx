import React, { useState } from "react";

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

    const[showProfile, setShowProfile] = useState(false);
    const[showMenu, setShowMenu] = useState(false);

    const handleClick = () =>{
        setShowProfile(!showProfile);
    };

    const handleMenu = () =>{
        setShowMenu(!showMenu);
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
                                        <img src={logo} />
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

                        <span className="user_profile" onClick={() => setShowMenu(true)}>
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
                                        <div className="userprofile_img">

                                        </div>

                                        <div className="userinfo">

                                        </div>
                                </div>

                                <div className="user_col2">

                                </div>
                        </div>
                    </div>
                )}

                {showMenu&&(
                    <div className="showmenu ms-4">
                        <div className="user_menu">
                            <span onClick={handleClick}>Profile Settings</span>
                        </div>
                        <div className="user_menu">
                            <span>Log Out</span>
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