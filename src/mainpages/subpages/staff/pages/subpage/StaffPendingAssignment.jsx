import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import { getUserData, getUserRole } from "../../../../../api/auth";
import './StaffPendingAssignment.css';

function StaffPendingAssignment() {
    const [showForm, setShowForm] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showInvitationList, setShowInvitationList] = useState(false);
    const [activeTab, setActiveTab] = useState('members');
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [currentUserPosition, setCurrentUserPosition] = useState('');
    const [invitingStaffId, setInvitingStaffId] = useState(null);

    useEffect(() => {
        fetchTasks();
        fetchCurrentUserPosition();
    }, []);

    // Fetch current user's position from staffDB
    const fetchCurrentUserPosition = async () => {
        try {
            const currentUser = getUserData();
            if (currentUser && currentUser.email) {
                const { data, error } = await supabase
                    .from('staffDB')
                    .select('position')
                    .eq('email', currentUser.email)
                    .single();
                
                if (!error && data) {
                    setCurrentUserPosition(data.position || '');
                }
            }
        } catch (err) {
            console.error('Error fetching user position:', err);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const currentUser = getUserData();
            
            if (!currentUser) {
                setError("No user logged in");
                setAccounts([]);
                return;
            }
            
            const userRole = getUserRole();
            const userFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
            const userEmail = currentUser.email;
            
            console.log('DEBUG - Current user:', {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                fullName: userFullName,
                email: userEmail,
                role: userRole
            });
            
            const isSectionHead = userRole === 'Section Head' || 
                                 userRole?.toLowerCase().includes('head');
            
            if (!isSectionHead) {
                setError(`Access restricted to section heads only. Your role: ${userRole}`);
                setAccounts([]);
                return;
            }
            
            // FIRST: Get ALL tasks to see what's in the database
            const { data: allTasks, error: allError } = await supabase
                .from('taskedTable')
                .select('*, clientFormrequest (*)')
                .order('created_at', { ascending: true });
            
            if (allError) {
                console.error('Error fetching all tasks:', allError);
                throw allError;
            }
            
            console.log('DEBUG - All tasks from database:', allTasks);
            
            // If no tasks at all in the database
            if (!allTasks || allTasks.length === 0) {
                console.log('DEBUG - No tasks found in the entire database');
                setAccounts([]);
                return;
            }
            
            // Filter tasks assigned to current user
            const userTasks = allTasks.filter(task => {
                const matchesName = task.assignedHead === userFullName;
                const matchesEmail = task.assignedHead === userEmail;
                
                console.log(`DEBUG - Comparing:`, {
                    taskId: task.tasked_id,
                    dbAssignedHead: task.assignedHead,
                    userFullName,
                    matchesName,
                    matchesEmail
                });
                
                return matchesName || matchesEmail;
            });
            
            console.log('DEBUG - Tasks assigned to current user:', userTasks);
            console.log('DEBUG - Number of tasks found for user:', userTasks.length);
            
            // For debugging: show all tasks temporarily
            if (userTasks.length === 0) {
                console.log('DEBUG - No tasks assigned to you. Showing all tasks for debugging.');
                
                // TEMPORARY: Show all tasks for debugging purposes
                // Remove this in production
                const transformedData = allTasks.map(task => ({
                    staff_id: task.tasked_id,
                    firstName: task.clientFormrequest?.requestType || 
                              task.clientFormrequest?.eventTitle || 
                              `Task #${task.tasked_id}`,
                    position: new Date(task.created_at).toLocaleDateString(),
                    assignedTo: task.assignedHead, // Show who it's assigned to
                    isAssignedToMe: task.assignedHead === userFullName,
                    _originalTask: task
                }));
                
                setAccounts(transformedData);
                // Don't set error here - just show the tasks
                return;
            }
            
            const transformedData = userTasks.map(task => ({
                staff_id: task.tasked_id,
                firstName: task.clientFormrequest?.requestType || 
                          task.clientFormrequest?.eventTitle || 
                          `Task #${task.tasked_id}`,
                position: new Date(task.created_at).toLocaleDateString(),
                _originalTask: task
            }));
            
            setAccounts(transformedData);
            
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all staff members with role "Staff" from staffDB
    const fetchStaffMembers = async () => {
        try {
            setLoadingStaff(true);
            
            const { data: staffData, error: staffError } = await supabase
                .from('staffDB')
                .select('*')
                .eq('role', 'Staff')
                .order('firstName', { ascending: true });
            
            if (staffError) {
                throw staffError;
            }
            
            // Check if each staff has already been invited for this task
            if (staffData && selectedTask && selectedTask.clientFormrequest?.request_id) {
                const requestId = selectedTask.clientFormrequest.request_id;
                const { data: existingInvitations } = await supabase
                    .from('staffInvitation')
                    .select('staff_id')
                    .eq('request_id', requestId);
                
                const invitedStaffIds = existingInvitations?.map(inv => inv.staff_id) || [];
                
                // Add invitation status to each staff member
                const staffWithInvitationStatus = staffData.map(staff => ({
                    ...staff,
                    isInvited: invitedStaffIds.includes(staff.staff_id)
                }));
                
                setStaffMembers(staffWithInvitationStatus || []);
            } else {
                setStaffMembers(staffData || []);
            }
            
        } catch (err) {
            console.error('Error fetching staff members:', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    // Handle sending invitation
    const handleSendInvitation = async (staff) => {
        if (!selectedTask || !selectedTask.clientFormrequest?.request_id) {
            alert('No task selected');
            return;
        }
        
        try {
            setInvitingStaffId(staff.staff_id);
            
            // Insert invitation into staffInvitation table
            const { data, error } = await supabase
                .from('staffInvitation')
                .insert({
                    request_id: selectedTask.clientFormrequest.request_id,
                    staff_id: staff.staff_id,
                    invitations_status: 'pending' // or 'sent' depending on your needs
                })
                .select();
            
            if (error) {
                throw error;
            }
            
            // Update local state to show invited status
            setStaffMembers(prev => prev.map(s => 
                s.staff_id === staff.staff_id 
                    ? { ...s, isInvited: true }
                    : s
            ));
            
            console.log('Invitation sent successfully:', data);
            
        } catch (err) {
            console.error('Error sending invitation:', err);
            alert('Failed to send invitation. Please try again.');
        } finally {
            setInvitingStaffId(null);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedTask(null);
        setShowInvitationList(false);
        setActiveTab('members');
        setInvitingStaffId(null);
    };

    const handleTaskAction = (account) => {
        setSelectedTask(account._originalTask);
        setShowForm(true);
    };

    const handleInvitation = () => {
        fetchStaffMembers(); // Fetch staff when opening invitation list
        setShowInvitationList(true);
    };

    // Filter staff members based on current tab
    const getFilteredStaff = () => {
        if (!staffMembers.length) return [];
        
        if (activeTab === 'members') {
            // Show staff with same position as current user AND role is "Staff"
            return staffMembers.filter(staff => 
                staff.position === currentUserPosition && 
                staff.role === 'Staff'
            );
        } else {
            // Show staff with different position but role is "Staff"
            return staffMembers.filter(staff => 
                staff.position !== currentUserPosition && 
                staff.role === 'Staff'
            );
        }
    };

    const filteredStaff = getFilteredStaff();

    return (
        <>
            <div className="row_header">
                <span className="ms-1 col-5">
                    <p className="mt-4 ms-2">Title</p>
                </span>
                <span className="mt-4 col-4 ms-3">
                    <p>Date Received</p>
                </span>
                <span className="mt-4 col-3 ms-1">
                    <p className="ms-5">Action</p>
                </span>
            </div>

            {showForm && selectedTask && (
                <div className="delete_staff1">
                    <div className="deleteform_header1">
                        <span className="mt-3 ms-2">
                            <p className="mt-4">Task Details</p>
                        </span>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>
                    <div className="deleteform_body1 mt-2">
                        <div className="question">
                            <p className="mt-3 ms-2">
                                <strong>Task #{selectedTask.tasked_id}</strong><br />
                                <strong>Assigned By:</strong> {selectedTask.assignedBy}<br />
                                <strong>Admin Position:</strong> {selectedTask.adminPosition}<br />
                                <strong>Assigned Date:</strong> {new Date(selectedTask.created_at).toLocaleDateString()}<br />
                                {selectedTask.clientFormrequest && (
                                    <>
                                        <strong>Request:</strong> {selectedTask.clientFormrequest.requestType}<br />
                                        <strong>Event Title:</strong> {selectedTask.clientFormrequest.eventTitle}<br />
                                        <strong>Description:</strong> {selectedTask.clientFormrequest.description}
                                    </>
                                )}
                            </p>
                        </div>
                        <span className="delete_buttons1">
                            <button className="assign_closebtn" onClick={closeForm}>Close</button>
                            <button className="assign_btn" onClick={() => handleInvitation()}>Assign Staff</button>
                        </span>
                    </div>
                </div>
            )}

            {showInvitationList && (
                <div className="invitationList">
                    <div className="invitationList_header">
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                        <span className="send_invi">
                            <p className="mt-4">Send Invitation to:</p>
                        </span>
                    </div>

                    <div className="invitationList_body">
                        {/* Tab Options */}
                        <div className="invitationList_options">
                            <span 
                                onClick={() => setActiveTab('members')}
                                className={activeTab === 'members' ? 'active-tab' : ''}
                            >
                                <p className="mt-2">Members</p>
                            </span>
                            <span 
                                onClick={() => setActiveTab('others')}
                                className={activeTab === 'others' ? 'active-tab' : ''}
                            >
                                <p className="mt-2">Others</p>
                            </span>
                        </div>

                        {/* Tab Content */}
                        {loadingStaff ? (
                            <div className="loading-staff">
                                <p className="ms-4 mt-2">Loading staff members...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'members' && (
                                    <div className="invitationList_members">
                                        {filteredStaff.length === 0 ? (
                                            <div className="no-staff">
                                                <p className="ms-4 mt-2">
                                                    {currentUserPosition 
                                                        ? `No staff members with position: ${currentUserPosition}`
                                                        : 'No staff members available'}
                                                </p>
                                            </div>
                                        ) : (
                                            filteredStaff.map((staff) => (
                                                <div key={staff.staff_id} className="member-item">
                                                    <span>
                                                        <p className="ms-4 mt-2">{staff.firstName} {staff.lastName}</p>
                                                    </span>
                                                    {staff.isInvited ? (
                                                        <p className="invited-text mt-2 me-4">Invited</p>
                                                    ) : (
                                                        <button 
                                                            className="invite-btn mt-1 me-4"
                                                            onClick={() => handleSendInvitation(staff)}
                                                            disabled={invitingStaffId === staff.staff_id}
                                                        >
                                                            {invitingStaffId === staff.staff_id ? 'Sending...' : 'Invite'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === 'others' && (
                                    <div className="invitationList_others">
                                        {filteredStaff.length === 0 ? (
                                            <div className="no-staff">
                                                <p className="ms-4 mt-2">No other staff members available</p>
                                            </div>
                                        ) : (
                                            filteredStaff.map((staff) => (
                                                <div key={staff.staff_id} className="other-item">
                                                    <p className="ms-4 mt-2">{staff.firstName} {staff.lastName}</p>
                                                    {staff.isInvited ? (
                                                        <p className="invited-text mt-2 me-4">Invited</p>
                                                    ) : (
                                                        <button 
                                                            className="invite-btn mt-1 me-2"
                                                            onClick={() => handleSendInvitation(staff)}
                                                            disabled={invitingStaffId === staff.staff_id}
                                                        >
                                                            {invitingStaffId === staff.staff_id ? 'Sending...' : 'Invite'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="row_datacell">
                {loading ? (
                    <div className="no-data">Loading tasks...</div>
                ) : error ? (
                    <div className="no-data">{error}</div>
                ) : accounts.length === 0 ? (
                    <div className="no-data">No tasks assigned to you</div>
                ) : (
                    accounts.map((account) => (
                        <div key={account.staff_id} className="account-row">
                            <span className="col-5">
                                <p className="ms-3 mt-2">{account.firstName}</p>
                            </span>
                            <span className="col-4 ms-2">
                                <p className="ms-2 mt-2">{account.position}</p>
                            </span>
                            <span 
                                className="col-2 ms-3 action_span" 
                                onClick={() => handleTaskAction(account)}
                            >
                                <span className="span_dots"></span>
                                <span className="span_dots"></span>
                                <span className="span_dots"></span>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default StaffPendingAssignment;