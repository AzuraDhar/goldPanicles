import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../api/supabase";
import './StaffPendingAssignment.css';

function StaffPendingAssignment() {
    const [showForm, setShowForm] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const { data, error } = await supabase
                .from('staffDB')
                .select('*')
                .eq('segment', 'executive')
                .order('created_at', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            setAccounts(data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
    };
    

    

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

            {showForm && (
                <div className="delete_staff">
                    <div className="deleteform_header">
                        <span className="mt-3 ms-2">
                            <p className="mt-4">Delete account ?</p>
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
                            <p className="mt-3 ms-2">Are you sure you want to delete <br /> this account ?</p>
                        </span>
                        <span className="delete_buttons">
                            <button onClick={closeForm}>Cancel</button>
                            <button className="bg-danger">Delete</button>
                        </span>
                    </div>
                </div>
            )}

            <div className="row_datacell">
                {accounts.length === 0 ? (
                    <div className="no-data">No accounts found</div>
                ) : (
                    accounts.map((staff) => (
                        <div key={staff.staff_id} className="account-row">
                            <span className="col-5">
                                <p className="ms-3 mt-2">{staff.firstName}</p>
                            </span>
                            <span className="col-4 ms-2">
                                <p className="ms-2 mt-2">{staff.position}</p>
                            </span>
                            <span className="col-2 ms-3 action_span" onClick={() => setShowForm(true)}>
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