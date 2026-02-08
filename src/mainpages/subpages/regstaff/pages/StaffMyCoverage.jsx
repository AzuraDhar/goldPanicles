import React, { useState, useEffect } from "react";

import StaffInvitation from "./subpage/StaffInvitation";
import StaffAssignment from "./subpage/StaffAssignment";

import "./StaffMyCoverage.css";


function StaffMyCoverage(){

    const [activeTab, setActiveTab] = useState('all');

    const renderContent = () => {
        switch(activeTab) {
            case 'invitation':
                return <StaffInvitation />;
            case 'assignment':
                return <StaffAssignment />;
            default:
                return <StaffInvitation />;
        }
    }

    return(
        <>

            <div className="staff_mainbody">

                    <div className="staff_header">

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'invitation' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invitation')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Invitation</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-3 ${activeTab === 'assignment' ? 'active' : ''}`}
                                onClick={() => setActiveTab('assignment')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Assignment</span>
                        </span>

                        
                    </div>

                    

                    <div className="staff_body">

                        {renderContent()}

                    </div>

            </div>
        </>
    )
}

export default StaffMyCoverage;