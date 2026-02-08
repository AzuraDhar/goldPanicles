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
                <br />
                <br />

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
