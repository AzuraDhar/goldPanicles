import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import { getUserId } from "../../../../../api/auth";
import './PendingRequest.css';

function PendingRequest() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [updating, setUpdating] = useState(false); // ADD THIS STATE
    const [formData, setFormData] = useState({
        eventTitle: '',
        description: '',
        date: '',
        time: '',
        location: '',
        contactInfo: '',
        contactPerson: '',
        attachFile: '',
    });

    const closeForm = () => {
        setShowForm(false);
        setSelectedRequest(null);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch ONLY pending requests
    const getPendingRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'pending')
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

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getPendingRequests();
            setRequests(data);
            setError(null);
        } catch (error) {
            console.error("Error loading requests:", error);
            setError("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    // Function to update request status
    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            setUpdating(true);
            const { data, error } = await supabase
                .from('clientFormrequest')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString() // Optional: add update timestamp
                })
                .eq('request_id', requestId)
                .select(); // Select the updated row
            
            if (error) {
                throw error;
            }
            
            console.log(`Request ${requestId} status updated to: ${newStatus}`);
            return data;
        } catch (error) {
            console.error("Error updating request status:", error);
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    // Handle row click
    const handleRowClick = (request) => {
        console.log("Clicked request:", request);
        setSelectedRequest(request);
        setFormData({
            eventTitle: request.eventTitle || '',
            description: request.description || '',
            date: request.date || '',
            time: request.time || '',
            location: request.location || '',
            contactInfo: request.contactInfo || '',
            contactPerson: request.contactPerson || '',
            attachFile: request.attachFile || '',
        });
        setShowForm(true);
    };

    // Handle approve button click
    const handleApprove = async () => {
        if (!selectedRequest) return;
        
        try {
            setUpdating(true);
            
            // Get admin ID from auth
            const adminId = getUserId();
            
            // Update the request status
            await updateRequestStatus(selectedRequest.request_id, 'approve');
            
            // Save tracking record to admintrackRecord table
            const { error: trackError } = await supabase
                .from('admintrackRecord')
                .insert({
                    request_id: selectedRequest.request_id,
                    admin_id: adminId,
                    date: new Date().toISOString().split('T')[0],
                    status: 'approve'
                });
            
            if (trackError) {
                console.error("Error saving track record:", trackError);
                // Continue anyway since the main request was updated
            }
            
            // Remove the request from the local state
            setRequests(prevRequests => 
                prevRequests.filter(req => req.request_id!== selectedRequest.request_id)
            );
            
            // Show success message
            alert(`Request "${selectedRequest.eventTitle}" has been approved!`);
            
            closeForm();
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    // Handle deny button click
    const handleDeny = async () => {
        if (!selectedRequest) return;
        
        // Optional: Add confirmation dialog
        const confirmDeny = window.confirm(`Are you sure you want to deny "${selectedRequest.eventTitle}"?`);
        if (!confirmDeny) return;
        
        try {
            setUpdating(true);
            
            // Get admin ID from auth
            const adminId = getUserId();
            
            // Update the request status
            await updateRequestStatus(selectedRequest.request_id, 'denied');
            
            // Save tracking record to admintrackRecord table
            const { error: trackError } = await supabase
                .from('admintrackRecord')
                .insert({
                    request_id: selectedRequest.request_id,
                    admin_id: adminId,
                    date: new Date().toISOString().split('T')[0],
                    status: 'denied'
                });
            
            if (trackError) {
                console.error("Error saving track record:", trackError);
                // Continue anyway since the main request was updated
            }
            
            // Remove the request from the local state
            setRequests(prevRequests => 
                prevRequests.filter(req => req.request_id !== selectedRequest.request_id)
            );
            
            // Show success message
            alert(`Request "${selectedRequest.eventTitle}" has been denied.`);
            
            closeForm();
        } catch (error) {
            console.error("Error denying request:", error);
            alert("Failed to deny request. Please try again.");
        } finally {
            setUpdating(false);
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
                        <div key={request.request_id} className="row" onClick={() => handleRowClick(request)}>
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

            {showForm && (
                <div className="approvalForm">
                    <div className="form_header ms-3 mt-2">
                        <span className="updateForm">Request Details</span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                            disabled={updating}
                        >
                            ×
                        </button>
                    </div>
                            
                    {selectedRequest && (
                        <div className="request-details mt-3">
                            <span className="approveDetails ms-1">
                                <p><strong>Title:</strong> {selectedRequest.eventTitle}</p>
                            </span>

                            <span className="approveDetails ms-1">
                                <p><strong>Description:</strong> {selectedRequest.description}</p>
                            </span>
                            
                            <span className="approveDetails ms-1">
                                <p><strong>Date:</strong> {selectedRequest.date}</p>
                                <p className="ms-5"><strong>Time:</strong> {selectedRequest.time}</p>
                            </span>
                            
                            <span className="approveDetails ms-1">
                                <p><strong>Location:</strong> {selectedRequest.location}</p>
                                <p className="ms-5"><strong>Contact Info:</strong> {selectedRequest.contactInfo}</p>
                            </span>
                            
                            <span className="approveDetails ms-1">
                                <p><strong>Contact Person:</strong> {selectedRequest.contactPerson}</p>
                            </span>
                            
                            <span className="approveDetails ms-1">
                                <p><strong>Attach File:</strong> <span>{selectedRequest.attachFile}</span></p>
                            </span>
                             
                            <span className="mt-4">
                                <button 
                                    className="approve_btn me-3"
                                    onClick={handleApprove}
                                    disabled={updating}
                                >
                                    {updating ? 'Processing...' : 'Approve'}
                                </button>
                                <button 
                                    className="deny_btn me-2"
                                    onClick={handleDeny}
                                    disabled={updating}
                                >
                                    {updating ? 'Processing...' : 'Deny'}
                                </button>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default PendingRequest;