import React, { useState, useEffect } from "react";
import { supabase } from "../../../../api/supabase";
import { getUserId } from "../../../../api/auth"; // Import getUserId function
import './MySched.css';

function MySched() {
    // Define all time slots mapping to database column names
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
    
    // Add a reload trigger state
    const [reloadTrigger, setReloadTrigger] = useState(0);
    
    // State to hold all schedule data
    const [scheduleData, setScheduleData] = useState({
        monday: Array(25).fill(""),
        tuesday: Array(25).fill(""),
        wednesday: Array(25).fill(""),
        thursday: Array(25).fill(""),
        friday: Array(25).fill(""),
        saturday: Array(25).fill(""),
        sunday: Array(25).fill("")
    });

    const [recordIds, setRecordIds] = useState({
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
    });

    const [isSaving, setIsSaving] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Get current user ID on component mount
    useEffect(() => {
        const fetchUserId = () => {
            try {
                const userId = getUserId(); // Get user ID from auth
                if (userId) {
                    setCurrentUserId(userId);
                } else {
                    console.error("No user ID found. User might not be logged in.");
                    // You might want to redirect to login here
                }
            } catch (error) {
                console.error("Error getting user ID:", error);
            }
        };
        
        fetchUserId();
    }, []);

    // Load data when userId is available AND when reloadTrigger changes
    useEffect(() => {
        if (currentUserId) {
            loadAllSchedules();
        }
    }, [currentUserId, reloadTrigger]);

    const loadAllSchedules = async () => {
        if (!currentUserId) {
            console.error("Cannot load schedules: No user ID");
            return;
        }

        try {
            const newScheduleData = { ...scheduleData };
            const newRecordIds = { ...recordIds };

            for (const day of days) {
                const { data, error } = await supabase
                    .from(day)
                    .select('*')
                    .eq('user_id', currentUserId) // Filter by user_id
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    newRecordIds[day] = data[0].id;
                    // Map database data to array format
                    const dayData = timeSlots.map(slot => data[0][slot] || "");
                    newScheduleData[day] = dayData;
                } else {
                    // No existing schedule for this day, reset to empty
                    newRecordIds[day] = null;
                    newScheduleData[day] = Array(25).fill("");
                }
            }

            setScheduleData(newScheduleData);
            setRecordIds(newRecordIds);
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    };

    const handleInputChange = (day, index, value) => {
        setScheduleData(prev => ({
            ...prev,
            [day]: prev[day].map((item, i) => i === index ? value : item)
        }));
    };

    const saveAllSchedules = async () => {
        if (!currentUserId) {
            alert('Please log in to save your schedule.');
            return;
        }

        setIsSaving(true);
        try {
            const savePromises = days.map(async (day) => {
                // Convert array data to object format for database
                const dataToSave = {};
                timeSlots.forEach((slot, index) => {
                    dataToSave[slot] = scheduleData[day][index] || "";
                });
                
                // Add user_id to the data
                dataToSave.user_id = currentUserId;

                if (recordIds[day]) {
                    // Update existing record for this user
                    const { data, error } = await supabase
                        .from(day)
                        .update(dataToSave)
                        .eq('id', recordIds[day])
                        .eq('user_id', currentUserId); // Ensure we're updating the user's own record
                        
                    if (error) throw error;
                    return { data, error };
                } else {
                    // Create new record for this user
                    const { data, error } = await supabase
                        .from(day)
                        .insert([dataToSave])
                        .select();

                    if (error) throw error;
                    
                    if (data && data.length > 0) {
                        setRecordIds(prev => ({
                            ...prev,
                            [day]: data[0].id
                        }));
                    }
                    return { data, error };
                }
            });

            await Promise.all(savePromises);
            
            // Show success message
            alert('All schedules saved successfully!');
            
            // Trigger reload of this component only
            setReloadTrigger(prev => prev + 1);
            
        } catch (error) {
            console.error('Error saving all schedules:', error);
            alert('Error saving schedules. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // If no user ID, show a message
    if (!currentUserId) {
        return (
            <div className="loading">
                Please log in to view and edit your schedule.
            </div>
        );
    }

    return (
        <>
            <div className="display_sched">
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
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('monday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Tuesday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.tuesday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('tuesday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Wednesday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.wednesday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('wednesday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Thursday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.thursday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('thursday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Friday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.friday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('friday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Saturday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.saturday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('saturday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Sunday Column */}
                    <div className="dateColumn monday">
                        {scheduleData.sunday.map((value, index) => (
                            <span key={index}>
                                <input 
                                    type="text" 
                                    placeholder="+"
                                    value={value}
                                    onChange={(e) => handleInputChange('sunday', index, e.target.value)}
                                />
                            </span>
                        ))}
                    </div>
                </div>

            </div>
            
            {/* Save All Button - Added at the bottom */}
            <div className="saveSched">
                <button
                    className="me-5"
                    onClick={saveAllSchedules} 
                    disabled={isSaving || !currentUserId}
                >
                    {isSaving ? 'Saving All Schedules...' : 'Save All Schedules'}
                </button>
            </div>
            
        </>
    )
}

export default MySched;