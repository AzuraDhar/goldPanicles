import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "../../../../api/supabase";
import './StaffCalendar.css';

function StaffCalendar() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formMode, setFormMode] = useState('view');
    const [eventTitle, setEventTitle] = useState("");
    const [eventTime, setEventTime] = useState("09:00");
    const [eventDescription, setEventDescription] = useState("");
    const [monthEvents, setMonthEvents] = useState({}); // Store events by date for the current month view

    // Format date as YYYY-MM-DD for Supabase
    const formatDateForQuery = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date for display in input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Load events for the current month view
    const loadMonthEvents = async (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Calculate start and end of month
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        
        const startDate = formatDateForQuery(firstDay);
        const endDate = formatDateForQuery(lastDay);
        
        try {
            // Fetch events from both tables for the entire month
            const [clientEventsResponse, adminEventsResponse] = await Promise.all([
                supabase
                    .from('clientFormrequest')
                    .select('*')
                    .gte('date', startDate)
                    .lte('date', endDate),
                supabase
                    .from('adminEvent')
                    .select('*')
                    .gte('date', startDate)
                    .lte('date', endDate)
            ]);
            
            const clientEvents = clientEventsResponse.data || [];
            const adminEvents = adminEventsResponse.data || [];
            
            // Combine all events
            const allEvents = [...clientEvents, ...adminEvents];
            
            // Group events by date
            const eventsByDate = {};
            allEvents.forEach(event => {
                if (!eventsByDate[event.date]) {
                    eventsByDate[event.date] = [];
                }
                eventsByDate[event.date].push(event);
            });
            
            setMonthEvents(eventsByDate);
        } catch (error) {
            console.error('Error loading month events:', error);
        }
    };

    // Handle active start date change (when month changes)
    const handleActiveStartDateChange = ({ activeStartDate }) => {
        loadMonthEvents(activeStartDate);
    };

    // Tile content function to show rectangle indicators for dates with events
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDateForQuery(date);
            const dateEvents = monthEvents[dateStr];
            
            if (dateEvents && dateEvents.length > 0) {
                return (
                    <div className="calendar-event-indicator">
                        <div className="event-indicator-bar">
                            <div 
                                className="event-indicator"
                                title={`${dateEvents.length} event(s) scheduled`}
                            >
                                EVENT
                            </div>
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    // Get all events for the current month to display in event notes
    const getMonthEventsForDisplay = () => {
        const allMonthEvents = [];
        
        // Loop through all dates in monthEvents and flatten the array
        Object.keys(monthEvents).forEach(date => {
            monthEvents[date].forEach(event => {
                allMonthEvents.push({
                    ...event,
                    date: date // Ensure date is included
                });
            });
        });
        
        return allMonthEvents;
    };

    // Add CSS for the event indicators
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .react-calendar__tile {
                position: relative;
                min-height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .calendar-event-indicator {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 2px;
                border-top: 1px solid rgba(255, 255, 255, 0.3);
                background-color: rgba(255, 255, 255, 0);
                z-index: 1;
            }
            
            .event-indicator-bar {
                display: flex;
                justify-content: center;
            }
            
            .event-indicator {
                height: 18px;
                width: 100%;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                color: white;
                background-color: #dc3545; /* Red background */
                text-transform: uppercase;
                letter-spacing: 0.5px;
                cursor: default;
                transition: all 0.2s ease;
            }
            
            .react-calendar__tile:hover .event-indicator {
                background-color: #c82333; /* Darker red on hover */
                transform: scale(1.02);
            }
            
            .react-calendar__tile--now {
                background-color: #fff3cd;
            }
            
            .react-calendar__tile--now .calendar-event-indicator {
                background-color: rgba(255, 243, 205, 0);
            }
            
            .react-calendar__tile--active {
                background-color: #0d6efd;
                color: white;
            }
            
            .react-calendar__tile--active .calendar-event-indicator {
                background-color: rgba(13, 110, 253, 0);
                border-top-color: rgba(255, 255, 255, 0.3);
            }
            
            .react-calendar__tile--active .event-indicator {
                color: white;
                background-color: #ff6b6b; /* Lighter red for active dates */
            }
            
            .react-calendar__month-view__days__day {
                overflow: hidden;
            }
            
            .react-calendar__tile abbr {
                z-index: 2;
                position: relative;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .event-indicator {
                    font-size: 8px;
                    height: 16px;
                }
                
                .react-calendar__tile {
                    min-height: 70px;
                }
            }
            
            @media (max-width: 576px) {
                .event-indicator {
                    font-size: 7px;
                    height: 14px;
                    letter-spacing: 0.3px;
                }
                
                .react-calendar__tile {
                    min-height: 60px;
                }
            }
        `;
        document.head.appendChild(style);

        // Load events for current month on initial render
        loadMonthEvents(new Date());

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleDateClick = async (date) => {
        setSelectedDate(date);
        setLoading(true);
        setShowEventForm(true);
        
        try {
            const formattedDate = formatDateForQuery(date);
            
            // Fetch events from both tables
            const [clientEventsResponse, adminEventsResponse] = await Promise.all([
                supabase
                    .from('clientFormrequest')
                    .select('*')
                    .eq('date', formattedDate),
                supabase
                    .from('adminEvent')
                    .select('*')
                    .eq('date', formattedDate)
            ]);
            
            // Combine events from both tables
            const clientEvents = clientEventsResponse.data || [];
            const adminEvents = adminEventsResponse.data || [];
            
            // Add source to identify which table each event came from
            const clientEventsWithSource = clientEvents.map(event => ({
                ...event,
                source: 'client',
                id: event.request_id // Use request_id as id
            }));
            
            const adminEventsWithSource = adminEvents.map(event => ({
                ...event,
                source: 'admin',
                id: event.event_id // Use event_id as id
            }));
            
            // Combine all events into one array
            const allEvents = [...clientEventsWithSource, ...adminEventsWithSource];
            
            setEvents(allEvents);
            
        } catch (error) {
            console.error('Error:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        
        if (formMode === 'add') {
            try {
                const formattedDate = formatDateForQuery(selectedDate);
                
                const { data, error } = await supabase
                    .from('adminEvent')
                    .insert([
                        {
                            eventTitle: eventTitle,
                            description: eventDescription,
                            time: eventTime,
                            date: formattedDate,
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select();
                
                if (error) {
                    console.error('Error saving event:', error);
                    alert('Error saving event. Please try again.');
                    return;
                }
                
                if (data && data.length > 0) {
                    // Add the new admin event to the events list with source
                    const newEvent = {
                        ...data[0],
                        source: 'admin',
                        id: data[0].event_id // Use event_id as id
                    };
                    setEvents([...events, newEvent]);
                    
                    // Also update monthEvents to show the new event in calendar
                    const updatedMonthEvents = { ...monthEvents };
                    if (!updatedMonthEvents[formattedDate]) {
                        updatedMonthEvents[formattedDate] = [];
                    }
                    updatedMonthEvents[formattedDate].push(newEvent);
                    setMonthEvents(updatedMonthEvents);
                    
                    setFormMode('view');
                    setEventTitle("");
                    setEventDescription("");
                    setEventTime("09:00");
                }
                
                alert(`Event "${eventTitle}" scheduled for ${selectedDate.toDateString()} at ${eventTime}`);
            } catch (error) {
                console.error('Error:', error);
                alert('Error saving event. Please try again.');
            }
        }
    };

    const deleteEvent = async (eventId, source, eventDate) => {
        console.log('Deleting event:', eventId, 'from source:', source);
        
        // Check if eventId is valid
        if (!eventId) {
            console.error('Invalid event ID:', eventId);
            alert('Cannot delete event: Invalid event ID');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                let error = null;
                
                if (source === 'admin') {
                    // Delete from adminEvent using event_id
                    const { error: adminError } = await supabase
                        .from('adminEvent')
                        .delete()
                        .eq('event_id', eventId);
                    error = adminError;
                } else if (source === 'client') {
                    // Delete from clientFormrequest using request_id
                    const { error: clientError } = await supabase
                        .from('clientFormrequest')
                        .delete()
                        .eq('request_id', eventId);
                    error = clientError;
                }
                
                if (error) {
                    console.error('Error deleting event:', error);
                    alert('Error deleting event. Please try again.');
                    return;
                }
                
                // Remove the event from local state
                const updatedEvents = events.filter(event => event.id !== eventId);
                setEvents(updatedEvents);
                
                // Also update monthEvents to remove the event from calendar
                if (eventDate && monthEvents[eventDate]) {
                    const updatedMonthEvents = { ...monthEvents };
                    updatedMonthEvents[eventDate] = updatedMonthEvents[eventDate].filter(
                        event => (source === 'admin' ? event.event_id : event.request_id) !== eventId
                    );
                    
                    // If no events left for that date, remove the date key
                    if (updatedMonthEvents[eventDate].length === 0) {
                        delete updatedMonthEvents[eventDate];
                    }
                    
                    setMonthEvents(updatedMonthEvents);
                }
                
                alert('Event deleted successfully');
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting event. Please try again.');
            }
        }
    };

    const closeForm = () => {
        setShowEventForm(false);
        setSelectedDate(null);
        setEvents([]);
        setFormMode('view');
        setEventTitle("");
        setEventDescription("");
        setEventTime("09:00");
    };

    const addNewEvent = () => {
        setFormMode('add');
        setEventTitle("");
        setEventDescription("");
        setEventTime("09:00");
    };

    // Get current month events for display
    const monthEventsForDisplay = getMonthEventsForDisplay();

    return (
        <>
            <div className="admin_Calendar mt-5 mb-5">
                <div className="clientCalendarBody mb-5">
                    <div className="calendar-container">
                        <Calendar
                            locale="en-US"
                            onClickDay={handleDateClick}
                            value={selectedDate}
                            tileContent={tileContent}
                            onActiveStartDateChange={handleActiveStartDateChange}
                        />
                    </div>
                </div>
            </div>

            <div className="eventNotes">   
                <div className="eventDisplay">
                    <span className="title ms-1">Title</span>
                    <span className="descri">Description</span>
                    <span className="date">Date</span>
                    <span className="time">Time</span>
                </div>
                <div className="eventDisplay_list">
                    {monthEventsForDisplay.map((event) => (
                        <div key={`${event.source || 'event'}-${event.id || event.request_id || event.event_id}`} className="eventList">
                            <span className="title ms-1">{event.eventTitle || event.title}</span>
                            <span className="descri">{event.description}</span>
                            <span className="date">{event.date}</span>
                            <span className="time">{event.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {showEventForm && selectedDate && ( 
                <div className="event-form-container">
                    <div className="event-form-header position-relative">
                        <span>
                                <h3 className="mt-2">{selectedDate.toDateString()}</h3>
                        </span>
                        
                        <button 
                            className="close-btn position-absolute top-0 end-0 bg-danger bg-opacity-75 mt-1 ms-5"
                            onClick={closeForm}
                        >
                            ×
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="loading-message text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading events...</p>
                        </div>
                    ) : formMode === 'add' ? (
                        <form onSubmit={handleSubmitEvent} className="event-form">

                            <p className="mt-3">Add Event</p>
                            <div className="form-group">
                                <div className="form-floating mb-3 col-10">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="eventTitle" 
                                        placeholder="Enter event title"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="eventTitle">Title</label>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div className="form-floating mb-3 col-10">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="eventDescription" 
                                        placeholder="Enter event description"
                                        value={eventDescription}
                                        onChange={(e) => setEventDescription(e.target.value)}
                                    />
                                    <label htmlFor="eventDescription">Description</label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-floating mb-3 date">
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        id="eventDate" 
                                        value={formatDateForInput(selectedDate)}
                                        readOnly
                                    />
                                    <label htmlFor="eventDate">Date</label>
                                </div>
                                <div className="form-floating mb-3 date">
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        id="eventTime" 
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="eventTime">Time</label>
                                </div>
                            </div>

                            <span className="eventForm_button me-3">
                                <button type="submit" className="me-4">Add Event</button>
                            </span>

                        </form>
                    ) : (
                        <div className="events-list">
                            {events.length === 0 ? (
                                <div className="no-events-message text-center py-4">
                                    <p className="text-muted">No events scheduled for this date</p>
                                    <button 
                                        onClick={addNewEvent}
                                        className="mt-2 addEvent_btn"
                                    >
                                        Add Event
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="events-header mb-3">
                                        <span className="col-7 schedEvent_title">
                                                <p className="mt-3">Scheduled Events</p>
                                        </span>
                                        
                                        <button 
                                            onClick={addNewEvent}
                                            className="bg-danger bg-opacity-75 mt-1 ms-5 col-3"
                                        >
                                        Add Event
                                        </button>
                                    </div>
                                    
                                    <div className="events-body">
                                    {events.map((event) => (
                                        <div key={event.id} className="event-card card mb-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="card-title mb-1">
                                                            {event.eventTitle || event.title}
                                                        </h6>
                                                        <p className="card-text text-muted mb-1">
                                                            <small>Time: {event.time}</small>
                                                        </p>
                                                    
                                                        {event.description && (
                                                            <p className="card-text mb-2">{event.description}</p>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => deleteEvent(event.id, event.source, event.date)}
                                                        className="del_button mt-3"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default StaffCalendar;