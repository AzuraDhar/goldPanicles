import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './DeniedRequest.css';

function DeniedRequest() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [reasonText, setReasonText] = useState(""); // Add state for reason text
    const [sending, setSending] = useState(false); // For loading state during send
    const [sendError, setSendError] = useState(null); // For send errors
    const [sendSuccess, setSendSuccess] = useState(false); // For success message

    const closeForm = () => {
        setShowForm(false);
        setSelectedRequest(null);
        setReasonText(""); // Clear reason text when closing
        setSendError(null); // Clear any errors
        setSendSuccess(false); // Clear success message
    };

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch denied requests with tracking info
    const getDeniedRequests = async () => {
        try {
            // Step 1: Fetch ALL denied requests
            const { data: deniedRequests, error: requestsError } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'denied')
                .order('created_at', { ascending: false });
            
            if (requestsError) {
                throw requestsError;
            }

            if (!deniedRequests || deniedRequests.length === 0) {
                return [];
            }

            // Step 2: Get all request IDs
            const requestIds = deniedRequests.map(req => req.request_id);

            // Step 3: Fetch tracking records for these requests
            const { data: trackRecords, error: trackError } = await supabase
                .from('admintrackRecord')
                .select(`
                    *,
                    staffDB:admin_id(
                        firstName,
                        lastName
                    )
                `)
                .in('request_id', requestIds)
                .eq('status', 'denied');

            if (trackError) {
                console.error("Error fetching track records:", trackError);
                // Continue without track records
            }

            // Step 4: Create a map of request ID to track record with staff info
            const trackRecordMap = {};
            if (trackRecords) {
                trackRecords.forEach(record => {
                    if (record.request_id) {
                        trackRecordMap[record.request_id] = record;
                    }
                });
            }

            // Step 5: Combine the data
            const combinedData = deniedRequests.map(request => {
                const trackRecord = trackRecordMap[request.request_id];
                const staffInfo = trackRecord?.staffDB || {};
                
                // Get staff name
                let staffName = 'Unknown';
                if (staffInfo.firstName && staffInfo.lastName) {
                    staffName = `${staffInfo.firstName} ${staffInfo.lastName}`;
                } else if (staffInfo.firstName) {
                    staffName = staffInfo.firstName;
                } else if (staffInfo.lastName) {
                    staffName = staffInfo.lastName;
                }
                
                // Use the full contactPerson name
                const clientFullName = request.contactPerson || 'Unknown';

                return {
                    ...request,
                    // Denial date from track record, or request updated_at, or created_at
                    denial_date: trackRecord?.date || request.updated_at || request.created_at,
                    // Staff name who denied, or "Unknown" if no track record
                    denied_by: staffName,
                    // Client full name
                    client: clientFullName
                };
            });

            return combinedData;
            
        } catch (error) {
            console.error("Error fetching denied requests:", error);
            throw error;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
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

    const handleRowClick = (request) => {
        console.log("Clicked denied request:", request);
        setSelectedRequest(request);
        setReasonText(request.denialReason || ""); // Load existing reason if any
        setShowForm(true);
        setSendError(null); // Clear previous errors
        setSendSuccess(false); // Clear previous success
    };

    // Function to save reason to Supabase
    const saveReasonToDB = async () => {
        if (!selectedRequest || !reasonText.trim()) {
            setSendError("Please enter a reason before sending.");
            return;
        }

        try {
            setSending(true);
            setSendError(null);

            // Save to your 'reason' table
            const { data, error } = await supabase
                .from('deniedDB') // Your table name
                .insert([
                    {
                        request_id: selectedRequest.request_id, // Add request_id to track which request
                        reason: reasonText.trim(),
                        created_at: new Date().toISOString(),
                        denied_by: selectedRequest.denied_by, // Optional: include who denied it
                        client_name: selectedRequest.client // Optional: include client name
                    }
                ]);

            if (error) {
                throw error;
            }

            console.log("Reason saved successfully:", data);
            setSendSuccess(true);
            
            // Optional: Also update the request record with the reason
            await supabase
                .from('clientFormrequest')
                .update({ denial_reason: reasonText.trim() })
                .eq('request_id', selectedRequest.request_id);

            // Close form after a delay or keep it open with success message
            setTimeout(() => {
                closeForm();
                loadData(); // Refresh the list if needed
            }, 1500);

        } catch (error) {
            console.error("Error saving reason:", error);
            setSendError(error.message || "Failed to save reason. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // Optional: Handle Enter key in textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            saveReasonToDB();
        }
    };

    if (loading) {
        return <div className="loading">Loading denied requests...</div>;
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
                        <p>No denied requests found.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.request_id} className="row" onClick={() => handleRowClick(request)}>
                            <span className="col-3">
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>

                            <span className="col-3">
                                {/* Display client full name */}
                                <p className="mt-2 ms-1">{request.client}</p>
                            </span>

                            <span className="col-3">
                                {/* Display denial date */}
                                <p className="mt-2 ms-1">
                                    {request.denial_date ? 
                                        new Date(request.denial_date).toLocaleDateString() 
                                        : 'Not available'
                                    }
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Display staff name who denied or "Unknown" */}
                                <p className="mt-2 ms-1">{request.denied_by}</p>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {showForm && (
                <div className="approvalForm">
                    <div className="form_header ms-3">
                        <span className="updateForm">Denied Request Details</span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                            disabled={sending}
                        >
                            ×
                        </button>
                    </div>
                    
                    {selectedRequest && (
                        <div className="mb-3 mt-5 deny_box">
                            {/* Show request details above the reason box */}
                            <div className="request-summary mb-3">
                                <p><strong>Request:</strong> {selectedRequest.eventTitle}</p>
                                <p><strong>Client:</strong> {selectedRequest.client}</p>
                                <p><strong>Denied By:</strong> {selectedRequest.denied_by}</p>
                                <p><strong>Date Denied:</strong> {
                                    selectedRequest.denial_date ? 
                                    new Date(selectedRequest.denial_date).toLocaleDateString() 
                                    : 'Not available'
                                }</p>
                            </div>
                            
                            <textarea 
                                className="form-control" 
                                rows="8" 
                                placeholder="Reason of Denial" 
                                id="floatingTextarea2"
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={sending}
                            />
                            
                            {/* Display messages */}
                            {sendError && (
                                <div className="alert alert-danger mt-3" role="alert">
                                    {sendError}
                                </div>
                            )}
                            
                            {sendSuccess && (
                                <div className="alert alert-success mt-3" role="alert">
                                    Reason saved successfully!
                                </div>
                            )}
                            
                            <span>
                                <button 
                                    className="me-3 mt-3 d-flex align-items-center justify-content-center"
                                    onClick={saveReasonToDB}
                                    disabled={sending || !reasonText.trim()}
                                >
                                    {sending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        "Send"
                                    )}
                                </button>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default DeniedRequest;