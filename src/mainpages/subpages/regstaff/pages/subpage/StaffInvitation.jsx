import React, { useState, useEffect } from "react";

import { supabase } from "../../../../../api/supabase";

import './StaffInvitation.css';

function StaffInvitation(){


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
                    .select('*');
                
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

        if (loading) {
        return <div className="loading">Loading accounts...</div>;
        }

        if (error) {
            return <div className="error">Error: {error}</div>;
        }

        

    return(
        <>

            <div className="row_header">

                        <span className="ms-1 col-6">
                            <p className="mt-4 ms-2">Title</p>
                        </span>

                        <span className="mt-4 col-6 date_received">
                            <p className="me-4">Date Received</p>
                        </span>

            </div>

            <div className="row_datacell">

                {accounts.length === 0 ? (
                    <div className="no-data">No accounts found</div>
                ) : (
                    accounts.map((staff) => (
                        <div key={staff.staff_id} className="account-row">
                            <span className="col-6">
                                <p className="ms-3 mt-2">{staff.firstName}</p>
                            </span>
                            
                            <span className="col-6 date_received">
                                <p className="me-3 mt-2">{staff.position}</p>
                            </span>
                        </div>
                    ))
                )}

            </div>

        </>
    )
}

export default StaffInvitation;