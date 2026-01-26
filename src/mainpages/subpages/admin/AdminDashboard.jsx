import React, { useState } from "react";

import AdminMainDashboard from "./pages/AdminMainDashboard";
import AssignmentManagement from "./pages/AssignmentManagement";
import RequestManagement from "./pages/RequestManagement";
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
                                className={`options mt-2 ${activeTab === 'maindashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('maindashboard')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Calendar Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'maindashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('maindashboard')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Staffers Account Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'maindashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('maindashboard')}
                                style={{cursor: 'pointer'}}
                                >
                                    <span>Client's Account Management</span>
                            </span>

                            <span 
                                className={`options mt-2 ${activeTab === 'maindashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('maindashboard')}
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