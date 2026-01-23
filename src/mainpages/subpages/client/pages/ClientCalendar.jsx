import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { submitClientForm } from '../../../../api/clientform'; 
import './ClientCalendar.css';

function ClientCalendar() {
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    eventTitle: '',
    description: '',
    date: '',
    time: '',
    location: '',
    contactPerson: '',
    contactInfo: '',
    attachFile: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      eventTitle: '',
      description: '',
      date: '',
      time: '',
      location: '',
      contactPerson: '',
      contactInfo: '',
      attachFile: ''
    });
    setSubmitMessage('');
  };

  const onChange = (newDate) => {
    setDate(newDate);
    setSelectedDate(newDate);
    
    // Format date automatically
    const formattedDate = formatDate(newDate);
    
    // Set form data with the selected date
    setFormData(prev => ({
      ...prev,
      date: formattedDate
    }));
    
    setShowForm(true);
  };

  const formatDate = (date) => {
    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    // Format time as HH:MM
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage('');

    // Add timestamp and format time if not provided
    const submissionData = {
      ...formData,
      created_at: new Date().toISOString(),
      // If time is empty, use current time
      time: formData.time || formatTime(new Date())
    };

    try {
      const result = await submitClientForm(submissionData);
      
      if (result.success) {
        setSubmitMessage('Form submitted successfully!');
        // Clear form after successful submission
        setTimeout(() => {
          closeForm();
        }, 2000);
      } else {
        setSubmitMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="clientCalendarBody mb-2">
        <div className="calendar-container">
          <Calendar
            onChange={onChange}
            value={date}
            locale="en-US"
          />
        </div>
      </div>

      {showForm && selectedDate && (
        <div className="clientRequestForm mb-5 text-center">
          <span className='request_title me-2'>
            <p className='mt-3 pb-1'>Request</p>
          </span>
          <div className="form-header">
            <button 
              onClick={closeForm}
              className="close-btn position-absolute top-0 end-0 mt-1 me-1 bg-danger bg-opacity-75"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="requestForm_label mt-3 ms-3">
              <label htmlFor="eventTitle" className='mb-1 ms-1'>Event Title*</label>
              <input 
                type="text" 
                className="form-control" 
                id="eventTitle"
                value={formData.eventTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-1 requestForm_label mt-1 ms-3">
              <label htmlFor="description" className='mb-1 ms-1'>Description*</label>
              <textarea 
                className="form-control Description" 
                id="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="requestForm_label1 ms-2 row g-3">
              <div className="col-md-6">
                <label htmlFor="date" className='mb-1 ms-1'>Date*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  readOnly // Make it read-only since it's auto-populated
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="time" className='mb-1 ms-1'>Time*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="HH:MM format (e.g., 14:30)"
                  required
                />
              </div>
            </div>

            <div className="requestForm_label mt-2 ms-3">
              <label htmlFor="location" className='mb-1 ms-1'>Location*</label>
              <input 
                type="text" 
                className="form-control" 
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="requestForm_label1 ms-2 row g-3">
              <div className="col-md-6">
                <label htmlFor="contactPerson" className='mb-1 ms-1'>Person to Contact*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="contactInfo" className='mb-1 ms-1'>
                  Contact Info* 
                  <span className='parenthesis'>
                    ( Messenger, email, <i>etc</i> )
                  </span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="requestForm_label mt-2 ms-3">
              <label htmlFor="attachFile" className='mb-1 ms-1'>Attach File</label>
              <input 
                type="text" 
                className="form-control" 
                id="attachFile"
                value={formData.attachFile}
                onChange={handleInputChange}
                placeholder="File path or URL"
              />
            </div>

            {submitMessage && (
              <div className={`alert ${submitMessage.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3 msg_alert`}>
                {submitMessage}
              </div>
            )}

            <div className="submitForm_btn ms-3 mt-3">
              <button 
                type="submit" 
                className="btn p-1 submit_btn1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button 
                type="button" 
                className="btn p-1 submit_btn2" 
                onClick={closeForm}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="clientCalendarNotes">
        {/* Your notes component */}
      </div>
    </>
  );
}

export default ClientCalendar;