import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './ApprovedRequest.css';

function ApprovedRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch ONLY APPROVED requests from Supabase
    const getApprovedRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'approve') // Filter by status = 'approved'
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error("Error fetching approved requests:", error);
            throw error;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            // Call getApprovedRequests instead of getRequests
            const data = await getApprovedRequests();
            setRequests(data);
            setError(null);
        } catch (error) {
            console.error("Error loading requests:", error);
            setError("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    // Optional: Add refresh functionality
    const handleRefresh = () => {
        loadData();
    };

    if (loading) {
        return <div className="loading">Loading approved requests...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <>
            <div className="approved_header">
                <span className="col-3">
                    <p className="mt-3 ms-1">Title</p>
                </span>

                <span className="col-3">
                    <p className="mt-3 ms-1">Client</p>
                </span>

                <span className="col-3"> 
                    <p className="mt-3">Date Approved</p>
                </span>

                <span className="col-3">
                    <p className="mt-3 ms-1">Approved By</p>
                </span>
            </div>

            <div className="approved_body">
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <p>No approved requests found.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="row">
                            <span className="col-3">
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>

                            <span className="col-3">
                                {/* Use appropriate client field - adjust based on your schema */}
                                <p className="mt-2 ms-1">
                                    {request.eventTitle}
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Use updated_at for approval date if available */}
                                <p className="mt-2 ms-1">
                                    {request.date}
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Assuming you have a reviewed_by, approved_by, or admin field */}
                                <p className="mt-2 ms-1">
                                    {request.eventTitle}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>
            
        </>
    );
}

export default ApprovedRequest;