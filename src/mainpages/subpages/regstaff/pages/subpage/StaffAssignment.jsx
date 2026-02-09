import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import { getUserData } from "../../../../../api/auth";
import './StaffAssignment.css';

function StaffAssignment() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStaffId, setCurrentStaffId] = useState(null);

    useEffect(() => {
        fetchCurrentStaff();
    }, []);

    // Get current logged-in staff member
    const fetchCurrentStaff = async () => {
        try {
            const currentUser = getUserData();
            if (!currentUser || !currentUser.email) {
                setError("No user logged in");
                setLoading(false);
                return;
            }

            // Get staff ID from staffDB using email
            const { data, error } = await supabase
                .from('staffDB')
                .select('staff_id')
                .eq('email', currentUser.email)
                .single();

            if (error) {
                throw error;
            }

            if (data) {
                setCurrentStaffId(data.staff_id);
                fetchAcceptedTasks(data.staff_id);
            } else {
                setError("Staff member not found");
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching current staff:', err);
            setLoading(false);
        }
    };

    // Fetch accepted tasks for the current staff member
    const fetchAcceptedTasks = async (staffId) => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch accepted invitations from staffInvitation table
            const { data, error } = await supabase
                .from('staffInvitation')
                .select(`
                    invitation_id,
                    created_at,
                    invitations_status,
                    request_id,
                    clientFormrequest (
                        eventTitle,
                        description,
                        date,
                        created_at,
                        status
                    )
                `)
                .eq('staff_id', staffId)
                .eq('invitations_status', 'accepted')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching accepted tasks:", error);
                throw error;
            }
            
            console.log("Fetched accepted tasks:", data);
            
            // Format data for display
            const formattedData = (data || []).map(task => {
                let eventTitle = "Untitled Task";
                let description = "No description";
                let taskDate = task.created_at;
                
                if (task.clientFormrequest) {
                    // clientFormrequest is an object
                    const request = task.clientFormrequest;
                    eventTitle = request.eventTitle || eventTitle;
                    description = request.description || description;
                    taskDate = request.created_at || taskDate;
                }
                
                return {
                    task_id: task.invitation_id,
                    request_id: task.request_id,
                    title: eventTitle,
                    description: description,
                    date_accepted: new Date(task.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: task.invitations_status || "accepted"
                };
            });
            
            setAccounts(formattedData);
            
        } catch (err) {
            setError(err.message);
            console.error('Error fetching accepted tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading accepted tasks...</div>;
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
                    <p className="mt-4">Date Accepted</p>
                </span>
                <span className="mt-4 col-2">
                    <p>Status</p>
                </span>
            </div>

            <div className="row_datacell">
                {accounts.length === 0 ? (
                    <div className="no-data">No accepted tasks found</div>
                ) : (
                    accounts.map((task) => (
                        <div key={task.task_id} className="account-row">
                            <span className="col-7">
                                <p className="ms-3 mt-2">{task.title}</p>
                            </span>
                            <span className="col-3">
                                <p className="ms-3 mt-2">{task.date_accepted}</p>
                            </span>
                            <span className="col-2">
                                <p 
                                    className="ms-2 mt-2" 
                                    style={{
                                        color: '#28a745',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {task.status}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default StaffAssignment;