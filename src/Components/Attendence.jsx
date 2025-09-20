import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { Card, Button, Modal } from "react-bootstrap";
import { SlCalender } from "react-icons/sl";
import axios from "axios";
import "./Attendence.css";
import { BASE_URL } from "./Api";

const Attendence = () => {
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // Show only 3 initially
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const employeeId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");
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
    if (!employeeId || !authToken) {
      console.error("Missing employeeId or authToken.");
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/attendance?user_id=${employeeId}&month=${month}&year=${year}&page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        console.log(res);
        const newData = res.data.attendances || [];

        if (newData.length < limit) setHasMore(false);

        setAttendanceData((prev) => {
          const existingDates = new Set(prev.map((entry) => entry.date));
          const filtered = newData.filter(
            (entry) => !existingDates.has(entry.date)
          );
          return [...prev, ...filtered];
        });
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setHasMore(false);
      }
    };

    fetchAttendance();
  }, [page, month, year]);

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

  return (
    <div style={{ background: "#E3EDF9" }}>
      <Navbar />

      <div className="container-fluid p-4 attendence-container mt-5 p-2">
        {/* Breadcrumb */}
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
                      <div className="text-primary">{entry.check_in}</div>
                    </div>
                    <div>
                      <div>Check-Out</div>
                      <div className="text-success">{entry.check_out}</div>
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
