import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";
import { IoMdNotifications, IoMdMenu } from "react-icons/io";
import { FaBirthdayCake } from "react-icons/fa";
import dpimg from "../images/dpimg.jpg";
import kitelogo from "../images/kitelogo.png";
import Employeeprofile from "./Employeeprofile";
import axios from "axios";
import { BASE_URL } from "./Api";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [showNot, setShownot] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [showMenu, setShowmenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [birthdayList, setBirthdayList] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [wishMessage, setWishMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [wishes, setWishes] = useState([]);
  const [showWishes, setShowWishes] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the application.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear auth tokens or user info
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");

        // Redirect to login or home page
        navigate("/");
      }
    });
  };
  // ---------------- Fetch Announcements ----------------
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/announcements`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const rawData = response.data.data?.data || []; // 👈 pagination fix

      const sorted = rawData
        .slice()
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .map((a) => ({ ...a, seen: a.seen ?? false }));

      setAnnouncements(sorted);
    } catch (err) {
      console.error("❌ Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ---------------- Fetch Birthday Wishes ----------------
  const fetchBirthdayWishes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employee/wishes`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("birth", res.data.data);
      if (res.status === 200) {
        setBirthdayList(res.data?.data || []);
      }
    } catch (err) {
      console.error("❌ Error fetching birthday wishes:", err);
      setBirthdayList([]);
    }
  };

  useEffect(() => {
    if (showBirthday) fetchBirthdayWishes();
  }, [showBirthday]);

  // ---------------- Handle Birthday Modal ----------------
  const handleOpenBirthdayModal = (emp) => {
    setSelectedEmp(emp);
    setWishMessage(emp.message || `🎉 Happy Birthday ${emp.name}! 🎂`);
    setShowBirthday(true);
  };

  const handleCloseBirthdayModal = () => {
    setShowBirthday(false);
    setSelectedEmp(null);
  };

  // ---------------- Send Birthday Wish ----------------
  const sendWish = async (emp) => {
    if (!emp) return;

    const payload = {
      receiver_id: emp.user_id, // correct field
      type: "birthday", // or emp.type
      message: wishMessage || `🎉 Happy Birthday ${emp.employee}! 🎂`,
    };

    console.log("Payload being sent:", payload);

    try {
      const res = await axios.post(`${BASE_URL}/messages/send`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        Swal.fire("Success", "Wish sent successfully!", "success");
        handleCloseBirthdayModal(); // ✅ use the correct close function
      }
    } catch (err) {
      console.error("❌ Error sending wish:", err.response?.data || err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to send wish.",
        "error"
      );
    }
  };
  useEffect(() => {
    fetchBirthdayWishes(); // Call immediately when page loads
  }, []);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/messages/inbox`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log("wishes", response.data.data);
      setWishes(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleOpen = () => {
    setShowWishes(true);
    fetchWishes();
  };

  const handleClose = () => setShowWishes(false);

  return (
    <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap p-1 bg-white sticky-header">
      {/* Logo */}
      <div className="logo-container">
        <img src={kitelogo} alt="kitelogo" className="logo-img" />
      </div>

      {/* Hamburger */}
      <IoMdMenu
        className="text-black fs-3 d-md-none"
        onClick={() => setShowmenu(!showMenu)}
      />

      {/* Navigation */}
      <div
        className={`mt-1 mb-3 justify-content-between gap-5 ${
          showMenu ? "d-flex flex-wrap gap-3" : "d-none d-md-flex"
        }`}
      >
        <div className="nav-tabs d-flex gap-5 me-5">
          <NavLink
            to="/Userdashboard"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/policy"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Policy
          </NavLink>
        </div>

        {/* Right icons */}
        <div className="nav-icons d-flex align-items-center gap-4 me-5">
          {/* Notifications */}
          <div
            className="icon-circle note position-relative"
            onClick={() => setShownot(!showNot)}
          >
            <IoMdNotifications size={20} color="white" />
            {announcements.filter((a) => !a.seen).length > 0 && (
              <span className="notification-badge">
                {announcements.filter((a) => !a.seen).length}
              </span>
            )}
          </div>

          {/* Birthday Icon */}
          <div
            className="icon-circle birthday position-relative note"
            onClick={() => setShowBirthday(true)}
          >
            {birthdayList.length > 0 && (
              <span className="notification-badge">{birthdayList.length}</span>
            )}
            <FaBirthdayCake size={20} color="white" />
          </div>

          {/* Profile */}
          <div
            className="bg-warning rounded-pill"
            style={{ cursor: "pointer" }}
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

          <button className="btn btn-link logout-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {showProfile && (
        <div className="profile-container shadow rounded p-3 mt-2 w-100">
          <Employeeprofile
            show={showProfile}
            handleClose={() => setShowProfile(false)}
          />
        </div>
      )}
      <Modal show={showNot} onHide={() => setShownot(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {announcements.length > 0 ? (
            announcements.map((item, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 border rounded ${
                  !item.seen ? "bg-light" : ""
                }`}
              >
                <strong>{item.title}</strong>
                <p className="mb-0">{item.content}</p>
                <small className="text-muted">
                  {new Date(item.published_at).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No notifications available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShownot(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ---------------- Birthday Modal ---------------- */}
      <Modal
        show={showBirthday}
        onHide={handleCloseBirthdayModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Birthday Wishes</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {birthdayList.length > 0 ? (
            birthdayList.map((emp, idx) => (
              <div
                key={idx}
                className="mb-3 p-3 border rounded d-flex justify-content-between align-items-start"
              >
                <div className="d-flex gap-3 align-items-start">
                  <img
                    src={emp.profile_image}
                    alt="profile"
                    className="rounded-circle"
                    width="50"
                    height="50"
                    onError={(e) => (e.target.src = dpimg)}
                  />
                  <div>
                    <strong>{emp.employee}</strong>
                    <p
                      className="mb-0 text-muted"
                      style={{ maxWidth: "350px" }}
                    >
                      {emp.message}
                    </p>
                  </div>
                </div>
                <Button
                  variant="success"
                  className="align-self-start"
                  onClick={() => handleOpenBirthdayModal(emp)}
                >
                  Send Wish
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No birthdays today.</p>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={showWishes} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Birthday Wishes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading wishes...</p>
          ) : wishes.length > 0 ? (
            wishes.map((wish, idx) => (
              <div key={idx} className="border-bottom pb-2 mb-2">
                <strong>
                  {wish.sender.first_name || "Unknown Sender"}{" "}
                  {wish.sender.last_name || "Unknown Sender"}{" "}
                </strong>
                <p className="mb-0 text-muted small">{wish.message}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">No birthday wishes found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ---------------- Send Wish Modal ---------------- */}
      <Modal show={!!selectedEmp} onHide={handleCloseBirthdayModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Birthday Wish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            To: <strong>{selectedEmp?.name}</strong>
          </p>
          <textarea
            className="form-control"
            rows={3}
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBirthdayModal}>
            Cancel
          </Button>
          <Button onClick={() => sendWish(selectedEmp)}>Send Wish</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Navbar;
