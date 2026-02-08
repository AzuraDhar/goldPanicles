import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './ApprovedRequest.css';

function ApprovedRequest() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
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

    // Function to fetch all approved requests
    const getApprovedRequests = async () => {
        try {
            // Step 1: Fetch ALL approved requests (even if no track record exists)
            const { data: approvedRequests, error: requestsError } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'approve')
                .order('created_at', { ascending: false });
            
            if (requestsError) {
                throw requestsError;
            }

            if (!approvedRequests || approvedRequests.length === 0) {
                return [];
            }

            // Step 2: Get all request IDs
            const requestIds = approvedRequests.map(req => req.request_id);

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
                .eq('status', 'approve');

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
            const combinedData = approvedRequests.map(request => {
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
                    // Approval date from track record, or request updated_at, or created_at
                    approval_date: trackRecord?.date || request.updated_at || request.created_at,
                    // Staff name who approved, or "Unknown" if no track record
                    approved_by: staffName,
                    // Client full name
                    client: clientFullName
                };
            });

            return combinedData;
            
        } catch (error) {
            console.error("Error fetching approved requests:", error);
            throw error;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
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

    // Handle row click to show details
    const handleRowClick = (request) => {
        console.log("Clicked approved request:", request);
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
                        <div key={request.request_id} className="row" onClick={() => handleRowClick(request)}>
                            <span className="col-3">
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>

                            <span className="col-3">
                                {/* Display client full name */}
                                <p className="mt-2 ms-1">
                                    {request.client}
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Display approval date */}
                                <p className="mt-2 ms-1">
                                    {request.approval_date ? 
                                        new Date(request.approval_date).toLocaleDateString() 
                                        : 'Not available'
                                    }
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Display staff name who approved or "Unknown" */}
                                <p className="mt-2 ms-1">
                                    {request.approved_by}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Hidden Details Form */}
            {showForm && (
                <div className="approvalForm">
                    <div className="form_header ms-3">
                        <span className="updateForm">Approved Request Details</span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>

                    {selectedRequest && (
                        <div className="request-details mt-4">
                            <span className="approve_Details ms-1">
                                <p><strong>Title:</strong> {selectedRequest.eventTitle}</p>
                            </span>

                            <span className="approve_Details ms-1">
                                <p><strong>Description:</strong> {selectedRequest.description}</p>
                            </span>
                            
                            <span className="approve_Details ms-1">
                                <p><strong>Date:</strong> {selectedRequest.date}</p>
                                <p className="ms-5"><strong>Time:</strong> {selectedRequest.time}</p>
                            </span>
                            
                            <span className="approve_Details ms-1">
                                <p><strong>Location:</strong> {selectedRequest.location}</p>
                                <p className="ms-3"><strong>Contact Info:</strong> {selectedRequest.contactInfo}</p>
                            </span>
                            
                            <span className="approve_Details ms-1">
                                <p><strong>Contact Person:</strong> {selectedRequest.contactPerson}</p>
                            </span>
                            
                            <span className="approve_Details ms-1">
                                <p><strong>Attach File:</strong> {selectedRequest.attachFile}</p>
                            </span>
                            
                            {/* Add approval info to the details view */}
                            <span className="approve_Details ms-1 mt-3">
                                <p><strong>Approval Information:</strong></p>
                                <p className="ms-3">
                                    <strong>Approved By:</strong> {selectedRequest.approved_by}
                                </p>
                                <p className="ms-3">
                                    <strong>Approval Date:</strong> {selectedRequest.approval_date ? 
                                        new Date(selectedRequest.approval_date).toLocaleString() 
                                        : 'Not available'
                                    }
                                </p>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ApprovedRequest;