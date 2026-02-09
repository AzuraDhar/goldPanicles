import React, { useState } from "react";

import StaffMyCoverage from "./pages/StaffMyCoverage";
import StaffCalendar from "./pages/StaffCalendar";
import RegStaffSchedule from "./pages/RegStaffSchedule";

import logo from '../../../assets/image/tgp.png';


import './RegStaffDashboard.css';


function RegStaffDashboard(){

    const [activeTab, setActiveTab] = useState('maindashboard');

    const renderContent = () => {
        switch(activeTab) {
            case 'myteam':
                return <StaffMyCoverage />;
            case 'mycoverage':
                return <StaffCalendar />;
            case 'mycalendar':
                return <RegStaffSchedule />;
            case 'staffsched':
                return <StaffMyCoverage />;
            case 'management':
                return <StaffMyCoverage />;
            case 'calendar':
                return <StaffMyCoverage />;
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
                                                                                <img src={logo} />
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

                    </div>

                </div>
                
                <div className="staff_columnTwo">

                    {renderContent()}
                    
                </div>

        </div>
    )
}

export default RegStaffDashboard;