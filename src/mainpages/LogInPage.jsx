import React, { useState } from "react";

import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuLogIn } from "react-icons/lu";

import { Link, useNavigate } from "react-router-dom";

import "./LogInPage.css";
import { logInUser } from "../api/login";

function LogInPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await logInUser(email, password);

    if (result.success) {
      alert("Login successful!");
      console.log("Logged in user:", result.data);

      // redirect after login
      navigate("/client"); // change if needed
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login_mainbody">
      <div className="login_container">
        <div className="column1"></div>

        <div className="column2">
          <div className="logform">
            <div className="form_title"></div>

            <form onSubmit={handleSubmit}>
              <p>
                <i>"We never flinch in serving you the truth"</i>
              </p>

              {/* Email */}
              <div className="input-group input-group-sm mb-3 mt-4">
                <span className="input-group-text">
                  <span className="icon me-3">
                    <MdOutlineEmail />
                  </span>
                  Email
                </span>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group input-group-sm mb-3">
                <span className="input-group-text">
                  <span className="icon me-2">
                    <IoLockClosedOutline />
                  </span>
                  Password
                </span>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button type="submit" className="btn mt-3">
                <span className="icon me-2">
                  <span className="icon_log me-2">
                    <LuLogIn className="icon-adjust" />
                  </span>
                  LOGIN
                </span>
              </button>
            </form>

            <p className="sign_fontsize mt-2">
              Don't have an Account ? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogInPage;
