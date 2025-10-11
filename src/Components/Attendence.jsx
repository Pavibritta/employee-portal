import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { Card, Button, Modal } from "react-bootstrap";
import { SlCalender } from "react-icons/sl";
import axios from "axios";
import "./Attendence.css";
import { BASE_URL } from "./Api";
import { useUser } from "./Contexts/UserContext";
import { useEmployeeData } from "./Contexts/EmployeeDataContext";
const Attendence = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // Show only 3 initially
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { employeeData } = useEmployeeData();
  console.log("employeedata", employeeData);

  const employeeId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");
  const token = localStorage.getItem("");
  const limit = 10;

  const getMonthName = (m) =>
    new Date(2000, m - 1).toLocaleString("default", { month: "long" });

  // Reset on month/year change
  useEffect(() => {
    setAttendanceData([]);
    setPage(1);
    setVisibleCount(3);
    setHasMore(true);
  }, [month, year]);

  // Fetch data
  useEffect(() => {
    if (!user || !user.role) return;

    const fetchAttendance = async () => {
      try {
        let id;

        if (user.role === "admin") {
          id = employeeData?.user_id || localStorage.getItem("userId");
        } else {
          id = localStorage.getItem("userId");
        }

        if (!id) {
          console.warn("⚠️ No user_id available yet, waiting...");
          return;
        }

        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("❌ No auth token found in localStorage!");
          return;
        }

        const endpoint =
          user.role === "admin"
            ? `${BASE_URL}/attendanceuserid?user_id=${id}&month=${month}&year=${year}`
            : `${BASE_URL}/attendance?user_id=${id}&month=${month}&year=${year}`;

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ include token
          },
        });

        console.log("✅ Attendance fetched:", res.data);

        const newData = res.data.attendances || [];
        if (newData.length < limit) setHasMore(false);
        setAttendanceData(newData);
      } catch (err) {
        console.error("❌ Error fetching attendance:", err);
        setHasMore(false);
      }
    };

    // 🕒 Add slight delay to ensure context is ready
    const delayFetch = setTimeout(fetchAttendance, 300);
    return () => clearTimeout(delayFetch);
  }, [page, month, year, user, employeeData]);

  const loadMore = () => {
    if (visibleCount < attendanceData.length) {
      setVisibleCount((prev) => prev + 3);
    } else if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDateChange = () => {
    setShowModal(false);
    setPage(1);
    setVisibleCount(3);
  };

  // 🕒 Utility to convert UTC time string to IST (HH:mm:ss)
  // format "15:01:52" → "03:01:52 PM"
  const formatTo12Hour = (time) => {
    if (!time) return "-";
    const [hour, minute, second] = time.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 → 12
    return `${String(h).padStart(2, "0")}:${minute}:${second} ${ampm}`;
  };

  return (
    <div style={{ background: "#E3EDF9" }}>
      {user.role === "employee" && <Navbar />}

      <div className="container-fluid p-4 attendence-container p-2">
        {/* Breadcrumb */}
        {user.role === "employee" && (
          <div className="container mb-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-white px-3 py-2 rounded shadow-sm">
                <li className="breadcrumb-item">
                  <Link to="/Userdashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Attendance
                </li>
              </ol>
            </nav>
          </div>
        )}

        {/* Header */}
        <div className="container mb-3 bg-white p-2">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="text-muted">
              {getMonthName(month)} {year}
            </h3>
            <Button
              variant="light"
              className="rounded-circle p-2 shadow-sm"
              onClick={() => setShowModal(true)}
            >
              <SlCalender size={20} />
            </Button>
          </div>

          {/* Cards */}
          <div className="container mt-3">
            {attendanceData.length > 0 ? (
              attendanceData.slice(0, visibleCount).map((entry, idx) => (
                <Card
                  key={idx}
                  className="shadow-sm mb-3 p-3"
                  style={{ borderLeft: "4px solid green" }}
                >
                  <h5 className="text-center text-muted">
                    {new Date(entry.date).toDateString()}
                  </h5>

                  <div className="d-flex justify-content-evenly text-muted small gap-5 mt-3">
                    <div>
                      <div>Check-In</div>
                      <div className="text-primary">
                        {formatTo12Hour(entry.check_in)}
                      </div>
                    </div>
                    <div>
                      <div>Check-Out</div>
                      <div className="text-success">
                        {formatTo12Hour(entry.check_out)}
                      </div>
                    </div>
                    <div>
                      <div>Work Hrs</div>
                      <div className="text-warning">{entry.working_hours}</div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted">No attendance data.</p>
            )}
          </div>

          {/* More Button */}
          {(visibleCount < attendanceData.length || hasMore) && (
            <div className="text-center">
              <Button className="morebtn px-5 mt-3" onClick={loadMore}>
                More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Month & Year</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={handleDateChange}>
            Apply
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Attendence;
