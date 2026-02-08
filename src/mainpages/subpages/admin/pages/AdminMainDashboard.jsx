import React, { useState } from "react";

import './AdminMainDashboard.css';

function AdminMainDashboard(){

    return(
        <>
            <div className="dash_mainContainer">
                <div className="header">
                        <span className="ms-2">Dashboard</span>
                </div>

                <div className="task_status">
                        <div className="card_list">
                                <span className="card_header">Total no. of request</span>
                                <span className="card_body">50</span>
                        </div>
                        <div className="card_list">
                                <span className="card_header">Total no. of approved request</span>
                                <span className="card_body">50</span>
                        </div>
                        <div className="card_list">
                                <span className="card_header">Total no. of denied request</span>
                                <span className="card_body">50</span>
                        </div>
                        <div className="card_list">
                                <span className="card_header">Total no. of completed task</span>
                                <span className="card_body">50</span>
                        </div>
                </div>

                <div className="tasklist">

                    <div className="tasklist_header">
                        <p className="ms-3 mt-2">Task distribution</p>
                    </div>

                    <div className="tasklist_rowHead">
                        <span>
                                <p className="ms-3 mt-3">Staffer</p>
                        </span>
                        <span className="cleared_task">
                                <p className="mt-3">No. of task cleared</p>
                        </span>
                    </div>

                    <div className="tasklist_listbody">
                        <div className="list_container">
                            <span>
                                    <p className="ms-3 mt-2">Christian Sumalinog</p>
                            </span>

                            <span className="no_task">
                                   <p className="me-5 mt-2">5</p>
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default AdminMainDashboard;