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
import { FaTelegramPlane, FaBirthdayCake } from "react-icons/fa";
import { Outlet } from "react-router-dom";
import { MdHolidayVillage } from "react-icons/md";
import Swal from "sweetalert2";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { BASE_URL } from "./Api";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [birthdays, setBirthdays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // 🔹 Auto collapse sidebar for mobile view
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Run on mount
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the application.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear auth tokens
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");

        // Redirect to home
        navigate("/");
      }
    });
  };

  const fetchBirthdays = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employee/wishes`);
      console.log(res.data.data);
      setBirthdays(res.data.data || []);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching birthdays:", err);
      Swal.fire("Error", "Failed to load birthdays", "error");
    }
  };

  // 🔹 Send Wish
  const handleSendWish = async () => {
    if (!selectedEmp) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (!token) {
      Swal.fire(
        "Error",
        "Missing authentication token. Please log in again.",
        "error"
      );
      return;
    }

    const payload = {
      receiver_id: selectedEmp.user_id,
      type: "birthday",
      message: wishMessage || `🎉 Happy Birthday ${selectedEmp.employee}! 🎂`,
    };

    try {
      await axios.post(`${BASE_URL}/messages/send`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire("Success", "Wish sent successfully!", "success");
      setShowModal(false);
      setWishMessage("");
    } catch (err) {
      console.error("Error sending wish:", err.response?.data || err.message);
      Swal.fire("Error", "Failed to send wish", "error");
    }
  };

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

          <NavLink
            to="/Layout/Policy"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <FaBookOpen className="icon" /> {/* You can change the icon */}
            {!isCollapsed && <span>Policy</span>}
          </NavLink>
          <NavLink
            to="/Layout/holiday"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <MdHolidayVillage className="icon" />{" "}
            {/* You can change the icon */}
            {!isCollapsed && <span>Holiday</span>}
          </NavLink>
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
            <div
              className="text-center rounded-pill d-flex align-items-center justify-content-center"
              style={{
                height: "30px",
                width: "30px",
                background: "orange",
                cursor: "pointer",
              }}
              onClick={fetchBirthdays}
            >
              <FaBirthdayCake style={{ color: "white" }} />
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
              onClick={handleLogout}
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

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg" // 👈 wider on large screens
        dialogClassName="birthday-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>🎉 Today's Birthdays</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {birthdays.length > 0 ? (
            birthdays.map((emp, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center p-2 border rounded mb-2"
              >
                {/* Profile Image */}
                <img
                  src={emp.profile_image}
                  alt={emp.employee}
                  className="rounded-circle me-3"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />

                {/* Employee Info */}
                <div className="flex-grow-1">
                  <strong>{emp.employee}</strong>
                  <p className="mb-1 text-muted">{emp.type}</p>
                  <small className="text-secondary">{emp.message}</small>
                </div>

                {/* Send Wish Button */}
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => setSelectedEmp(emp)}
                >
                  Send Wish
                </Button>
              </div>
            ))
          ) : (
            <p>No birthdays today 🎂</p>
          )}

          {/* If one employee is selected, show input for custom message */}
          {selectedEmp && (
            <Form.Group className="mt-3">
              <Form.Label>Wish Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={`🎉 Happy Birthday ${selectedEmp.employee}! 🎂`}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
              />
              <Button
                className="mt-2"
                variant="primary"
                onClick={handleSendWish}
              >
                Send
              </Button>
            </Form.Group>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Layout;
