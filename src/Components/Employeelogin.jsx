import React, { useState } from "react";
import "./Employeelogin.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import kitelogo from "../images/kitelogo.png";
import { BASE_URL } from "./Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdLockReset } from "react-icons/md";
import { useUser } from "./Contexts/UserContext";

const Employeelogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loginUser, logoutUser } = useUser();

  console.log("user", user);
  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError(false);
    setPasswordError(false);

    if (!email.trim()) {
      setEmailError(true);
      setError("Please enter email");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      setError("Please enter a valid email");
      return;
    }

    if (!password.trim()) {
      setPasswordError(true);
      setError("Please enter password");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get CSRF Cookie (Laravel Sanctum)
      await axios.get(`${BASE_URL.replace("/api", "")}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Step 2: API Login
      const response = await axios.post(
        `${BASE_URL}/login`,
        { email, password, role: "employee" },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = response.data;
      console.log("data", data);
      if (!data.access_token) {
        throw new Error("Login failed. No token received.");
      }

      // ✅ Store token & full user details in localStorage
      loginUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || "employee",
        token: data.access_token,
      });
      localStorage.setItem("authToken", response.data.access_token); // Correct token
      localStorage.setItem("userId", response.data.user.id); // or response.data.user.employee_id
      localStorage.setItem("userEmail", response.data.user.email);

      // Set default Authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.access_token}`;
      console.log(data);
      // Swal.fire({
      //   icon: "success",
      //   title: "Employee Login Successful ✅",
      //   timer: 2000,
      //   showConfirmButton: false,
      // });

      // Redirect to User Dashboard
      navigate("/userdashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes("Network Error")) {
        setError("Cannot connect to server. Please check your network.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
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
    <div className="container-fluid employee-login-container p-0">
      <div className="row min-vh-100 g-0">
        {/* Left Section */}
        <div className="col-12 col-md-6 col-lg-5 d-flex align-items-center justify-content-center p-4 bg-white">
          <div className="w-100" style={{ maxWidth: "420px" }}>
            <div className="mb-4 text-center">
              <img
                src={kitelogo}
                alt="kitelogo"
                className="img-fluid"
                style={{ maxWidth: "166px" }}
              />
            </div>

            {!showForgot ? (
              <>
                <h2 className="fw-bold mb-3 text-center">Employee Login</h2>
                <p className="text-muted mb-4 text-center">
                  Login to your account
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-control ${
                        emailError ? "is-invalid" : ""
                      }`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {emailError && (
                      <div className="invalid-feedback">
                        Enter a valid email
                      </div>
                    )}
                  </div>

                  <div className="mb-3 position-relative">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`form-control pe-5 ${
                        passwordError ? "is-invalid" : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "70%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#6c757d",
                      }}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>

                    {passwordError && (
                      <div className="invalid-feedback">
                        Enter your password
                      </div>
                    )}
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

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h4 className="mb-3 text-center">Reset Password</h4>

                {!otpSent ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Enter your Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>

                    <div className="mb-3 position-relative">
                      <label className="form-label">New Password</label>
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
                          top: "70%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#6c757d",
                        }}
                      >
                        {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>

                    <div className="mb-3 position-relative">
                      <label className="form-label">Confirm Password</label>
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
                          top: "70%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#6c757d",
                        }}
                      >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </span>
                    </div>

                    <button
                      className="btn btn-success w-100"
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
        <div className="col-12 col-md-6 col-lg-7 backimg d-none d-md-block"></div>
      </div>
    </div>
  );
};

export default Employeelogin;
