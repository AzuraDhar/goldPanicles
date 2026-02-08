import React, { useState } from "react";

import MyTeam from "./pages/MyTeam";
import MyCoverage from "./pages/MyCoverage";
import MyCalendar from "./pages/MyCalendar";
import StaffSchedule from "./pages/StaffSchedule";
import StaffAssignmentManagement from "./pages/StaffAssignmentManagement";



import './StaffDashboard.css';


function StaffDashboard(){

    const [activeTab, setActiveTab] = useState('maindashboard');

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
            case 'calendar':
                return <MyTeam />;
            default:
                return <MyTeam />;
        }
    }

    return(
        <div className="staffMain_Body">

                <div className="staff_columnOne">

                    <div className="staffLogo">

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

                    <div className="staffUserProfile">

                    </div>

                </div>
                
                <div className="staff_columnTwo">

                    {renderContent()}
                    
                </div>

        </div>
    )
}

export default StaffDashboard;