import React, { useState } from "react";

import AdminMainDashboard from "./pages/AdminMainDashboard";
import AssignmentManagement from "./pages/AssignmentManagement";
import RequestManagement from "./pages/RequestManagement";
import StaffAccount from "./pages/StaffAccount";
import MySched from "./pages/MySched";
import AdminCalendar from "./pages/AdminCalendar";

import './AdminDashboard.css';


function AdminDashboard(){

    const [activeTab, setActiveTab] = useState('maindashboard');

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

                    <div className="adminLogo">

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

                    </div>

                </div>
                
                <div className="admin_columnTwo">

                    {renderContent()}
                    
                </div>

        </div>
    )
}

export default AdminDashboard;