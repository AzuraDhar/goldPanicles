import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './Assignment.css';

function Assignment() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get current user's ID
            let userId = "";
            try {
                // Try from sessionStorage first (as in auth.js)
                userId = sessionStorage.getItem("userId");
                if (!userId) {
                    // Fallback to localStorage
                    const userData = JSON.parse(localStorage.getItem("user") || "{}");
                    userId = userData.id || userData.staff_id || userData.user_id;
                }
            } catch (e) {
                console.error("Error getting user ID:", e);
            }
            
            if (!userId) {
                setAccounts([]);
                setLoading(false);
                return;
            }
            
            console.log("Looking for assignments for user ID:", userId);
            
            // Fetch assignments with join
            const { data, error } = await supabase
                .from('stafftrackRecord')
                .select(`
                    record_id,
                    created_at,
                    date,
                    status,
                    request_id,
                    clientFormrequest (
                        eventTitle,
                        created_at
                    )
                `)
                .eq('head_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching assignments:", error);
                throw error;
            }
            
            console.log("Fetched assignments with join:", data);
            
            // Format data for display
            const formattedData = (data || []).map(assignment => {
                // Check if clientFormrequest exists and get eventTitle
                let eventTitle = "Untitled Assignment";
                let requestDate = assignment.created_at;
                
                if (assignment.clientFormrequest) {
                    // clientFormrequest is an object, not an array
                    const request = assignment.clientFormrequest;
                    eventTitle = request.eventTitle || eventTitle;
                    requestDate = request.created_at || requestDate;
                }
                
                return {
                    staff_id: assignment.record_id,
                    request_id: assignment.request_id,
                    firstName: eventTitle,
                    // Use date from stafftrackRecord or clientFormrequest
                    position: assignment.date || 
                             (requestDate ? 
                              new Date(requestDate).toLocaleDateString() : 
                              "No date"),
                    // Status from stafftrackRecord
                    status: assignment.status || "unknown"
                };
            });
            
            setAccounts(formattedData);
            
        } catch (err) {
            setError(err.message);
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading assignments...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <>
            <div className="row_header">
                <span className="ms-1 col-7">
                    <p className="mt-4 ms-2">Title</p>
                </span>
                <span className="ms-1 col-3">
                    <p className="mt-4">Date Approved</p>
                </span>
                <span className="mt-4 col-2">
                    <p>Status</p>
                </span>
            </div>

            <div className="row_datacell">
                {accounts.length === 0 ? (
                    <div className="no-data">No assignments found</div>
                ) : (
                    accounts.map((assignment) => (
                        <div key={assignment.staff_id} className="account-row">
                            <span className="col-7">
                                <p className="ms-3 mt-2">{assignment.firstName}</p>
                            </span>
                            <span className="col-3">
                                <p className="ms-3 mt-2">{assignment.position}</p>
                            </span>
                            <span className="col-2">
                                <p className="ms-2 mt-2">{assignment.status}</p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default Assignment;