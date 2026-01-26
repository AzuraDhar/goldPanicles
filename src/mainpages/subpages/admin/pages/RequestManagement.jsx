import React, { useState } from "react";
import PendingRequest from "./subpages/PendingRequest";
import ApprovedRequest from "./subpages/ApprovedRequest";
import DeniedRequest from "./subpages/DeniedRequest";

import './RequestManagement.css';

function RequestManagement(){

    const [activeTab, setActiveTab] = useState('pending');

    const renderContent = () => {
        switch(activeTab) {
            case 'pending':
                return <PendingRequest />;
            case 'approved':
                return <ApprovedRequest />;
            case 'denied':
                return <DeniedRequest />;
            default:
                return <PendingRequest />;
        }
    }

    return(
        <>
            <div className="requestBody">

                <div className="adminRequestTitle">

                    <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Pending Request</span>
                    </span>

                    <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'approved' ? 'active' : ''}`}
                                onClick={() => setActiveTab('approved')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Approved Request</span>
                    </span>

                    <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'denied' ? 'active' : ''}`}
                                onClick={() => setActiveTab('denied')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Denied Request</span>
                    </span>
                    
                </div>

                <div className="adminRequestBody">

                        {renderContent()}

                </div>
                    
            </div>
        </>
    )
}

export default RequestManagement;