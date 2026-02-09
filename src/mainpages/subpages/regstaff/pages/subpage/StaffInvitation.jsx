import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import { getUserData } from "../../../../../api/auth";
import './StaffInvitation.css';

function StaffInvitation() {
    const [showForm, setShowForm] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStaffId, setCurrentStaffId] = useState(null);
    const [selectedInvitation, setSelectedInvitation] = useState(null);

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
                fetchInvitations(data.staff_id);
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

    // Fetch invitations for the current staff member
    const fetchInvitations = async (staffId) => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch invitations for this staff member with task details
            const { data, error } = await supabase
                .from('staffInvitation')
                .select(`
                    *,
                    clientFormrequest (*)
                `)
                .eq('staff_id', staffId)
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            // Transform data to show in the table
            const transformedData = (data || []).map(invitation => ({
                invitation_id: invitation.invitation_id,
                title: invitation.clientFormrequest?.eventTitle || 
                       invitation.clientFormrequest?.requestType || 
                       `Task #${invitation.request_id?.slice(0, 8)}`,
                date_received: new Date(invitation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                status: invitation.invitations_status || 'pending',
                _originalInvitation: invitation
            }));
            
            setAccounts(transformedData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching invitations:', err);
        } finally {
            setLoading(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedInvitation(null);
    };

    const handleRowClick = (invitation) => {
        setSelectedInvitation(invitation._originalInvitation);
        setShowForm(true);
    };

    const updateInvitationStatus = async (newStatus) => {
        if (!selectedInvitation) return;
        
        try {
            const { error } = await supabase
                .from('staffInvitation')
                .update({ invitations_status: newStatus })
                .eq('invitation_id', selectedInvitation.invitation_id);
            
            if (error) {
                throw error;
            }
            
            // Refresh the list
            fetchInvitations(currentStaffId);
            closeForm();
        } catch (err) {
            console.error('Error updating invitation status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading) {
        return <div className="loading">Loading invitations...</div>;
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

            {showForm && selectedInvitation && (
                <div className="delete_staff">
                    <div className="deleteform_header">
                        <span className="mt-3 ms-2">
                            <p className="mt-4">Invitation Details</p>
                        </span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>
                    <div className="deleteform_body mt-2">
                        <div className="question">
                            <p className="mt-3 ms-2">
                                <strong>Task Invitation</strong><br /><br />
                                <strong>Title:</strong> {selectedInvitation.clientFormrequest?.eventTitle || selectedInvitation.clientFormrequest?.requestType}<br />
                                <strong>Description:</strong> {selectedInvitation.clientFormrequest?.description || 'No description available'}<br />
                                <strong>Date Invited:</strong> {new Date(selectedInvitation.created_at).toLocaleDateString()}<br />
                                <strong>Current Status:</strong> <span style={{
                                    color: selectedInvitation.invitations_status === 'accepted' ? 'green' : 
                                           selectedInvitation.invitations_status === 'rejected' ? 'red' : 
                                           selectedInvitation.invitations_status === 'cancelled' ? 'orange' : 'blue',
                                    fontWeight: 'bold'
                                }}>{selectedInvitation.invitations_status || 'pending'}</span>
                            </p>
                        </div>
                        <span className="delete_buttons">
                            <button onClick={closeForm}>Close</button>
                            {selectedInvitation.invitations_status === 'pending' && (
                                <>
                                    <button 
                                        className="bg-success" 
                                        onClick={() => updateInvitationStatus('accepted')}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        className="bg-danger"
                                        onClick={() => updateInvitationStatus('rejected')}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </span>
                    </div>
                </div>
            )}

            <div className="row_datacell">
                {accounts.length === 0 ? (
                    <div className="no-data">No invitations found</div>
                ) : (
                    accounts.map((invitation) => (
                        <div 
                            key={invitation.invitation_id} 
                            className="account-row clickable-row"
                            onClick={() => handleRowClick(invitation)}
                        >
                            <span className="col-6">
                                <p className="ms-3 mt-2">{invitation.title}</p>
                            </span>
                            <span className="col-6 date_received">
                                <p className="me-3 mt-2">{invitation.date_received}</p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default StaffInvitation; 