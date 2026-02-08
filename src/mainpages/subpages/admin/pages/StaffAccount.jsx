import React, { useState, useEffect } from "react";
import { supabase } from "../../../../api/supabase";

import AllAccount from "./subpages/staff/AllAccount";
import ExecutivesAccount from "./subpages/staff/ExecutivesAccount";
import ScribesAccount from "./subpages/staff/ScribesAccount";
import CreativesAccount from "./subpages/staff/CreativesAccount";
import ManagerialAccount from "./subpages/staff/ManagerialAccount";

import "./StaffAccount.css";


function StaffAccount(){

    const [activeTab, setActiveTab] = useState('all');
    const [showForm, setShowForm] = useState(false);

    const roleOptions = [ 
        { id: 1, label: 'Administrator', value: 'Administrator' },
        { id: 2, label: 'Section Head', value: 'Section Head' },
        { id: 3, label: 'Staff', value: 'Staff' }
    ];
    const [selectedRole, setSelectedRole] = useState(null);

    const positionOptions = [
        { id: 1, label: 'News', value: 'News' },
        { id: 2, label: 'Photojournalism', value: 'Photojournalism' },
        { id: 3, label: 'Videojournalism', value: 'Videojournalism' }
    ];
    const [selectedPosition, setSelectedPosition] = useState(null);

    const segmentOptions = [
        { id: 1, label: 'Executive', value: 'executive' },
        { id: 2, label: 'Managerial', value: 'managerial' },
        { id: 3, label: 'Scribes', value: 'scribe' },
        { id: 4, label: 'Creatives', value: 'creatives' }
    ];
    const [selectedSegment, setSelectedSegment] = useState(null);

    

    const handleRowClick = async (request) => {
        setShowForm(true);
    };
    const closeForm = () => {
        setShowForm(false);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'all':
                return <AllAccount />;
            case 'executive':
                return <ExecutivesAccount />;
            case 'scribe':
                return <ScribesAccount />;
            case 'creative':
                return <CreativesAccount />;
            case 'manager':
                return <ManagerialAccount />;
            default:
                return <AllAccount />;
        }
    }

    {/* DATABASE */}

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        role: '',
        position: '',
        email: '',
        password: '',
        segment: ''
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation with new field names
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.segment || !formData.role || 
        !formData.position) { // Updated field names
        alert('Please fill all fields');
        return;
    }

    try {
        // Supabase example
        const { data, error } = await supabase
            .from('staffDB') // Your table name
            .insert([
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password, // You should hash this!
                    segment: formData.segment,   // Column name in Supabase
                    role: formData.role,         // Column name in Supabase
                    position: formData.position  // Column name in Supabase
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log('Staff created:', data);
        
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            segment: '', // Updated
            role: '',    // Updated
            position: '' // Updated
        });
        setSelectedSegment(null);
        setSelectedRole(null);
        setSelectedPosition(null);
        closeForm();
        
        alert('Staff account created successfully!');
        
    } catch (error) {
        console.error('Error creating staff:', error);
        alert('Error creating staff account: ' + error.message);
    }
};

    return(
        <>

            <div className="staff_mainbody">

                    <div className="staff_header">

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>All</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'executive' ? 'active' : ''}`}
                                onClick={() => setActiveTab('executive')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Executives</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'scribe' ? 'active' : ''}`}
                                onClick={() => setActiveTab('scribe')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Scribes</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'creative' ? 'active' : ''}`}
                                onClick={() => setActiveTab('creative')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Creatives</span>
                        </span>

                        <span 
                                className={`pending_tab mt-4 ms-1 ${activeTab === 'manager' ? 'active' : ''}`}
                                onClick={() => setActiveTab('manager')}
                                style={{cursor: 'pointer'}}
                                >
                                <span>Managerial</span>
                        </span>
                        
                        <div className="add_staff ms-5">
                            
                            <button className="mt-3 ms-5" onClick={() => handleRowClick()}>
                                Add Staff
                            </button>

                        </div>

                    </div>

                    {showForm && (
                        <div className="addStaff_form">
                                <div className="addform_header">
                                    <span className="mt-2 ms-5">
                                        <p className="mt-4">Create staff account</p>
                                    </span>
                                    <button 
                                        onClick={closeForm}
                                        className="close-btn position-absolute top-0 end-0 me-1 bg-danger bg-opacity-75 mt-1"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="addStaff_body">

                                    <span className="addstaff_input mt-4">
                                            <div class="form-floating mb-3">
                                                <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        id="floatingInput" 
                                                        placeholder="Firstname"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                />
                                                <label htmlFor="floatingInput">Firstname</label>
                                            </div>

                                            <div class="form-floating mb-3">
                                                <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        id="floatingInput" 
                                                        placeholder="Lastname"
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                />
                                                <label htmlFor="floatingInput">Lastname</label>
                                            </div>
                                    </span>

                                    <span className="addstaff_input">
                                            <div class="form-floating mb-3 col-12">
                                                <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        id="floatingInput" 
                                                        placeholder="Email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                />
                                                <label htmlFor="floatingInput">Email address</label>
                                            </div>
                                    </span>

                                    <span className="addstaff_input">
                                            <div class="form-floating mb-3 col-12">
                                                <input 
                                                        type="password" 
                                                        class="form-control" 
                                                        id="floatingInput" 
                                                        placeholder="Password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                />
                                                <label htmlFor="floatingInput">Password</label>
                                            </div>
                                    </span>

                                    <span className="addstaff_input mb-3 col-12">
                                        <div className="dropdown1 col-12">
                                            <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                {selectedSegment ? selectedSegment.label : 'Select Segment'}
                                            </button>
                                            <ul className="dropdown-menu">
                                                {segmentOptions.map(option => (
                                                    <li key={option.id}>
                                                        <a 
                                                            className="dropdown-item" 
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedSegment(option);
                                                                setFormData({...formData, segment: option.value}); // ✅ Fixed
                                                            }}
                                                        >
                                                            {option.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </span>

                                    <span className="addstaff_input mb-3">
                                            <div className="dropdown col-6">
                                                <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    {selectedRole ? selectedRole.label : 'Select Role'}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {roleOptions.map(option => (
                                                        <li key={option.id}>
                                                            <a 
                                                                className="dropdown-item" 
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedRole(option);
                                                                    setFormData({...formData, role: option.value}); // ✅ Fixed
                                                                }}
                                                            >
                                                                {option.label}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                             <div className="dropdown col-6">
                                                <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    {selectedPosition ? selectedPosition.label : 'Select Position'}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {positionOptions.map(option => (
                                                        <li key={option.id}>
                                                            <a 
                                                                className="dropdown-item" 
                                                                href="#" 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedPosition(option);
                                                                    setFormData({...formData, position: option.value}); // ✅ Fixed
                                                                }}
                                                            >
                                                                {option.label}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            
                                    </span>

                                    <span className="addstaff_input mt-3 optionsButton">
                                            <button className="create_button" onClick={handleSubmit}>Create Account</button>

                                            <button className="cancel_button" onClick={closeForm} >Cancel</button>
                                    </span>

                                </div>
                        </div>
                    )}

                    <div className="staff_body">

                        {renderContent()}

                    </div>

            </div>
        </>
    )
}

export default StaffAccount;