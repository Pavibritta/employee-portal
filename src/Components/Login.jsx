import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import kitelogo from ".././images/kitelogo.png";
import { useUser } from "./Contexts/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, loginAsEmployee } = useUser(); // Get context functions

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column flex-lg-row p-0">
      {/* Left Section */}
      <div className="col-12 col-lg-5 d-flex justify-content-center align-items-center bg-white py-5 first">
        <div className="text-center w-100 px-4">
          <div className="mb-4">
            <img
              src={kitelogo}
              alt="kitelogo"
              className="img-fluid"
              style={{ maxWidth: "160px", height: "auto" }}
            />
          </div>

          <h4 className="mb-4 login-heading log">Login As</h4>

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4 buttons">
            <button
              className="btn btn-outline-primary custom-btn admin"
              onClick={() => {
                loginAsAdmin(); // Store in context
                navigate("/Admin");
              }}
            >
              Admin
            </button>
            <button
              className="btn custom-btn text-white"
              style={{ backgroundColor: "#085EA1" }}
              onClick={() => {
                loginAsEmployee(); // Store in context
                navigate("/Employeelogin");
              }}
            >
              Employee
            </button>
          </div>

          <p className="text-muted login-caption">
            Welcome back! Let's have a productive day
          </p>
        </div>
      </div>

      {/* Right Section - Image Background */}
      <div className="col-12 col-lg-7 login-image d-lg-block second"></div>
    </div>
  );
};

export default Login;
