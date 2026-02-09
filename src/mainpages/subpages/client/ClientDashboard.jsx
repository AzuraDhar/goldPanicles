import React, { useState } from "react";

import './ClientDashboard.css';
import ClientCalendar from './pages/ClientCalendar.jsx';
import ClientRequest from './pages/ClientRequest.jsx';

import logo from '../../../assets/image/tgp.png';

function ClientDashboard(){

    const [activeTab, setActiveTab] = useState('calendar');

    const renderContent = () => {
        switch(activeTab) {
            case 'calendar':
                return <ClientCalendar />;
            case 'request':
                return <ClientRequest />;
            default:
                return <ClientCalendar />;
        }
    }

    return(
        <>
        <div className="clienMainBody">

            <div className="clientColumnOne">

                        <div className="clientLogo">

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

                        <div className="clientMenu">

                                <div className="clientOptions">

                                        <span 
                                            className={`options mt-4 ${activeTab === 'calendar' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('calendar')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <span>Calendar</span>
                                        </span>

                                        <span 
                                            className={`options ${activeTab === 'request' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('request')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            Request
                                        </span>

                                </div>

                        </div>

                        <div className="clientProfile">

                        </div>

            </div>

            <div className="clientColumnTwo">

                {renderContent()}

            </div>

        </div>
        </>
    )
}

export default ClientDashboard;