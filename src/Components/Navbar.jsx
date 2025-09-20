import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { IoMdNotifications } from "react-icons/io";
import dpimg from "../images/dpimg.jpg";
import NotificationModal from "./NotificationModal ";
import kitelogo from "../images/kitelogo.png";
import { IoMdMenu } from "react-icons/io";
import Employeeprofile from "./Employeeprofile";

const Navbar = () => {
  const [showNot, setShownot] = useState(false);
  const [showMenu, setShowmenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="container-fluid d-flex justify-content-between align-items-center  flex-wrap p-1 bg-white sticky-header ">
      {/* Left: Logo */}
      <div className="logo-container">
        <img src={kitelogo} alt="kitelogo" className="logo-img" />
      </div>
      <div>
        <IoMdMenu
          className="text-black fs-3 d-md-none"
          onClick={() => setShowmenu(!showMenu)}
        />
      </div>
      {/* Center: Navigation Tabs */}
      <div
        className={`mt-1 mb-3 justify-content-between gap-5 ${
          showMenu ? "d-flex flex-wrap gap-3" : "d-none d-md-flex"
        }`}
      >
        <div className="nav-tabs d-flex gap-5 me-5">
          <Link to="/Userdashboard" className="nav-item active">
            Dashboard
          </Link>
          <Link to="/policy" className="nav-item">
            Policy
          </Link>
        </div>

        {/* Right: Icons and Logout */}
        <div className="nav-icons d-flex align-items-center gap-4 me-5">
          <div
            className="icon-circle note  position-relative"
            onClick={() => setShownot(true)}
          >
            <IoMdNotifications size={20} color="white" />
            <span className="red-dot"></span>
          </div>

          <div
            className="bg-warning rounded-pill"
            style={{ cursor: "pointer" }} // make it look clickable
            onClick={() => setShowProfile(true)}
          >
            <img
              src={dpimg}
              alt="profile"
              height="30"
              width="30"
              className="p-1"
            />
          </div>

          <Link to="/" className="logout-link">
            Logout
          </Link>
        </div>

        <NotificationModal
          show={showNot}
          handleClose={() => setShownot(false)}
        />
      </div>
      {showProfile && (
        <div className="profile-container shadow rounded p-3 mt-2 w-100">
          <Employeeprofile
            show={showProfile}
            handleClose={() => setShowProfile(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
