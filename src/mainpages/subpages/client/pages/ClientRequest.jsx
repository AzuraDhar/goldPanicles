import React, { useState, useEffect } from "react";
import { getRequests } from "../../../../api/requestlist";

import './ClientRequest.css';

function ClientRequest(){

        const [requests, setRequests] = useState([]);
        const [showForm, setShowForm] = useState(false);

            useEffect(() => {
                loadData();
        }, []);

        const loadData = async () => {
            try {
                const data = await getRequests();
                setRequests(data);
            } catch (error) {
                console.error("Error loading requests:", error);
            }
        };

         const handleRowClick = (request) => {
            console.log("Row clicked:", request);

            setShowForm(true);
        };

        const closeForm = () => {
            setShowForm(false);
        };


    return(
        <>

                <div className="clientRequestDisplay">

                            <div className="clientDisplayTitle">
                                <p className="mt-1">Request Tracker</p>
                            </div>

                            <div className="clientDisplayBody">

                                <div className="clientDisplayHeader row">
                                        <span className="col-6 col-sm-5 col-md-6">
                                                <p className="mt-2">Title</p>
                                        </span>

                                        <span className="col-3 col-sm-3 col-md-3">
                                                <p className="mt-2">Date Requested</p>
                                        </span>

                                        <span className="col-3 col-sm-4 col-md-3">
                                                <p className="mt-2">Status</p>
                                        </span>
                                </div>

                                <div className="clientDisplayRequests">

                                    <div className="clientRequestList">
                                        {requests.map((request) => (
                                            <div key={request.id} className="row" onClick={() => handleRowClick(request)}>
                                                <span className="col-6 col-sm-5 col-md-6">
                                                    <p className="mt-2 ms-2">{request.description}</p>
                                                </span>
                                                <span className="col-3 col-sm-3 col-md-3">
                                                    <p className="mt-2 ms-1">
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </p>
                                                </span>
                                                <span className="col-3 col-sm-4 col-md-3">
                                                    <p className="mt-2">{request.status}</p>
                                                </span>
                                            </div>
                                        ))}

                                    </div>

                                    {showForm && (
                                            <div className="clientOptions1">

                                                <div className="form-header">
            <button 
              onClick={closeForm}
              className="close-btn position-absolute top-0 end-0 mt-1 me-1 bg-danger bg-opacity-75"
            >
              ×
            </button>
          </div>

                                            </div>
                                        )}


                                </div>

                            </div>


                </div>

        </>
    )
}

export default ClientRequest;