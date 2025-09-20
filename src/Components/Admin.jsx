import React, { useState } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import kitelogo from "../images/kitelogo.png";
import Swal from "sweetalert2";
import { BASE_URL } from "./Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Admin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Login request
      const response = await axios.post(
        `${BASE_URL}/login`,
        { email, password, role: "admin" },
        { withCredentials: true }
      );

      console.log("✅ Login API response:", response.data);

      if (!response.data.access_token) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid email or password.",
        });
        return;
      }

      const token = response.data.access_token;
      const userId = response.data.user.id;

      // Step 2: Fetch all users and check role
      const userRes = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(userRes.data.data);
      const users = userRes.data.data || userRes.data; // handle both cases
      const loggedInUser = users.find((u) => u.id === userId);

      if (!loggedInUser) {
        Swal.fire({
          icon: "error",
          title: "User Not Found",
          text: "Your account does not exist in the system.",
        });
        return;
      }

      if (loggedInUser.role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only admins are allowed to login here.",
        });
        return;
      }

      // Step 3: Save details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // Step 4: Success alert
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome, ${loggedInUser.name || "Admin"}!`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Step 5: Redirect
      setTimeout(() => {
        navigate("/Layout"); // Admin dashboard
      }, 2000);
    } catch (error) {
      console.error("❌ Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid credentials or server error.",
      });
    }
  };

  return (
    <div className="container-fluid admin-login-container">
      <div className="row min-vh-100">
        {/* Left Section */}
        <div className="col-lg-5 col-md-6 col-12 d-flex align-items-center justify-content-center">
          <div className="main w-100 px-4">
            <div className="mb-3 text-center">
              <img
                src={kitelogo}
                alt="kitelogo"
                className="img-fluid"
                style={{ maxWidth: "160px", height: "auto" }}
              />
            </div>
            <h1 className="title mb-4 text-center">Admin Login</h1>
            <p className="subtitle mb-4">Login to your account</p>

            <form className="form-group" onSubmit={handleLogin}>
              <label htmlFor="empid" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="empid"
                className="form-control mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="password" className="form-label">
                Password
              </label>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="position-relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-control pe-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                {/* Eye Icon inside input */}
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6c757d",
                  }}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              <button type="submit" className="loginbtn text-center mb-4">
                Login
              </button>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-lg-7 col-md-6 col-12 mt-sm-4 backimg"></div>
      </div>
    </div>
  );
};

export default Admin;
