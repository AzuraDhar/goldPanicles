import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './PendingAssignments.css';

function AssignedAssignments() {
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

    // Function to fetch ASSIGNED requests with taskedTable info
    const getAssignedRequests = async () => {
        try {
            // Fetch assigned requests with their taskedTable info
            const { data, error: fetchError } = await supabase
                .from('clientFormrequest')
                .select(`
                    *,
                    taskedTable!inner(
                        tasked_id,
                        created_at,
                        "assignedBy",
                        "adminPosition",
                        "assignedHead",
                        "headPosition",
                        "assignedStaff",
                        request_id
                    )
                `)
                .eq('status', 'assigned')
                .order('created_at', { ascending: false });
            
            if (fetchError) {
                console.error("Error fetching assigned requests:", fetchError);
                throw fetchError;
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Process the data
            const processedData = data.map(request => {
                const taskedInfo = request.taskedTable && request.taskedTable.length > 0 
                    ? request.taskedTable[0] 
                    : null;
                
                return {
                    ...request,
                    // Remove the joined table from the main object
                    taskedTable: undefined,
                    // Date assigned from taskedTable created_at
                    date_assigned: taskedInfo?.created_at || request.updated_at || request.created_at,
                    // Assigned to from taskedTable
                    assigned_to: taskedInfo?.assignedHead || 'Not assigned yet',
                    // Status from request
                    request_status: request.status || 'Not assigned yet'
                };
            });

            return processedData;
            
        } catch (error) {
            console.error("Error fetching assigned requests:", error);
            
            // Fallback: Try a simpler query if the join doesn't work
            try {
                return await getAssignedRequestsFallback();
            } catch (fallbackError) {
                console.error("Fallback method also failed:", fallbackError);
                throw error;
            }
        }
    };

    // Fallback method if the join query doesn't work
    const getAssignedRequestsFallback = async () => {
        try {
            // Step 1: Fetch assigned requests
            const { data: assignedRequests, error: requestsError } = await supabase
                .from('clientFormrequest')
                .select('*')
                .eq('status', 'assigned')
                .order('created_at', { ascending: false });
            
            if (requestsError) throw requestsError;
            if (!assignedRequests || assignedRequests.length === 0) return [];

            // Step 2: Get all request IDs
            const requestIds = assignedRequests.map(req => req.request_id);

            // Step 3: Fetch taskedTable records for these requests
            const { data: taskedRecords, error: taskedError } = await supabase
                .from('taskedTable')
                .select('created_at, "assignedHead", request_id')
                .in('request_id', requestIds);

            if (taskedError) console.error("Error fetching tasked records:", taskedError);

            // Step 4: Create a map of request ID to tasked record
            const taskedRecordMap = {};
            if (taskedRecords) {
                taskedRecords.forEach(record => {
                    if (record.request_id) {
                        taskedRecordMap[record.request_id] = record;
                    }
                });
            }

            // Step 5: Combine the data
            return assignedRequests.map(request => {
                const taskedRecord = taskedRecordMap[request.request_id];
                
                return {
                    ...request,
                    // Date assigned from taskedTable created_at
                    date_assigned: taskedRecord?.created_at || request.updated_at || request.created_at,
                    // Assigned to from taskedTable
                    assigned_to: taskedRecord?.assignedHead || request.assignedTo || 'Not assigned yet',
                    // Status from request
                    request_status: request.status || 'Not assigned yet'
                };
            });
            
        } catch (error) {
            console.error("Error in fallback method:", error);
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
            const data = await getAssignedRequests();
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

    // Handle Assign button click (for reassignment if needed)
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

    // Handle assign form submission (for reassignment)
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
                    "assignedBy": 'admin',
                    "adminPosition": 'Administrator',
                    "assignedHead": fullName,
                    "headPosition": null,
                    "assignedStaff": null,
                    request_id: selectedRequest.request_id
                });

            if (taskedError) throw taskedError;

            // Update the clientFormrequest
            const { error: requestError } = await supabase
                .from('clientFormrequest')
                .update({
                    assignedTo: fullName,
                    assignedToId: selectedSectionHead.staff_id,
                    assignedToEmail: selectedSectionHead.email,
                    status: 'assigned'
                })
                .eq('request_id', selectedRequest.request_id);
            
            if (requestError) {
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
        return <div className="loading">Loading assigned requests...</div>;
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
                    <p className="mt-3 ms-2">Date Assigned</p>
                </span>
                <span className="col-3">
                    <p className="mt-3 ms-3">Assigned To</p>
                </span>
                <span className="col-3">
                    <p className="mt-3 ms-3">Status</p>
                </span>
            </div>

            <div className="approved_body">
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <p>No assigned requests found.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.request_id} className="row" onClick={() => handleRowClick(request)}>
                            <span className="col-3">
                                <p className="mt-2 ms-1">{request.eventTitle}</p>
                            </span>

                            <span className="col-3">
                                {/* Display date assigned */}
                                <p className="mt-2 ms-1">
                                    {request.date_assigned ? 
                                        new Date(request.date_assigned).toLocaleDateString() 
                                        : 'Not available'
                                    }
                                </p>
                            </span>

                            <span className="col-3">
                                {/* Display who it's assigned to */}
                                <p className="mt-2 ms-1">
                                    {request.assigned_to}
                                </p>
                            </span>
                            
                            <span className="col-3">
                                {/* Display status */}
                                <p className="mt-2">
                                    {request.request_status}
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
                        <span className="updateForm mt-3">
                            {showAssignForm ? 'Reassign To:' : 'Assigned Request Details'}
                        </span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>
                            
                    {selectedRequest && !showAssignForm && (
                        <div className="request-details mt-1">
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
                            
                            {/* Add assignment info to the details view */}
                            <span className="approve_Details ms-1 mt-3">
                                <p><strong>Assignment Information:</strong></p>
                                <p className="ms-3">
                                    <strong>Assigned To:</strong> {selectedRequest.assigned_to}
                                </p>
                                <p className="ms-3">
                                    <strong>Date Assigned:</strong> {selectedRequest.date_assigned ? 
                                        new Date(selectedRequest.date_assigned).toLocaleString() 
                                        : 'Not available'
                                    }
                                </p>
                                <p className="ms-3">
                                    <strong>Status:</strong> {selectedRequest.request_status}
                                </p>
                            </span>
                        </div>
                    )}

                    {/* Hidden Assign Form */}
                    {showAssignForm && (
                        <div className="assign-form mt-4">
                            <form onSubmit={handleAssignSubmit}>
                                <div className="form-group mb-3">
                                    <span className="section_header">
                                        <p className="ms-1">Section Head</p>
                                        <p className="me-3">Section</p>
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
                                                <div key={sectionHead.staff_id} className="sectionhead_radio">
                                                    
                                                    <span 
                                                        className={`section-head-item ${
                                                            selectedSectionHeadId === sectionHead.staff_id ? 'selected' : ''
                                                        }`}
                                                        onClick={() => handleSectionHeadSelect(sectionHead)}
                                                    >   
                                                    <span className="sectionheadName">
                                                        <label htmlFor={`sectionHead-${sectionHead.staff_id}`} className="ms-3">
                                                            {fullName}
                                                        </label>
                                                    </span>

                                                    <span className="mt-3 sectionheadPosition ms-5">
                                                        <p className="text-start">{sectionHead.position}</p>
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

                                <div className="selected-section-head">
                                    {selectedSectionHeadId && (
                                        <div className="alert alert-info ms-4">
                                            <strong>Selected:</strong> {
                                                sectionHeads.find(sh => sh.staff_id === selectedSectionHeadId) ? 
                                                `${sectionHeads.find(sh => sh.staff_id === selectedSectionHeadId).firstName || ''} ${sectionHeads.find(sh => sh.staff_id === selectedSectionHeadId).lastName || ''}`.trim() : 
                                                ''
                                            }
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

export default AssignedAssignments;