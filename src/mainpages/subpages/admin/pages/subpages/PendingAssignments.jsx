import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './PendingAssignments.css';

function PendingAssignments() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [sectionHeads, setSectionHeads] = useState([]);
    const [loadingSectionHeads, setLoadingSectionHeads] = useState(false);
    const [selectedSectionHeadId, setSelectedSectionHeadId] = useState(null);

    const closeForm = () => {
        setShowForm(false);
        setShowAssignForm(false);
        setSelectedRequest(null);
        setSelectedSectionHeadId(null);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Function to fetch Section Heads from staffDB table
    const fetchSectionHeads = async () => {
        try {
            setLoadingSectionHeads(true);
            const { data, error } = await supabase
                .from('staffDB')
                .select('*')
                .eq('role', 'Section Head');
            
            if (error) {
                throw error;
            }
            
            setSectionHeads(data || []);
            return data;
        } catch (error) {
            console.error("Error fetching section heads:", error);
            setError("Failed to load section heads");
            return [];
        } finally {
            setLoadingSectionHeads(false);
        }
    };

    // Function to fetch approved requests with tracking info
    const getApprovedRequests = async () => {
        try {
            // Fetch ALL approved requests
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

            // Get all request IDs
            const requestIds = approvedRequests.map(req => req.request_id);

            // Fetch tracking records for these requests
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

            // Create a map of request ID to track record with staff info
            const trackRecordMap = {};
            if (trackRecords) {
                trackRecords.forEach(record => {
                    if (record.request_id) {
                        trackRecordMap[record.request_id] = record;
                    }
                });
            }

            // Combine the data
            const combinedData = approvedRequests.map(request => {
                const trackRecord = trackRecordMap[request.request_id];
                const staffInfo = trackRecord?.staffDB || {};
                
                // Get staff name who approved
                let approvedByName = 'Unknown';
                if (staffInfo.firstName && staffInfo.lastName) {
                    approvedByName = `${staffInfo.firstName} ${staffInfo.lastName}`;
                } else if (staffInfo.firstName) {
                    approvedByName = staffInfo.firstName;
                } else if (staffInfo.lastName) {
                    approvedByName = staffInfo.lastName;
                }
                
                // Use the full contactPerson name for client
                const clientFullName = request.contactPerson || 'Unknown';

                return {
                    ...request,
                    // Approval date from track record, or request updated_at, or created_at
                    approval_date: trackRecord?.date || request.updated_at || request.created_at,
                    // Staff name who approved, or "Unknown" if no track record
                    approved_by: approvedByName,
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

    // Check if request is already assigned
    const checkIfAlreadyAssigned = async (requestId) => {
        try {
            const { data, error } = await supabase
                .from('taskedTable')
                .select('*')
                .eq('request_id', requestId);
            
            if (error) throw error;
            
            return data && data.length > 0;
        } catch (error) {
            console.error("Error checking assignment:", error);
            return false;
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
    const handleRowClick = async (request) => {
        setSelectedRequest(request);
        setShowForm(true);
        setShowAssignForm(false);
    };

    // Handle Assign button click
    const handleAssignClick = async () => {
        const isAssigned = await checkIfAlreadyAssigned(selectedRequest.request_id);
        
        if (isAssigned) {
            alert('This request has already been assigned to someone.');
            return;
        }
        
        await fetchSectionHeads();
        setShowAssignForm(true);
    };

    // Handle radio button selection for section head
    const handleSectionHeadSelect = (sectionHead) => {
        setSelectedSectionHeadId(sectionHead.staff_id);
    };

    // Handle assign form submission
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSectionHeadId) {
            alert('Please select a Section Head');
            return;
        }

        const isAssigned = await checkIfAlreadyAssigned(selectedRequest.request_id);
        if (isAssigned) {
            alert('This request has already been assigned to someone.');
            return;
        }

        try {
            // Get selected section head details
            const selectedSectionHead = sectionHeads.find(sh => sh.staff_id === selectedSectionHeadId);
            const fullName = `${selectedSectionHead.firstName || ''} ${selectedSectionHead.lastName || ''}`.trim();

            // Insert into taskedTable - use request_id from the request object
            const { error: taskedError } = await supabase
                .from('taskedTable')
                .insert({
                    assignedBy: 'admin',
                    adminPosition: 'Administrator',
                    assignedHead: fullName,
                    headPosition: null,
                    assignedStaff: null,
                    request_id: selectedRequest.request_id  // Use request_id, not id
                });

            if (taskedError) throw taskedError;

            // Update the clientFormrequest - only update fields that exist
            const { error: requestError } = await supabase
                .from('clientFormrequest')
                .update({
                    assignedTo: fullName,
                    assignedToId: selectedSectionHead.staff_id,
                    assignedToEmail: selectedSectionHead.email,
                    status: 'assigned'
                })
                .eq('request_id', selectedRequest.request_id);  // Use request_id here too
            
            if (requestError) {
                // If there's an error, check if it's because columns don't exist
                console.log("Error updating clientFormrequest:", requestError);
                
                // Try a simpler update with only status
                const { error: simpleError } = await supabase
                    .from('clientFormrequest')
                    .update({
                        status: 'assigned'
                    })
                    .eq('request_id', selectedRequest.request_id);
                
                if (simpleError) throw simpleError;
            }
            
            loadData();
            alert('Request assigned successfully!');
            closeForm();
        } catch (error) {
            console.error("Error assigning request:", error);
            alert('Failed to assign request.');
        }
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
                    <p className="mt-3 ms-2">Date Approved</p>
                </span>
                <span className="col-3">
                    <p className="mt-3 ms-3">Approved By</p>
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
                                {/* Display who approved it */}
                                <p className="mt-2">
                                    {request.approved_by}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Hidden Details Form */}
            {showForm && (
                <div className="approvalForm1">
                    <div className="form_header ms-3">
                        <span className="updateForm mt-3">
                            {showAssignForm ? 'Assign To:' : 'Approved Request Details'}
                        </span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>
                            
                    {selectedRequest && !showAssignForm && (
                        <div className="request-details mt-4">
                            <span className="approve_Details ms-1">
                                <p><strong>Title:</strong> {selectedRequest.eventTitle}</p>
                            </span>
                            <span className="approve_Details ms-1">
                                <p><strong>Description:</strong> {selectedRequest.description}</p>
                            </span>
                            <span className="approve_Details ms-1">
                                <p><strong>Date:</strong> {selectedRequest.date}</p>
                                <p className="ms-5 "><strong>Time:</strong> {selectedRequest.time}</p>
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

                            <span className="assign_btn mt-3">
                                <button onClick={handleAssignClick}>Assign</button>
                            </span>
                        </div>
                    )}

                    {/* Hidden Assign Form */}
                    {showAssignForm && (
                        <div className="assign-form mt-4">
                            <form onSubmit={handleAssignSubmit}>
                                <div className="form_group mb-3">
                                    <span className="section_header1">
                                        <p className="ms-1 col-5">Section Head</p>
                                        <p className="me-3 col-5">Section</p>
                                    </span>
                                    
                                    {loadingSectionHeads ? (
                                        <div className="loading-section-heads">
                                            Loading Section Heads...
                                        </div>
                                    ) : sectionHeads.length === 0 ? (
                                        <div className="no-section-heads">
                                            No Section Heads found.
                                        </div>
                                    ) : (
                                        <div className="section-heads-list">
                                            {sectionHeads.map((sectionHead) => {
                                                const fullName = `${sectionHead.firstName || ''} ${sectionHead.lastName || ''}`.trim();
                                                return (
                                                <div className="sectionhead_radio">
                                                    
                                                    <span 
                                                        key={sectionHead.staff_id} 
                                                        className={`section-head-item ${
                                                            selectedSectionHeadId === sectionHead.staff_id ? 'selected' : ''
                                                        }`}
                                                        onClick={() => handleSectionHeadSelect(sectionHead)}
                                                    >   
                                                    <span className="sectionheadName">
                                                        <label htmlFor={`sectionHead-${sectionHead.staff_id}`} className="">
                                                            {fullName}
                                                        </label>
                                                    </span>

                                                    <span className="mt-3 sectionheadPosition ms-5">
                                                        <p className="text-start">{sectionHead.position}</p> {/* Add position here */}
                                                        <input
                                                            type="radio"
                                                            className="mb-3 ms-1"
                                                            name="sectionHead"
                                                            id={`sectionHead-${sectionHead.staff_id}`}
                                                            checked={selectedSectionHeadId === sectionHead.staff_id}
                                                            onChange={() => handleSectionHeadSelect(sectionHead)}
                                                        />
                                                    </span>
                                                        
                                                    </span>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>


                                <div className="form-buttons">
                                    <button type="button" onClick={() => setShowAssignForm(false)} className="back_btn me-2">
                                        Back
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="assign_button"
                                        disabled={!selectedSectionHeadId}
                                    >
                                        Done
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default PendingAssignments;