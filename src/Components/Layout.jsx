import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiMenu2Fill } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { FaRegUser, FaBookOpen, FaMoneyCheckAlt } from "react-icons/fa";
import { GiInjustice } from "react-icons/gi";
import { IoMdLogOut } from "react-icons/io";
import "./Layout.css";
import kitelogo from "../images/kitelogo.png";
import dpimg from ".././images/dpimg.jpg";
import { FaTelegramPlane } from "react-icons/fa";
import { Outlet } from "react-router-dom";
const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout-container d-flex">
      {/* Sidebar */}
      <div className="row layout">
        <div
          className={`sidebar d-flex flex-column p-0 ${
            isCollapsed ? "collapsed" : ""
          }`}
        >
          {/* Hamburger */}
          <div className="hamburger-wrapper d-flex justify-content-between  mt-0 bg-white">
            {!isCollapsed && (
              <img src={kitelogo} alt="Logo" style={{ height: "50px" }} />
            )}
            <button
              className="hamburger-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <RiMenu2Fill size={18} />
            </button>
          </div>

          {/* Sidebar Links */}
          <NavLink
            to="/Layout/Admindashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <MdDashboard className="icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/Layout/Employemanagement"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <FaRegUser className="icon" />
            {!isCollapsed && <span>Employee Management</span>}
          </NavLink>

          <NavLink
            to="/Layout/attendencemanagement"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <GiInjustice className="icon" />
            {!isCollapsed && <span>Attendance</span>}
          </NavLink>

          <NavLink
            to="/Layout/Leavemanagement"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <FaBookOpen className="icon" />
            {!isCollapsed && <span>Leave Management</span>}
          </NavLink>

          <NavLink
            to="/Layout/Salarymanagement"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <FaMoneyCheckAlt className="icon" />
            {!isCollapsed && <span>Salary</span>}
          </NavLink>

          {/* <button className="btn btn-danger logout mt-5" onClick={() => navigate("/")}>
            <IoMdLogOut />
            {!isCollapsed && <span>Logout</span>}
          </button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        {/* Navbar */}
        <div className="top-navbar d-flex justify-content-around align-items-center shadow-sm">
          {isCollapsed && (
            <img
              src={kitelogo}
              className=""
              alt="Logo"
              style={{ height: "40px" }}
            />
          )}

          <div className="d-flex align-items-center flex-grow-1 justify-content-center">
            {/* <div className="custom-search-bar d-flex align-items-center">
              <select className="form-select custom-select">
                <option>All Candidates</option>
                <option>Shortlisted</option>
                <option>Interviewed</option>
              </select>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-control custom-input"
                  placeholder="Search..."
                />
                <i className="fa fa-search search-icon" />
              </div>
            </div> */}
          </div>

          <div className="d-flex align-items-center gap-3">
  <div
    className="text-center rounded-pill"
    style={{ height: "30px", width: "30px", background: "#085C9E" }}
  >
    <NavLink to="/Layout/Announcement">
      <FaTelegramPlane style={{ color: "white" }} />
    </NavLink>
  </div>

  <NavLink to="/Layout/Adminprofile">
    <img
      src={dpimg}
      alt="Profile"
      className="rounded-circle"
      style={{ width: "35px", height: "35px", cursor: "pointer" }}
    />
  </NavLink>

  {/* 🔹 Styled Logout Button */}
  <button
    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
    onClick={() => navigate("/")}
  >
    <IoMdLogOut size={18} />
    <span className="d-none d-md-inline">Logout</span>
  </button>
</div>

        </div>

        {/* Outlet (Content) */}
        <div className="page-content mt-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
