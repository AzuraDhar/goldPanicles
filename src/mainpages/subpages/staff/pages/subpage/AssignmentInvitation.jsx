import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './AssignmentInvitation.css';

function AssignmentInvitation() {
    const [showForm, setShowForm] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvitation, setSelectedInvitation] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch invitations with staff and request information
            const { data, error } = await supabase
                .from('staffInvitation')
                .select(`
                    *,
                    staffDB (*),
                    clientFormrequest (*)
                `)
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            // Transform data to match the table structure
            const transformedData = (data || []).map(invitation => ({
                staff_id: invitation.invitation_id, // Use invitation_id as unique key
                firstName: invitation.clientFormrequest?.eventTitle || 
                          invitation.clientFormrequest?.requestType || 
                          `Task #${invitation.request_id?.slice(0, 8)}`,
                position: invitation.staffDB ? 
                         `${invitation.staffDB.firstName} ${invitation.staffDB.lastName}` : 
                         'Unknown Staff',
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

    const handleInvitationAction = (account) => {
        setSelectedInvitation(account._originalInvitation);
        setShowForm(true);
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'accepted': return '#28a745'; // green
            case 'rejected': return '#dc3545'; // red
            case 'cancelled': return '#ffc107'; // orange/yellow
            case 'completed': return '#17a2b8'; // teal
            default: return '#6c757d'; // gray for pending
        }
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
            fetchInvitations();
            closeForm();
        } catch (err) {
            console.error('Error updating invitation status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    return (
        <>
            <div className="row_header">
                <span className="ms-1 col-5">
                    <p className="mt-4 ms-2">Title</p>
                </span>
                <span className="mt-4 col-4 ms-3">
                    <p>Sent to</p>
                </span>
                <span className="mt-4 col-2 ms-1">
                    <p className="ms-5">Status</p>
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
                        <span className="question">
                            <p className="mt-3 ms-2">
                                <strong>Invitation #{selectedInvitation.invitation_id?.slice(0, 8)}</strong><br />
                                <strong>Title:</strong> {selectedInvitation.clientFormrequest?.eventTitle || selectedInvitation.clientFormrequest?.requestType}<br />
                                <strong>Sent to:</strong> {selectedInvitation.staffDB?.firstName} {selectedInvitation.staffDB?.lastName}<br />
                                <strong>Position:</strong> {selectedInvitation.staffDB?.position}<br />
                                <strong>Email:</strong> {selectedInvitation.staffDB?.email}<br />
                                <strong>Date Sent:</strong> {new Date(selectedInvitation.created_at).toLocaleDateString()}<br />
                                <strong>Current Status:</strong> <span style={{
                                    color: getStatusColor(selectedInvitation.invitations_status),
                                    fontWeight: 'bold'
                                }}>{selectedInvitation.invitations_status || 'pending'}</span>
                            </p>
                        </span>
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
                            {(selectedInvitation.invitations_status === 'pending' || selectedInvitation.invitations_status === 'accepted') && (
                                <button 
                                    className="bg-warning"
                                    onClick={() => updateInvitationStatus('cancelled')}
                                >
                                    Cancel
                                </button>
                            )}
                        </span>
                    </div>
                </div>
            )}

            <div className="row_datacell">
                {loading ? (
                    <div className="no-data">Loading invitations...</div>
                ) : error ? (
                    <div className="no-data">{error}</div>
                ) : accounts.length === 0 ? (
                    <div className="no-data">No invitations found</div>
                ) : (
                    accounts.map((account) => (
                        <div key={account.staff_id} className="account-row">
                            <span className="col-5">
                                <p className="ms-3 mt-2">{account.firstName}</p>
                            </span>
                            <span className="col-4 ms-2">
                                <p className="ms-2 mt-2">{account.position}</p>
                            </span>
                            <span className="col-2 ms-5">
                                <p 
                                    className="ms-2 mt-2" 
                                    style={{
                                        color: getStatusColor(account.status),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {account.status}
                                </p>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default AssignmentInvitation;