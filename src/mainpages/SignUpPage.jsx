import React, { useState } from "react";
import "./SignUpPage.css";
import { signUpUser } from "../api/signup";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import { Link } from "react-router-dom";


function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    classification: "",
    segment: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await signUpUser(formData);

    if (result.success) {
      alert("User registered successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        classification: "",
        segment: "",
      });
    } else {
      alert("Error: " + result.error.message);
    }
  };

  return (
    <>
      <div className="signUp_mainBody">
        <div className="signUp_formContainer">
          <div className="signUp_title">
            <p className="mt-1">Sign Up</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* First & Last Name */}
                    <div className="input-group mb-3 mt-5">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Firstname"
                            value={formData.firstName}
                            onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                            }
                            required
                        />

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Lastname"
                            value={formData.lastName}
                            onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                            }
                            required
                        />
                </div>

            {/* Email */}
                <div className="input-group input-groupone mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                </div>

            {/* Password */}
                <div className="input-group input-groupone mb-3 password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                        }
                        required
                    />
                    <span
                        className="password-eye"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </span>
                </div>

            {/* Dropdowns */}
                <div className="dropdowntoggle mb-5">
                    {/* Classification */}
                        <div className="dropdown">
                            <button
                            className="btn dropdown-toggle btn_toggle d-flex justify-content-between align-items-center w-100"
                            type="button"
                            data-bs-toggle="dropdown"
                            >
                            <span>{formData.classification || "Classification"}</span>
                            </button>
                            <ul className="dropdown-menu">
                            {["Office", "Department", "Organization"].map((item) => (
                                <li key={item}>
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() =>
                                    setFormData({ ...formData, classification: item })
                                    }
                                >
                                    {item}
                                </button>
                                </li>
                            ))}
                            </ul>
                        </div>

                    {/* Segment */}
                        <div className="dropdown">
                            <button
                            className="btn dropdown-toggle btn_toggle d-flex justify-content-between align-items-center w-100"
                            type="button"
                            data-bs-toggle="dropdown"
                            >
                            <span>{formData.segment || "Segment"}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                            {["Sample 1", "Sample 2", "Sample 3"].map((item) => (
                                <li key={item}>
                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() =>
                                    setFormData({ ...formData, segment: item })
                                    }
                                >
                                    {item}
                                </button>
                                </li>
                            ))}
                            </ul>
                        </div>
                </div>

            {/* Submit */}
                <button
                type="submit"
                className="btn btn-warning submit_btn mb-3"
                >
                Submit
                </button>

                <span>
                    Already have an Account? <Link to="/">Login</Link>
                </span>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
