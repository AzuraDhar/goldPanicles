import React, { useState, useEffect } from "react";
import { supabase } from "../../../../api/supabase";
import './AdminMainDashboard.css';

function AdminMainDashboard() {
    const [sectionHeads, setSectionHeads] = useState([]);
    const [tasksCleared, setTasksCleared] = useState({}); // Store tasks cleared per section head
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalRequests, setTotalRequests] = useState(0);
    const [approvedRequests, setApprovedRequests] = useState(0);
    const [deniedRequests, setDeniedRequests] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);

    useEffect(() => {
        fetchSectionHeads();
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        if (sectionHeads.length > 0) {
            fetchAcceptedInvitationsCount();
        }
    }, [sectionHeads]);

    // Fetch Section Heads from staffDB table
    const fetchSectionHeads = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('staffDB')
                .select('*')
                .eq('role', 'Section Head')
                .order('created_at', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            setSectionHeads(data || []);
        } catch (error) {
            console.error("Error fetching section heads:", error);
            setError("Failed to load section heads");
        } finally {
            setLoading(false);
        }
    };

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
        try {
            // Fetch total number of requests
            const { count: totalCount, error: totalError } = await supabase
                .from('clientFormrequest')
                .select('*', { count: 'exact', head: true });
            
            if (!totalError) {
                setTotalRequests(totalCount || 0);
            }

            // Fetch approved requests count
            const { count: approvedCount, error: approvedError } = await supabase
                .from('clientFormrequest')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approve');
            
            if (!approvedError) {
                setApprovedRequests(approvedCount || 0);
            }

            // Fetch denied requests count
            const { count: deniedCount, error: deniedError } = await supabase
                .from('clientFormrequest')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'denied');
            
            if (!deniedError) {
                setDeniedRequests(deniedCount || 0);
            }

            // Fetch completed tasks count based on staffInvitation table (accepted status)
            const { count: completedCount, error: completedError } = await supabase
                .from('staffInvitation')
                .select('*', { count: 'exact', head: true })
                .eq('invitations_status', 'accepted');
            
            if (!completedError) {
                setCompletedTasks(completedCount || 0);
            }

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    // Fetch accepted invitations and count them for Section Heads based on position matching
    const fetchAcceptedInvitationsCount = async () => {
        try {
            // Fetch ALL accepted invitations with staff position information
            const { data: acceptedInvitations, error: invitationsError } = await supabase
                .from('staffInvitation')
                .select(`
                    *,
                    staffDB:staff_id (
                        position
                    )
                `)
                .eq('invitations_status', 'accepted');
            
            if (invitationsError) {
                console.error("Error fetching accepted invitations:", invitationsError);
                
                // Set all to 0 on error
                const tasksCount = {};
                sectionHeads.forEach(sectionHead => {
                    tasksCount[sectionHead.staff_id] = 0;
                });
                setTasksCleared(tasksCount);
                return;
            }

            // Create position counts from accepted invitations
            const positionCounts = {};
            
            // Count accepted invitations by position
            if (acceptedInvitations && acceptedInvitations.length > 0) {
                acceptedInvitations.forEach(invitation => {
                    const staffPosition = invitation.staffDB?.position;
                    if (staffPosition) {
                        const position = staffPosition.trim();
                        positionCounts[position] = (positionCounts[position] || 0) + 1;
                    }
                });
            }

            // Assign counts to Section Heads based on matching positions
            const tasksCount = {};
            
            sectionHeads.forEach(sectionHead => {
                const sectionHeadPosition = sectionHead.position ? sectionHead.position.trim() : '';
                
                // If Section Head has a position, check if there are accepted invitations for that position
                if (sectionHeadPosition && positionCounts[sectionHeadPosition]) {
                    tasksCount[sectionHead.staff_id] = positionCounts[sectionHeadPosition];
                } else {
                    tasksCount[sectionHead.staff_id] = 0;
                }
            });

            setTasksCleared(tasksCount);
            
        } catch (error) {
            console.error("Error fetching accepted invitations count:", error);
            
            // Set all to 0 on error
            const tasksCount = {};
            sectionHeads.forEach(sectionHead => {
                tasksCount[sectionHead.staff_id] = 0;
            });
            setTasksCleared(tasksCount);
        }
    };

    // Get tasks cleared for a specific section head
    const getTasksClearedForSectionHead = (staffId) => {
        return tasksCleared[staffId] || 0;
    };

    if (loading) {
        return (
            <div className="dash_mainContainer">
                <div className="header">
                    <span className="ms-2">Dashboard</span>
                </div>
                <div className="loading-section-heads">
                    Loading dashboard data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dash_mainContainer">
                <div className="header">
                    <span className="ms-2">Dashboard</span>
                </div>
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="dash_mainContainer">
                <div className="header">
                    <span className="ms-2">Dashboard</span>
                </div>

                <div className="task_status mb-1">
                    <div className="card_list">
                        <span className="card_header">Total no. of request</span>
                        <span className="card_body">{totalRequests}</span>
                    </div>
                    <div className="card_list">
                        <span className="card_header">Total no. of approved request</span>
                        <span className="card_body">{approvedRequests}</span>
                    </div>
                    <div className="card_list">
                        <span className="card_header">Total no. of denied request</span>
                        <span className="card_body">{deniedRequests}</span>
                    </div>
                    <div className="card_list">
                        <span className="card_header">Total no. of completed task</span>
                        <span className="card_body">{completedTasks}</span>
                    </div>
                </div>

                <div className="tasklist">
                    <div className="tasklist_header">
                        <p className="ms-3 mt-4">Task distribution</p>
                    </div>

                    <div className="tasklist_rowHead">
  <div className="staffer">Staffer</div>
  <div className="cleared_task">No. of task catered</div>
</div>


                    <div className="tasklist_listbody">
                        {sectionHeads.length === 0 ? (
                            <div className="no-requests">
                                <p>No Section Heads found.</p>
                            </div>
                        ) : (
                            sectionHeads.map((sectionHead) => {
                                const fullName = `${sectionHead.firstName || ''} ${sectionHead.lastName || ''}`.trim();
                                const tasksClearedCount = getTasksClearedForSectionHead(sectionHead.staff_id);
                                
                                return (
                                    <div key={sectionHead.staff_id} className="list_container">
                                        <span>
                                            <p className="ms-3 mt-2">{fullName}</p>
                                        </span>
                                        <span className="no_task">
                                            <p className="me-5 mt-2">{tasksClearedCount}</p>
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminMainDashboard;