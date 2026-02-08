import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import { getUserId } from "../../../../../api/auth";
import './Invitation.css';

function Invitation() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskDetails, setTaskDetails] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get current user's name
            let userName = "";
            try {
                // Try from sessionStorage first (as in auth.js)
                userName = sessionStorage.getItem("userName");
                if (!userName) {
                    // Fallback to localStorage
                    const userData = JSON.parse(localStorage.getItem("user") || "{}");
                    userName = userData.full_name || 
                              (userData.firstName && userData.lastName ? 
                               `${userData.firstName} ${userData.lastName}` : 
                               userData.firstName || userData.lastName || "");
                }
            } catch (e) {
                console.error("Error getting user name:", e);
            }
            
            if (!userName) {
                setAccounts([]);
                setLoading(false);
                return;
            }
            
            console.log("Looking for tasks assigned to:", userName);
            
            // Fetch tasks where this user is assigned as Head or Staff
            const { data, error } = await supabase
                .from('taskedTable')
                .select(`
                    tasked_id,
                    created_at,
                    assignedBy,
                    assignedHead,
                    assignedStaff,
                    request_id,
                    clientFormrequest!inner (
                        request_id,
                        eventTitle,
                        description,
                        date,
                        time,
                        location,
                        contactPerson,
                        contactInfo,
                        attachFile,
                        status,
                        created_at
                    )
                `)
                .or(`assignedHead.ilike.%${userName}%,assignedStaff.ilike.%${userName}%`)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching tasks:", error);
                throw error;
            }
            
            console.log("Fetched tasks:", data);
            
            // Format data for display
            const formattedData = (data || []).map(task => {
                const request = task.clientFormrequest || {};
                return {
                    staff_id: task.tasked_id,
                    request_id: task.request_id,
                    firstName: request.eventTitle || "Untitled Task",
                    position: task.created_at ? 
                             new Date(task.created_at).toLocaleDateString() : 
                             "No date",
                    // Store full task data for details
                    _taskData: task,
                    _requestData: request
                };
            });
            
            setAccounts(formattedData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Accept button click
    const handleAccept = async () => {
        if (!selectedTask || !selectedTask.request_id) {
            alert("No task selected.");
            return;
        }

        try {
            setProcessing(true);
            
            // Get current user ID
            const headId = getUserId();
            
            if (!headId) {
                alert("Unable to identify user. Please log in again.");
                return;
            }

            // Save to stafftrackRecord table with status 'pending'
            const { data, error } = await supabase
                .from('stafftrackRecord')
                .insert({
                    request_id: selectedTask.request_id,
                    head_id: headId,
                    date: new Date().toISOString().split('T')[0], // Current date
                    status: 'pending'
                })
                .select();

            if (error) {
                console.error("Error saving to stafftrackRecord:", error);
                throw error;
            }

            console.log("Saved to stafftrackRecord:", data);
            
            // Optional: Update clientFormrequest status if needed
            // await supabase
            //     .from('clientFormrequest')
            //     .update({ status: 'pending_review' })
            //     .eq('request_id', selectedTask.request_id);
            
            alert("Task accepted successfully! Status: Pending");
            
            // Remove the task from the list
            setAccounts(prevAccounts => 
                prevAccounts.filter(task => task.request_id !== selectedTask.request_id)
            );
            
            closeForm();
        } catch (error) {
            console.error("Error accepting task:", error);
            alert("Failed to accept task. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    // Handle Decline button click
    const handleDecline = async () => {
        if (!selectedTask) {
            alert("No task selected.");
            return;
        }

        const confirmDecline = window.confirm("Are you sure you want to decline this task?");
        if (!confirmDecline) return;

        try {
            setProcessing(true);
            
            // Get current user ID
            const headId = getUserId();
            
            if (!headId) {
                alert("Unable to identify user. Please log in again.");
                return;
            }

            // Save to stafftrackRecord table with status 'declined'
            const { data, error } = await supabase
                .from('stafftrackRecord')
                .insert({
                    request_id: selectedTask.request_id,
                    head_id: headId,
                    date: new Date().toISOString().split('T')[0], // Current date
                    status: 'declined'
                })
                .select();

            if (error) {
                console.error("Error saving to stafftrackRecord:", error);
                throw error;
            }

            console.log("Saved decline to stafftrackRecord:", data);
            
            alert("Task declined successfully!");
            
            // Remove the task from the list
            setAccounts(prevAccounts => 
                prevAccounts.filter(task => task.request_id !== selectedTask.request_id)
            );
            
            closeForm();
        } catch (error) {
            console.error("Error declining task:", error);
            alert("Failed to decline task. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    // Handle row click
    const handleRowClick = async (task) => {
        console.log("Clicked task:", task);
        
        setSelectedTask(task);
        
        // We already have the request data from the fetch
        if (task._requestData) {
            setTaskDetails(task._requestData);
            setShowForm(true);
            return;
        }
        
        // If for some reason we don't have the data, fetch it
        if (task.request_id) {
            try {
                const { data, error } = await supabase
                    .from('clientFormrequest')
                    .select('*')
                    .eq('request_id', task.request_id)
                    .single();
                
                if (!error && data) {
                    setTaskDetails(data);
                }
            } catch (err) {
                console.error("Error fetching task details:", err);
            }
        }
        
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedTask(null);
        setTaskDetails(null);
        setProcessing(false);
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <>
            <div className="row_header">
                <span className="ms-1 col-6">
                    <p className="mt-4 ms-2">Title</p>
                </span>
                <span className="mt-4 col-6 date_received">
                    <p className="me-4">Date Received</p>
                </span>
            </div>

            {showForm && (
                <div className="approvalForm">
                    <div className="form_header ms-3 mt-2">
                        <span className="updateForm">Task Details</span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                            disabled={processing}
                        >
                            ×
                        </button>
                    </div>
                            
                    {selectedTask && (
                        <div className="request-details mt-3">
                            <span className="approveDetails ms-1">
                                <p><strong>Title:</strong> {selectedTask.firstName}</p>
                            </span>

                            <span className="approveDetails ms-1">
                                <p><strong>Date Assigned:</strong> {selectedTask.position}</p>
                            </span>
                            
                            {taskDetails && (
                                <>
                                    <span className="approveDetails ms-1">
                                        <p><strong>Description:</strong> {taskDetails.description || "No description available"}</p>
                                    </span>
                                    
                                    <span className="approveDetails ms-1">
                                        <p><strong>Event Date:</strong> {taskDetails.date || "No date specified"}</p>
                                        {taskDetails.time && (
                                            <p className="ms-5"><strong>Time:</strong> {taskDetails.time}</p>
                                        )}
                                    </span>
                                    
                                    <span className="approveDetails ms-1">
                                        <p><strong>Location:</strong> {taskDetails.location || "No location specified"}</p>
                                        <p className="ms-5"><strong>Contact Info:</strong> {taskDetails.contactInfo || "No contact info"}</p>
                                    </span>
                                    
                                    <span className="approveDetails ms-1">
                                        <p><strong>Contact Person:</strong> {taskDetails.contactPerson || "No contact person"}</p>
                                    </span>
                                    
                                    {taskDetails.attachFile && (
                                        <span className="approveDetails ms-1">
                                            <p><strong>Attach File:</strong> <span>{taskDetails.attachFile}</span></p>
                                        </span>
                                    )}
                                    
                                    {selectedTask._taskData && (
                                        <span className="approveDetails ms-1">
                                            <p><strong>Assigned By:</strong> {selectedTask._taskData.assignedBy || "Unknown"}</p>
                                            <p className="ms-5"><strong>Assigned As:</strong> {
                                                selectedTask._taskData.assignedHead && 
                                                selectedTask._taskData.assignedHead.includes(
                                                    sessionStorage.getItem("userName") || 
                                                    JSON.parse(localStorage.getItem("user") || "{}").full_name
                                                ) ? "Head" : "Staff"
                                            }</p>
                                        </span>
                                    )}
                                </>
                            )}
                             
                            <span className="mt-4">
                                <button 
                                    className="approve_btn me-3"
                                    onClick={handleAccept}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Accept'}
                                </button>
                                <button 
                                    className="deny_btn me-2"
                                    onClick={handleDecline}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Decline'}
                                </button>
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="row_datacell">
                {accounts.length === 0 ? (
                    <div className="no-data">No tasks found</div>
                ) : (
                    accounts.map((task) => (
                        <div 
                            key={task.staff_id} 
                            className="account-row" 
                            onClick={() => handleRowClick(task)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="col-6">
                                <p className="ms-3 mt-2">{task.firstName}</p>
                            </span>
                            <span className="col-6 date_received">
                                <p className="me-3 mt-2">{task.position}</p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default Invitation;