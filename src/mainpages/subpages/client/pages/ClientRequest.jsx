import React, { useState, useEffect } from "react";
import { getRequests } from "../../../../api/requestlist";
import { CiEdit } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { updateRequest, deleteRequest } from "../../../../api/updateform";
import './ClientRequest.css';

function ClientRequest() {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({});
    const [showUpdate, setShowUpdate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Error loading requests:", error);
        }
    };

    const handleRowClick = (request) => {
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
            // Removed status from formData since only admin can change it
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
        setShowUpdate(true);
        setShowForm(false);
    };

    // Handle Save button click
    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedRequest || isSaving) return;
        
        setIsSaving(true);
        try {
            // Don't include status in the update since only admin can change it
            const updateData = {
                eventTitle: formData.eventTitle,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                contactInfo: formData.contactInfo,
                contactPerson: formData.contactPerson,
                attachFile: formData.attachFile,
                // Status is not included here
            };
            
            const updatedRequest = await updateRequest(selectedRequest.id, updateData);
            
            // Update local state - keep the original status from selectedRequest
            setRequests(requests.map(req => 
                req.id === selectedRequest.id ? { 
                    ...updatedRequest, 
                    status: selectedRequest.status // Keep original status
                } : req
            ));
            
            // Update selectedRequest with new data but keep status
            setSelectedRequest({
                ...updatedRequest,
                status: selectedRequest.status
            });
            
            // Close the form
            closeForm();
            
            // Show success message
            alert("Request updated successfully!");
        } catch (error) {
            console.error("Error updating request:", error);
            alert("Failed to update request. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Delete button click
    const handleDelete = async () => {
        if (!selectedRequest || isDeleting) return;
        
        if (window.confirm("Are you sure you want to delete this request?")) {
            setIsDeleting(true);
            try {
                await deleteRequest(selectedRequest.id);
                
                // Update local state
                setRequests(requests.filter(req => req.id !== selectedRequest.id));
                
                // Close the form
                closeForm();
                
                // Show success message
                alert("Request deleted successfully!");
            } catch (error) {
                console.error("Error deleting request:", error);
                alert("Failed to delete request. Please try again.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Handle Cancel button in update form
    const handleCancel = () => {
        // Reset form data to original values
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
                // Removed status
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
                    <div className="clientRequestList">
                        {requests.map((request) => (
                            <div key={request.id} className="row" onClick={() => handleRowClick(request)}>
                                <span className="col-6 col-sm-5 col-md-6">
                                    <p className="mt-2 ms-2">{request.eventTitle}</p>
                                </span>
                                <span className="col-3 col-sm-3 col-md-3">
                                    <p className="mt-2 ms-1">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </span>
                                <span className="col-3 col-sm-4 col-md-3">
                                    <p className="mt-2">{request.status}</p>
                                </span>
                            </div>
                        ))}
                    </div>

                    {showForm && (
                        <div className="clientOptions1">
                            <div className="form-header">
                                <span className="updateForm">Details</span>
                                <button 
                                    onClick={closeForm}
                                    className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75"
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
                                    <p className="ms-1">Attached File: {formData.attachFile || 'None'}</p>
                                </span>
                                <span className="formData_span">
                                    <p className="ms-1">Status: {selectedRequest?.status || 'Pending'}</p>
                                </span>

                                <span className="formData_span span_button">
                                    <button onClick={handleEditClick} disabled={isDeleting}>
                                        <CiEdit />
                                    </button>
                                    <button onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : <FaTrash />}
                                    </button>
                                </span>
                            </div>
                        </div>
                    )}

                    {showUpdate && (
                        <div className="update_Form">
                            <div className="form-header">
                                <span className="updateForm mt-1">Edit Request</span>
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

                                {/* Status removed from edit form - only admin can change it */}

                                <div className="updateForm_button mt-3">
                                    <button 
                                        type="submit" 
                                        className="me-3 save_btn"
                                        disabled={isSaving}
                                    >
                                        <p>{isSaving ? 'Saving...' : 'Save'}</p>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancel}
                                        className="me-4 cancel_btn"
                                        disabled={isSaving}
                                    >
                                        <p>Cancel</p>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClientRequest;