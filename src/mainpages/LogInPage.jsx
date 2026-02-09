import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuLogIn } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import "./LogInPage.css";
import { logInUser } from "../api/login";
import { storeUserData } from "../api/auth"; // or "../utils/auth"

function LogInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await logInUser(email, password);

      if (result.success) {
        const user = result.data;
        console.log("Logged in user:", user);

        // Use the storeUserData function to handle storage
        storeUserData(user);

        console.log("localStorage user:", localStorage.getItem("user"));
        console.log("sessionStorage userId:", sessionStorage.getItem("userId"));
        console.log(
          "sessionStorage userRole:",
          sessionStorage.getItem("userRole"),
        );

        // Role-based redirection
        switch (user.role) {
          case "Administrator":
            navigate("/admin");
            break;
          case "Section Head":
            navigate("/staff");
            break;
          case "Staff":
            navigate("/reg");
            break;
          case "client":
            navigate("/client");
            break;
          default:
            navigate("/login");
            alert(
              `Role "${user.role}" not recognized. Please contact administrator.`,
            );
        }
      } else {
        alert(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_page">
      {/* LEFT PANEL */}
      <div className="column1"></div>

      {/* RIGHT PANEL */}
      <div className="column2">
        <div className="logform">
          <div className="form_header">
            <img src="/img/tgp.png" alt="Logo" className="form_logo" />
            <p>
              <i>We never flinch in serving you the truth</i>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="input-group input-group-sm mb-3 mt-4">
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="input-group input-group-sm mb-3">
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button type="submit" className="btn mt-3" disabled={loading}>
              <span className="icon me-2">
                <LuLogIn className="icon-adjust me-2" />
                {loading ? "Logging in..." : "Login"}
              </span>
            </button>
          </form>

          <p className="sign_fontsize mt-3">
            Don't have an Account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogInPage;
