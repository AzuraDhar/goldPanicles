import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { submitClientForm } from '../../../../api/clientform'; 
import { supabase } from '../../../../api/supabase'; 
import { getUserData, getUserId, isAuthenticated } from '../../../../api/auth';
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
    attachFile: '',
    status: 'pending'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileInputRef = useRef(null);

  // Get current user on component mount
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = getUserData();
        const userIdFromStorage = getUserId();
        const authenticated = isAuthenticated();
        
        if (userData && authenticated && userIdFromStorage) {
          setCurrentUser(userData);
          setUserId(userIdFromStorage);
          setIsLoggedIn(true);
          
          // Log user data to console
          console.log('👤 Current User Data:', {
            id: userIdFromStorage,
            email: userData.email,
            name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            role: userData.role,
            username: userData.username,
            staff_id: userData.staff_id,
            user_id: userData.user_id
          });
        } else {
          setIsLoggedIn(false);
          console.log('🔒 No user logged in or session expired');
        }
        
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        setIsLoggedIn(false);
      }
    };
    
    fetchUserData();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

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
      attachFile: '',
      status: 'pending'
    });
    setFile(null);
    setUploadProgress(0);
    setSubmitMessage('');
  };

  const onChange = (newDate) => {
    if (!isLoggedIn || !userId) {
      setSubmitMessage('❌ Error: You must be logged in to submit a request');
      setShowForm(true);
      return;
    }
    
    setDate(newDate);
    setSelectedDate(newDate);
    
    const formattedDate = formatDate(newDate);
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      status: 'pending'
    }));
    
    setShowForm(true);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setSubmitMessage('Error: File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setSubmitMessage('Error: Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX, TXT');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setSubmitMessage('');
    }
  };

  const uploadFileToSupabase = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.]/g, '_')
        .replace(/\s+/g, '_');
      
      const uniqueFileName = `${timestamp}_${randomString}_${safeFileName}`;
      const filePath = `client-requests/${year}/${month}/${day}/${uniqueFileName}`;
      
      // Simulate upload progress
      const simulateProgress = () => {
        return new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };
      
      simulateProgress();
      
      const { data, error } = await supabase.storage
        .from('staffSchedule')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('staffSchedule')
        .getPublicUrl(data.path);
      
      return {
        url: publicUrl,
        path: data.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      throw new Error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn || !userId) {
      setSubmitMessage('❌ Error: You must be logged in to submit a request');
      return;
    }
    
    setLoading(true);
    setSubmitMessage('');

    try {
      let fileData = null;
      
      if (file) {
        try {
          fileData = await uploadFileToSupabase(file);
          console.log('📎 File uploaded successfully:', {
            fileName: fileData.fileName,
            fileSize: `${(fileData.fileSize / 1024 / 1024).toFixed(2)} MB`,
            fileType: fileData.fileType,
            url: fileData.url,
            path: fileData.path
          });
        } catch (uploadError) {
          setSubmitMessage(`Error uploading file: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      // Prepare COMPLETE user data for console logging
      const userEmail = currentUser?.email || '';
      const userName = currentUser?.full_name || 
                      `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
                      currentUser?.username || 
                      'Unknown User';
      
      // Prepare submission data - ONLY user_id goes to database
      const submissionData = {
        ...formData,
        user_id: userId, // Only this goes to database
        attachFile: fileData ? fileData.url : '',
        fileData: fileData ? {
          path: fileData.path,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType
        } : null,
        created_at: new Date().toISOString(),
        time: formData.time || formatTime(new Date()),
        status: 'pending'
      };

      // LOG ALL DETAILED INFORMATION TO CONSOLE
      console.log('📋 ========== COMPLETE FORM SUBMISSION DATA ==========');
      console.log('📅 FORM DATA TO BE SAVED TO DATABASE:', {
        eventTitle: submissionData.eventTitle,
        description: submissionData.description,
        date: submissionData.date,
        time: submissionData.time,
        location: submissionData.location,
        contactPerson: submissionData.contactPerson,
        contactInfo: submissionData.contactInfo,
        attachFile: submissionData.attachFile || 'No file',
        status: submissionData.status,
        user_id: submissionData.user_id, // Only this goes to DB
        created_at: submissionData.created_at
      });
      
      console.log('👤 FULL USER DATA (FOR LOGGING ONLY - NOT SAVED TO DB):', {
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        user_role: currentUser?.role || 'N/A',
        user_fullData: currentUser // Complete user object
      });
      
      if (fileData) {
        console.log('📎 FILE DATA (FOR LOGGING ONLY):', {
          fileName: fileData.fileName,
          fileSize: `${(fileData.fileSize / 1024 / 1024).toFixed(2)} MB`,
          fileType: fileData.fileType,
          filePath: fileData.path,
          fileUrl: fileData.url
        });
      }
      
      console.log('⏰ SUBMISSION TIMESTAMP:', {
        localTime: new Date().toLocaleString(),
        isoString: new Date().toISOString(),
        timestamp: Date.now()
      });
      
      console.log('🔑 DATABASE COLUMNS BEING SAVED:', [
        'eventTitle', 'description', 'date', 'time', 'location', 
        'contactPerson', 'contactInfo', 'attachFile', 'status', 
        'user_id', 'created_at', 'fileData (JSON)'
      ].join(', '));
      
      console.log('======================================================');

      // Submit to your API (only user_id goes to DB)
      const result = await submitClientForm(submissionData);
      
      // Log API response
      console.log('📤 API RESPONSE:', {
        success: result.success,
        error: result.error || 'No error',
        data: result.data || 'No data returned',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        console.log('✅ FORM SUBMITTED SUCCESSFULLY!');
        console.log('📊 Database record created with:', {
          user_id: userId,
          form_data_saved: {
            eventTitle: submissionData.eventTitle.substring(0, 50) + '...',
            date: submissionData.date,
            status: submissionData.status
          }
        });
        
        setSubmitMessage('✅ Form submitted successfully!');
        setTimeout(() => {
          closeForm();
        }, 2000);
      } else {
        console.error('❌ FORM SUBMISSION FAILED:', result.error);
        setSubmitMessage(`❌ Error: ${result.error}`);
        
        if (fileData) {
          try {
            await supabase.storage
              .from('staffSchedule')
              .remove([fileData.path]);
            console.log('🧹 Cleaned up uploaded file due to form submission error');
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR IN FORM SUBMISSION:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setSubmitMessage(`❌ Error: ${error.message}`);
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
          <div className="form_header mt-3">
            <button 
              onClick={closeForm}
              className="close-btn position-absolute top-0 end-0 mt-1 me-1 bg-danger bg-opacity-75"
              disabled={loading || uploading}
            >
              ×
            </button>
          </div>
          
          {!isLoggedIn && (
            <div className="alert alert-warning mt-2 mb-3 mx-3">
              <small>
                <i className="bi bi-exclamation-triangle me-1"></i>
                You must be logged in to submit a request.
              </small>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="requestForm_label ms-3">
              <label htmlFor="eventTitle" className='mb-1 ms-1'>Event Title*</label>
              <input 
                type="text" 
                className="form-control" 
                id="eventTitle"
                value={formData.eventTitle}
                onChange={handleInputChange}
                required
                disabled={loading || uploading || !isLoggedIn}
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
                disabled={loading || uploading || !isLoggedIn}
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
                  readOnly
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label htmlFor="time" className='mb-1 ms-1'>Time*</label>
                <input 
                  type="time" 
                  className="form-control" 
                  id="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="HH:MM format (e.g., 14:30)"
                  required
                  disabled={loading || uploading || !isLoggedIn}
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
                disabled={loading || uploading || !isLoggedIn}
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
                  disabled={loading || uploading || !isLoggedIn}
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
                  disabled={loading || uploading || !isLoggedIn}
                />
              </div>
            </div>

            <div className="requestForm_label mt-2 ms-3">
              <label htmlFor="attachFile" className='mb-1 ms-1'>Attach File (Optional)</label>
              <input 
                type="file" 
                className="form-control" 
                id="attachFile"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                disabled={loading || uploading || !isLoggedIn}
              />
              
              {uploading && (
                <div className="upload-progress mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>
                      <i className="bi bi-upload me-1"></i>
                      Uploading...
                    </small>
                    <small>{uploadProgress}%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {submitMessage && (
              <div className={`alert ${submitMessage.includes('❌') ? 'alert-danger' : 'alert-success'} mt-3 msg_alert`}>
                {submitMessage}
              </div>
            )}

            <div className="submitForm_btn ms-3 mt-4">
              <button 
                type="submit" 
                className="btn p-1 submit_btn1"
                disabled={loading || uploading || !isLoggedIn}
              >
                {!isLoggedIn ? (
                  'Login Required'
                ) : loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Uploading...
                  </>
                ) : 'Submit'}
              </button>
              <button
                type="button" 
                className="btn p-1 submit_btn2" 
                onClick={closeForm}
                disabled={loading || uploading}
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