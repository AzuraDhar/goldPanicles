import React, { useState, useEffect } from "react";
import { supabase } from "../../../../api/supabase";

import Invitation from "./subpage/Invitation";
import Assignment from "./subpage/Assignment";

import "./MyCoverage.css";


function MyCoverage(){

    const [activeTab, setActiveTab] = useState('all');

    const renderContent = () => {
        switch(activeTab) {
            case 'invitation':
                return <Invitation />;
            case 'assignment':
                return <Assignment />;
            default:
                return <Assignment/>;
        }
    }

    return(
        <>

            <div className="staff_mainbody">

                    <div className="staff_header">

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

export default MyCoverage;