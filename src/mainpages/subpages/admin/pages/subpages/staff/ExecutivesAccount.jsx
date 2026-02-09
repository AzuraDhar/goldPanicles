import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../../api/supabase";
import './ExecutivesAccount.css';

function ExecutivesAccount() {
    const [showForm, setShowForm] = useState(false);
    const [showSched, setShowSched] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleData, setScheduleData] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [selectedStaffName, setSelectedStaffName] = useState("");

    // Define all time slots and days
    const timeSlots = [
        "seven_am", "seventhirty_am", "eight_am", "eightthirty_am",
        "nine_am", "ninethirty_am", "ten_am", "tenthirty_am",
        "eleven_am", "eleventhirty_am", "twelve_pm", "twelvethirty_pm",
        "one_pm", "onethirty_pm", "two_pm", "twothirty_pm",
        "three_pm", "threethirty_pm", "four_pm", "fourthirty_pm",
        "five_pm", "fivethirty_pm", "six_pm", "sixthirty_pm",
        "seven_pm"
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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

    const loadStaffSchedule = async (staffId, staffName) => {
        try {
            setSelectedStaffId(staffId);
            setSelectedStaffName(staffName);
            
            const newScheduleData = {
                monday: Array(25).fill(""),
                tuesday: Array(25).fill(""),
                wednesday: Array(25).fill(""),
                thursday: Array(25).fill(""),
                friday: Array(25).fill(""),
                saturday: Array(25).fill(""),
                sunday: Array(25).fill("")
            };

            // Load schedule for each day for this specific staff member
            for (const day of days) {
                const { data, error } = await supabase
                    .from(day)
                    .select('*')
                    .eq('user_id', staffId) // Filter by this staff's user_id
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) {
                    console.error(`Error loading ${day} schedule for staff ${staffId}:`, error);
                    continue; // Continue with other days if one fails
                }

                if (data && data.length > 0) {
                    // Map database data to array format
                    const dayData = timeSlots.map(slot => data[0][slot] || "");
                    newScheduleData[day] = dayData;
                } else {
                    // No schedule saved for this day, leave as empty array (will show "-")
                    newScheduleData[day] = Array(25).fill("");
                }
            }

            setScheduleData(newScheduleData);
            setShowSched(true);
        } catch (error) {
            console.error('Error loading schedule data:', error);
            alert('Error loading schedule. Please try again.');
        }
    };

    const handleSchedClick = async (staff) => {
        const staffName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim();
        await loadStaffSchedule(staff.staff_id, staffName);
    };

    if (loading) {
        return <div className="loading">Loading accounts...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    const closeForm = () => {
        setShowForm(false);
        setShowSched(false);
        setSelectedStaffId(null);
        setSelectedStaffName("");
    };

    return (
        <>
            <div className="row_header">
                <span className="ms-1 col-5">
                    <p className="mt-4 ms-2">Staffer</p>
                </span>
                <span className="mt-4 col-2 ms-3">
                    <p>Position</p>
                </span>
                <span className="mt-4 col-1 ms-1">
                    <p>Action</p>
                </span>
                <span className="mt-4 col-3"></span>
            </div>

            {showForm && (
                <div className="delete_staff2">
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
                    <div className="deleteform_body2 mt-2">
                        <span className="question">
                            <p className="mt-3 ms-2">Are you sure you want to delete <br /> this account ?</p>
                        </span>
                        <span className="delete_buttons mt-4">
                            <button>Cancel</button>
                            <button className="bg-danger">Delete</button>
                        </span>
                    </div>
                </div>
            )}

            {showSched && scheduleData && (
                <div className="display_sched mb-5">
                    <div className="sched_header">
                        <p>{selectedStaffName}'s Class Schedule and Availability</p>
                        <button 
                            onClick={closeForm}
                            className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                        >
                            ×
                        </button>
                    </div>

                    <div className="schedule-table-view">
                        <div className="dateHeader">
                            <span className="timeSpan">Time</span>
                            <span>Monday</span>
                            <span>Tuesday</span>
                            <span>Wednesday</span>
                            <span>Thursday</span>
                            <span>Friday</span>
                            <span>Saturday</span>
                            <span className="sundayRight">Sunday</span>
                        </div>

                        <div className="dateBody">  
                            <div className="dateColumn timeColumn">
                                <span className="timeSlot">07:00 - 07:30 AM</span>
                                <span className="timeSlot">07:30 - 08:00 AM</span>
                                <span className="timeSlot">08:00 - 08:30 AM</span>
                                <span className="timeSlot">08:30 - 09:00 AM</span>
                                <span className="timeSlot">09:00 - 09:30 AM</span>
                                <span className="timeSlot">09:30 - 10:00 AM</span>
                                <span className="timeSlot">10:00 - 10:30 AM</span>
                                <span className="timeSlot">10:30 - 11:00 AM</span>
                                <span className="timeSlot">11:00 - 11:30 AM</span>
                                <span className="timeSlot">11:30 - 12:00 PM</span>
                                <span className="timeSlot">12:00 - 12:30 PM</span>
                                <span className="timeSlot">12:30 - 01:00 PM</span>
                                <span className="timeSlot">01:00 - 01:30 PM</span>
                                <span className="timeSlot">01:30 - 02:00 PM</span>
                                <span className="timeSlot">02:00 - 02:30 PM</span>
                                <span className="timeSlot">02:30 - 03:00 PM</span>
                                <span className="timeSlot">03:00 - 03:30 PM</span>
                                <span className="timeSlot">03:30 - 04:00 PM</span>
                                <span className="timeSlot">04:00 - 04:30 PM</span>
                                <span className="timeSlot">04:30 - 05:00 PM</span>
                                <span className="timeSlot">05:00 - 05:30 PM</span>
                                <span className="timeSlot">05:30 - 06:00 PM</span>
                                <span className="timeSlot">06:00 - 06:30 PM</span>
                                <span className="timeSlot">06:30 - 07:00 PM</span>
                                <span className="timeSlot">07:00 - 07:30 PM</span>
                            </div>

                            {/* Monday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.monday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Tuesday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.tuesday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Wednesday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.wednesday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Thursday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.thursday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Friday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.friday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Saturday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.saturday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>

                            {/* Sunday Column */}
                            <div className="dateColumn monday">
                                {scheduleData.sunday.map((value, index) => (
                                    <span key={index} className="schedule-cell">
                                        <p className="mt-3">{value || "-"}</p>
                                    </span>
                                ))}
                            </div>
                        </div>
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
                                <p className="ms-3 mt-2">{staff.firstName} {staff.lastName}</p>
                            </span>
                            <span className="col-2 ms-2">
                                <p className="ms-2 mt-2">{staff.position}</p>
                            </span>
                            <span className="col-1 ms-1 action_span" onClick={() => setShowForm(true)}>
                                <span className="span_dots"></span>
                                <span className="span_dots"></span>
                                <span className="span_dots"></span>
                            </span>
                            <span className="col-3 sched_button">
                                <button 
                                    className="view_sched" 
                                    onClick={() => handleSchedClick(staff)}
                                >
                                    View schedule and Availability
                                </button>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default ExecutivesAccount;