import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './PendingRequest.css';

function PendingRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch data from Supabase
    const getRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('clientFormrequest') // Replace with your actual table name
                .select('*')
                .order('created_at', { ascending: false }); // Optional: sort by creation date
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error("Error fetching requests:", error);
            throw error;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getRequests();
            setRequests(data);
            setError(null);
        } catch (error) {
            console.error("Error loading requests:", error);
            setError("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    // If you want to filter only pending requests, you can modify getRequests:
    const getPendingRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'pending') // Filter by status = 'pending'
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error("Error fetching pending requests:", error);
            throw error;
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
            <div className="pending_header">
                <span className="col-7 col-sm-6 col-md-8">
                    <p className="mt-3 ms-1">Title</p>
                </span>

                <span className="col-5 col-sm-6 col-md-4"> 
                    <p className="mt-3">Date Requested</p>
                </span>
            </div>

            <div className="pending_body">
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <p>No pending requests found.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="row">
                            <span className="col-7 col-sm-6 col-md-8">
                                <p className="mt-2 ms-3">{request.eventTitle}</p>
                            </span>
                            <span className="col-5 col-sm-6 col-md-4">
                                <p className="mt-2 ms-1">
                                    {request.date}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default PendingRequest;