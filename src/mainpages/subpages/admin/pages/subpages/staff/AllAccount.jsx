import React, { useState, useEffect } from "react";

import { supabase } from "../../../../../../api/supabase";

import './AllAccount.css';

function AllAccount(){


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
                            <p className="mt-4 ms-2">Staffer</p>
                        </span>

                        <span className="mt-4 col-3">
                            <p>Segment</p>
                        </span>

                        <span className="mt-4 col-3">
                            <p>Position</p>
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
                            <span className="col-3">
                                <p className="ms-2 mt-2">{staff.segment}</p>
                            </span>
                            <span className="col-3">
                                <p className="ms-2 mt-2">{staff.position}</p>
                            </span>
                        </div>
                    ))
                )}

            </div>

        </>
    )
}

export default AllAccount;