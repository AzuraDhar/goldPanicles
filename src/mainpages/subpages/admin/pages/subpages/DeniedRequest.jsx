import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './DeniedRequest.css';

function DeniedRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch ONLY DENIED requests from Supabase
    const getDeniedRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'denied') // Filter by status = 'denied'
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error("Error fetching denied requests:", error);
            throw error;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            // Call getDeniedRequests instead of getRequests
            const data = await getDeniedRequests();
            setRequests(data);
            setError(null);
        } catch (error) {
            console.error("Error loading requests:", error);
            setError("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading requests...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <>
            <div className="denied_header">
                <span className="col-3">
                    <p className="mt-3 ms-1">Title</p>
                </span>

                 <span className="col-3">
                    <p className="mt-3 ms-1">Client</p>
                </span>

                <span className="col-3"> 
                    <p className="mt-3">Date Denied</p>
                </span>

                 <span className="col-3">
                    <p className="mt-3 ms-1">Denied By</p>
                </span>
            </div>

            <div className="denied_body">
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <p>No denied requests found.</p> {/* Changed message */}
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="row">
                            <span className="col-3">
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>

                            <span className="col-3">
                                {/* Assuming you have a 'clientName' or 'user_id' field */}
                                <p className="mt-2 ms-1">{request.description}</p>
                            </span>

                            <span className="col-3">
                                {/* Use updated_at if you have it, or created_at */}
                                <p className="mt-2 ms-1">
                                    {request.date}
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Assuming you have a 'reviewed_by' or similar field */}
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default DeniedRequest;