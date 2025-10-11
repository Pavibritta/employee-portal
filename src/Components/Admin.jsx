import React, { useState } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import kitelogo from "../images/kitelogo.png";
import Swal from "sweetalert2";
import { BASE_URL } from "./Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdLockReset } from "react-icons/md";

const Admin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Swal.fire({
      //   icon: "success",
      //   title: "Login Successful",
      //   text: `Welcome, ${loggedInUser.name || "Admin"}!`,
      //   timer: 2000,
      //   showConfirmButton: false,
      // });

      // Step 5: Redirect
      setTimeout(() => {
        navigate("/layout"); // Admin dashboard
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
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/forgot-password/send-otp`, { email });

      setOtpSent(true);
      Swal.fire({
        icon: "success",
        title: "OTP Sent ✅",
        text: "Check your email for the OTP.",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Send OTP ❗",
        text:
          error.response?.data?.message || "Please check the email address.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "All Fields Required ⚠️",
        text: "Please fill in all the fields before submitting.",
        confirmButtonColor: "#f0ad4e",
      });
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Password Mismatch ❗",
        text: "New password and confirm password do not match.",
        confirmButtonColor: "#d33",
      });
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/forgot-password/reset`, {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful 🎉",
        text: "You can now log in with your new password.",
        confirmButtonColor: "#3085d6",
      });

      // Reset states
      setShowForgot(false);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed ❗",
        text:
          err.response?.data?.message || "Invalid OTP or an error occurred.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
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
            {!showForgot ? (
              <>
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
                  <div className="text-end mt-2">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-primary small d-inline-flex align-items-center gap-1 text-decoration-none"
                      onClick={() => setShowForgot(true)}
                    >
                      <MdLockReset size={16} />
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="loginbtn text-center mb-4">
                    Login
                  </button>
                </form>
              </>
            ) : (
              <>
                <h4 className="mb-3 text-center">Reset Password</h4>
                {!otpSent ? (
                  <div>
                    <label>Enter your email</label>

                    <input
                      type="email"
                      className="form-control mb-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      className="btn btn-primary w-100 mb-3"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label>Enter your email</label>

                      <input
                        type="email"
                        className="form-control mb-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">New Password</label>
                      <div className="position-relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control pe-5"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <span
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                          }}
                        >
                          {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Confirm Password</label>
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control pe-5"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                          }}
                        >
                          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-success w-100 mb-4"
                      onClick={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="col-lg-7 col-md-6 col-12 mt-sm-4 backimg"></div>
      </div>
    </div>
  );
};

export default Admin;
