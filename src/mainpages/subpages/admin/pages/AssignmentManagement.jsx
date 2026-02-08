import React, { useState } from "react";
import PendingAssignments from "./subpages/PendingAssignments";
import AssignedAssignments from "./subpages/AssignedAssignments";

import './AssignmentManagement.css';

function AssignmentManagement(){

    const [activeTab, setActiveTab] = useState('pending');

    const renderContent = () => {
        switch(activeTab) {
            case 'pending':
                return <PendingAssignments />;
            case 'assigned':
                return <AssignedAssignments />;
            default:
                return <PendingAssignments />;
        }
    }

    return(
        <>
            <div className="assignmentBody">

                <div className="adminAssignmentTitle">

                    <span 
                        className={`assignment_tab mt-4 ms-1 ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                        style={{cursor: 'pointer'}}
                    >
                        <span>Pending Assignments</span>
                    </span>

                    <span 
                        className={`assignment_tab mt-4 ms-1 ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assigned')}
                        style={{cursor: 'pointer'}}
                    >
                        <span>Assignments Preview</span>
                    </span>
                    
                </div>

                <div className="adminAssignmentBody">
                    {renderContent()}
                </div>
                    
            </div>
        </>
    )
}

export default AssignmentManagement;