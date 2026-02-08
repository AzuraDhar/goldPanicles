import React, { useState, useEffect } from "react";
import { getRequests } from "../../../../api/requestlist";
import { CiEdit } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { updateRequest, deleteRequest } from "../../../../api/updateform";
import { getUserId, isAuthenticated } from "../../../../api/auth";
import './ClientRequest.css';

function ClientRequest() {
    const [requests, setRequests] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({});
    const [showUpdate, setShowUpdate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = () => {
            try {
                const userIdFromStorage = getUserId();
                const authenticated = isAuthenticated();
                
                if (authenticated && userIdFromStorage) {
                    setUserId(userIdFromStorage);
                    setIsLoggedIn(true);
                    console.log('👤 ClientRequest: Current user ID:', userIdFromStorage);
                } else {
                    setIsLoggedIn(false);
                    console.log('🔒 ClientRequest: No user logged in');
                }
            } catch (error) {
                console.error('❌ ClientRequest: Error fetching user data:', error);
                setIsLoggedIn(false);
            }
        };
        
        fetchUserData();
    }, []);

    useEffect(() => {
        if (isLoggedIn && userId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, userId]);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('📋 ClientRequest: Loading requests for user ID:', userId);
            
            const data = await getRequests();
            setRequests(data);
            
            // Filter requests to only show those belonging to the current user
            const filteredRequests = data.filter(request => {
                // Check if request has user_id and matches current user
                const matches = request.user_id === userId;
                console.log(`📊 Request ${request.request_id}: user_id=${request.user_id}, current user=${userId}, matches=${matches}`); // CHANGED: request.id to request.request_id
                return matches;
            });
            
            setUserRequests(filteredRequests);
            console.log(`✅ ClientRequest: Loaded ${filteredRequests.length} requests for user ${userId} out of ${data.length} total requests`);
            
        } catch (error) {
            console.error("❌ ClientRequest: Error loading requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (request) => {
        // Only allow clicking if user owns this request
        if (request.user_id !== userId) {
            console.log('🚫 ClientRequest: User does not own this request, cannot view');
            alert('You can only view your own requests');
            return;
        }
        
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

    const closeForm = () => {
        setShowForm(false);
        setShowUpdate(false);
        setSelectedRequest(null);
        setIsSaving(false);
        setIsDeleting(false);
    };

    const handleEditClick = () => {
        // Only allow editing if user owns this request
        if (selectedRequest && selectedRequest.user_id === userId) {
            setShowUpdate(true);
            setShowForm(false);
        } else {
            console.log('🚫 ClientRequest: User does not own this request, cannot edit');
            alert('You can only edit your own requests');
        }
    };

    // Handle Save button click
    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedRequest || isSaving || selectedRequest.user_id !== userId) return;
        
        setIsSaving(true);
        try {
            console.log(`💾 ClientRequest: Updating request ${selectedRequest.request_id} for user ${userId}`); // CHANGED: selectedRequest.id to selectedRequest.request_id
            
            const updateData = {
                eventTitle: formData.eventTitle,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                contactInfo: formData.contactInfo,
                contactPerson: formData.contactPerson,
                attachFile: formData.attachFile,
            };
            
            const updatedRequest = await updateRequest(selectedRequest.request_id, updateData); // CHANGED: selectedRequest.id to selectedRequest.request_id
            
            // Update local state - keep the original status from selectedRequest
            const updatedRequests = requests.map(req => 
                req.request_id === selectedRequest.request_id ? { // CHANGED: req.id to req.request_id and selectedRequest.id to selectedRequest.request_id
                    ...updatedRequest, 
                    status: selectedRequest.status
                } : req
            );
            
            setRequests(updatedRequests);
            
            // Update userRequests by filtering again
            const filteredRequests = updatedRequests.filter(request => request.user_id === userId);
            setUserRequests(filteredRequests);
            
            // Update selectedRequest with new data but keep status
            setSelectedRequest({
                ...updatedRequest,
                status: selectedRequest.status
            });
            
            // Close the form
            closeForm();
            
            console.log('✅ ClientRequest: Request updated successfully');
            alert("Request updated successfully!");
        } catch (error) {
            console.error("❌ ClientRequest: Error updating request:", error);
            alert("Failed to update request. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Delete button click
    const handleDelete = async () => {
        if (!selectedRequest || isDeleting || selectedRequest.user_id !== userId) return;
        
        if (window.confirm("Are you sure you want to delete this request?")) {
            setIsDeleting(true);
            try {
                console.log(`🗑️ ClientRequest: Deleting request ${selectedRequest.request_id} for user ${userId}`); // CHANGED: selectedRequest.id to selectedRequest.request_id
                
                await deleteRequest(selectedRequest.request_id); // CHANGED: selectedRequest.id to selectedRequest.request_id
                
                // Update local state
                const updatedRequests = requests.filter(req => req.request_id !== selectedRequest.request_id); // CHANGED: req.id to req.request_id and selectedRequest.id to selectedRequest.request_id
                setRequests(updatedRequests);
                
                // Update userRequests by filtering again
                const filteredRequests = updatedRequests.filter(request => request.user_id === userId);
                setUserRequests(filteredRequests);
                
                // Close the form
                closeForm();
                
                console.log('✅ ClientRequest: Request deleted successfully');
                alert("Request deleted successfully!");
            } catch (error) {
                console.error("❌ ClientRequest: Error deleting request:", error);
                alert("Failed to delete request. Please try again.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Handle Cancel button in update form
    const handleCancel = () => {
        if (selectedRequest) {
            setFormData({
                eventTitle: selectedRequest.eventTitle || '',
                description: selectedRequest.description || '',
                date: selectedRequest.date || '',
                time: selectedRequest.time || '',
                location: selectedRequest.location || '',
                contactInfo: selectedRequest.contactInfo || '',
                contactPerson: selectedRequest.contactPerson || '',
                attachFile: selectedRequest.attachFile || '',
            });
        }
        closeForm();
    };

    return (
        <div className="clientRequestDisplay">
            <div className="clientDisplayTitle">
                <p className="mt-1">Request Tracker</p>
            </div>

            <div className="clientDisplayBody mt-4">
                <div className="clientDisplayHeader row">
                    <span className="col-6 col-sm-5 col-md-6">
                        <p className="mt-2">Title</p>
                    </span>
                    <span className="col-3 col-sm-3 col-md-3">
                        <p className="mt-2">Date Requested</p>
                    </span>
                    <span className="col-3 col-sm-4 col-md-3">
                        <p className="mt-2">Status</p>
                    </span>
                </div>

                <div className="clientDisplayRequests">
                    {!isLoggedIn ? (
                        <div className="alert alert-warning mt-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Please log in to view your requests.
                        </div>
                    ) : loading ? (
                        <div className="text-center mt-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading your requests...</p>
                        </div>
                    ) : userRequests.length === 0 ? (
                        <div className="alert alert-info mt-3">
                            <i className="bi bi-info-circle me-2"></i>
                            You have no requests yet. Submit a request from the calendar above.
                        </div>
                    ) : (
                        <div className="clientRequestList">
                            {userRequests.map((request) => (
                                <div key={request.request_id} className="row" onClick={() => handleRowClick(request)}> {/* CHANGED: key={request.id} to key={request.request_id} */}
                                    <span className="col-6 col-sm-5 col-md-6">
                                        <p className="mt-2 ms-2">{request.eventTitle}</p>
                                    </span>
                                    <span className="col-3 col-sm-3 col-md-3">
                                        <p className="mt-2 ms-1">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </span>
                                    <span className="col-3 col-sm-4 col-md-3">
                                        <p className="mt-2 status-badge status-{request.status?.toLowerCase()}"> {/* Added optional chaining */}
                                            {request.status}
                                        </p>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showForm && selectedRequest && (
                        <div className="clientOptions1">
                            <div className="form-header1">
                                <span className="updateForm">Details</span>
                                <button 
                                    onClick={closeForm}
                                    className="close-btn position-absolute top-0 end-0 me-1 mt-1 bg-danger bg-opacity-75"
                                    disabled={isDeleting}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="form-body">
                                
                                <span className="formData_span mt-2">
                                    <p className="ms-1 mt-2">Title: {formData.eventTitle}</p>
                                </span>
                                <span className="formData_span">
                                    <p className="ms-1">Description: {formData.description}</p>
                                </span>
                                <span className="formData_span">
                                    <span>
                                        <p className="ms-1">Date: {formData.date}</p>
                                    </span>
                                    <span>
                                        <p className="ms-1">Time: {formData.time}</p>
                                    </span>
                                </span>
                                <span className="formData_span">
                                    <span>
                                        <p className="ms-1">Location: {formData.location}</p>
                                    </span>
                                    <span>
                                        <p className="ms-1">Contact: {formData.contactInfo}</p>
                                    </span>
                                </span>
                                <span className="formData_span">
                                    <p className="ms-1">Person to Contact: {formData.contactPerson}</p>
                                </span>
                                <span className="formData_span">
                                    <p className="ms-1 attach_font">Attached File: <span>{formData.attachFile || 'None'}</span></p>
                                </span>
                                <span className="formData_span mt-3">
                                    <p className="ms-1">Status: {selectedRequest?.status || 'Pending'}</p>
                                </span>
                                <span className="formData_span">
                                    <p className="ms-1 text-muted">
                                        <small>
                                            <i className="bi bi-calendar me-1"></i>
                                            Created: {new Date(selectedRequest.created_at).toLocaleString()}
                                        </small>
                                    </p>
                                </span>

                                {/* Only show edit/delete buttons if user owns this request */}
                                {selectedRequest.user_id === userId && (
                                    <span className="formData_span span_button mb-3">
                                        <button className="edit_btn" onClick={handleEditClick} disabled={isDeleting}>
                                            <CiEdit />
                                        </button>
                                        <button className="delete_btn" onClick={handleDelete} disabled={isDeleting}>
                                            {isDeleting ? 'Deleting...' : <FaTrash />}
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}


                    {showUpdate && selectedRequest && selectedRequest.user_id === userId && (
                        <div className="update_Form">
                            <div className="form-header">
                                <span className="updateForm1 mt-1">Edit Your Request</span>
                                <button 
                                    onClick={handleCancel}
                                    className="close-btn position-absolute mt-1 top-0 end-0 me-1 bg-danger bg-opacity-75"
                                    disabled={isSaving}
                                >
                                    ×
                                </button>
                            </div>

                            <form className="mt-1" onSubmit={handleSave}>
                                <div className="updateForm_input">
                                    <label htmlFor="eventTitle" className="form-label">Event Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="eventTitle"
                                        value={formData.eventTitle || ''}
                                        onChange={(e) => setFormData({...formData, eventTitle: e.target.value})}
                                        required
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="textarea mt-1">
                                    <label htmlFor="description" className="form-label">
                                        Description
                                    </label>
                                    <textarea 
                                        className="form-control description_area" 
                                        id="description"
                                        rows="2"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        disabled={isSaving}
                                    ></textarea>
                                </div>   

                                <div className="updateForm_input2 mt-1 d-flex gap-3">
                                    <div className="two_column">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            id="date"
                                            value={formData.date || ''}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="two_column">
                                        <label htmlFor="time" className="form-label">Time</label>
                                        <input 
                                            type="time" 
                                            className="form-control" 
                                            id="time"
                                            value={formData.time || ''}
                                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                <div className="updateForm_input">
                                    <label htmlFor="location" className="form-label">Location</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="location"
                                        value={formData.location || ''}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="updateForm_input2 mt-1 d-flex gap-3">
                                    <div className="two_column">
                                        <label htmlFor="contactPerson" className="form-label">Person to Contact</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="contactPerson"
                                            value={formData.contactPerson || ''}
                                            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="two_column">
                                        <label htmlFor="contactInfo" className="form-label">Contact Info</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="contactInfo"
                                            value={formData.contactInfo || ''}
                                            onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                <div className="updateForm_input mt-1">
                                    <label htmlFor="attachFile" className="form-label">Attach File (URL)</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="attachFile"
                                        value={formData.attachFile || ''}
                                        onChange={(e) => setFormData({...formData, attachFile: e.target.value})}
                                        disabled={isSaving}
                                        placeholder="Enter file URL"
                                    />
                                </div>


                                <div className="updateForm_button mt-3">
                                    <button 
                                        type="submit" 
                                        className="me-3 save_btn"
                                        disabled={isSaving}
                                    >
                                        <p className="mt-3">{isSaving ? 'Saving...' : 'Save'}</p>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancel}
                                        className="me-4 cancel_btn"
                                        disabled={isSaving}
                                    >
                                        <p className="mt-3">Cancel</p>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

            </div>
        </div>
    );
}

export default ClientRequest;