import React, { useState, useEffect } from "react";
import { supabase } from "../../../../api/supabase";

import AssignmentInvitation from "./subpage/AssignmentInvitation";
import StaffPendingAssignment from "./subpage/StaffPendingAssignment";

import "./StaffAssignmentManagement.css";


function MyCoverage(){

    const [activeTab, setActiveTab] = useState('all');

    const renderContent = () => {
        switch(activeTab) {
            case 'invitation':
                return <AssignmentInvitation />;
            case 'pending':
                return <StaffPendingAssignment />;
            default:
                return <StaffPendingAssignment />;
        }
    }

    return(
        <>

            <div className="staff_mainbody">

                    <div className="staff_header">

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Pending Assignment</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-3 ${activeTab === 'invitation' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invitation')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Assignments Invitation</span>
                        </span>

                        
                    </div>

                    

                    <div className="staff_body">

                        {renderContent()}

                    </div>

            </div>
        </>
    )
}

export default MyCoverage;