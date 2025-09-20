import React, { useState, useEffect, useRef } from "react";
import "./Applyleave.css";
import Navbar from "./Navbar";
import Card from "react-bootstrap/Card";
import { Link, useNavigate } from "react-router-dom";
import { SlCalender } from "react-icons/sl";
import axios from "axios";
import { BASE_URL } from "./Api";

const Applyleave = () => {
  const navigate = useNavigate();

  // Leave counts
  const [casual, setCasual] = useState(12);
  const [sick, setSick] = useState(3);
  const [optional, setOptional] = useState(1);
  const [leavesleft, setLeavesleft] = useState(16);
  const [summaryTotal, setSummaryTotal] = useState(0);

  // Leave data and date filter
  const [leaveApplications, setLeaveApplications] = useState([]);
  const userId = localStorage.getItem("userId");

  const today = new Date();
  const defaultMonthYear = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultMonthYear);

  const inputRef = useRef(null);

  // API call to fetch leaves
  const fetchLeaveApplications = async (month, year) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${BASE_URL}/leave/applications?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("leaveapplcation", response);
      if (response.data?.data?.data) {
        setLeaveApplications(response.data.data.data);
      } else {
        setLeaveApplications([]);
      }
    } catch (error) {
      console.error("Failed to fetch leave applications:", error);
    }
  };

  // Handle date change
  const handleMonthYearChange = (e) => {
    const value = e.target.value; // YYYY-MM
    setSelectedMonthYear(value);
  };

  // Show input picker when calendar icon clicked
  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // Optional chaining in case of older browsers
    }
  };

  // Fetch data when selectedMonthYear changes
  useEffect(() => {
    const [year, month] = selectedMonthYear.split("-");
    fetchLeaveApplications(parseInt(month), parseInt(year));
  }, [selectedMonthYear]);

  // Format date for UI
  const formatDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchLeaveSummary = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BASE_URL}/leave-summary/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("leaveReport", response.data.summary);

      if (response.data.summary) {
        const summary = response.data.summary;

        setCasual(summary["Casual Leave pending"] || 0);
        setSick(summary["Sick Leave pending"] || 0);
        setOptional(summary["Optional Holiday or other leave pending"] || 0);
        setLeavesleft(summary["Leaves_Left pending"] || 0);

        const total =
          (summary["total Casual Leave"] || 0) +
          (summary["total Sick Leave"] || 0) +
          (summary["total Optional Holiday or other leave"] || 0) +
          (summary["total Other Leave"] || 0);

        setSummaryTotal(total);
      }
    } catch (error) {
      console.error("Failed to fetch leave summary:", error);
    }
  };

  useEffect(() => {
    fetchLeaveSummary();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container-fluid p-4 applyleave">
        <nav aria-label="breadcrumb" className="mb-4 breadcrums">
          <ol className="breadcrumb">
            <li className="breadcrumb-item dash">
              <Link to="/Userdashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active dash" aria-current="page">
              Apply for Leave
            </li>
          </ol>
        </nav>

        <div className="row">
          {/* Leave Summary */}
          <div className="col-12 col-md-6 mb-4">
            <Card className="shadow-sm p-3 rounded-4 h-100">
              <Card.Body className="d-flex flex-column justify-content-between h-100">
                <h5 className="cardhead text-center mb-4">Leave Summary</h5>

                <div className="progress mb-4" style={{ height: "20px" }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(
                        (leavesleft / (summaryTotal || 1)) *
                        100
                      ).toFixed(0)}%`,
                      background: "#58db2a",
                      borderRadius: "7px",
                    }}
                  />
                </div>

                <div className="d-flex flex-wrap justify-content-around gap-3 mb-4 text-center">
                  <div className="countdiv">
                    <h3 className="noofdays" style={{ color: "#fb993f" }}>
                      {casual}
                    </h3>
                    <h5 className="leavetype">Casual</h5>
                  </div>
                  <div className="countdiv">
                    <h3 className="noofdays" style={{ color: "#3de0e0" }}>
                      {sick < 10 ? `0${sick}` : sick}
                    </h3>
                    <h5 className="leavetype">Sick</h5>
                  </div>
                  <div className="countdiv">
                    <h3 className="noofdays" style={{ color: "#5754e4" }}>
                      {optional < 10 ? `0${optional}` : optional}
                    </h3>
                    <h5 className="leavetype">Optional</h5>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-success fw-bold fs-1">{leavesleft}</h3>
                  <small className="cardhead">Leaves Left</small>
                </div>

                <button
                  className="btn btn-primary w-100 rounded-pill applyleavebtn"
                  onClick={() => navigate("/Chooseleave")}
                >
                  Apply Leave
                </button>
              </Card.Body>
            </Card>
          </div>

          {/* Leave Report */}
          <div className="col-12 col-md-6 mb-4">
            <Card className="shadow-sm p-3 rounded-4 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <h5 className="cardhead m-0">Leaves Report</h5>
                  <div className="calendar-picker-wrapper position-relative d-flex align-items-center gap-2">
                    <SlCalender
                      size={20}
                      style={{ cursor: "pointer" }}
                      onClick={handleIconClick}
                    />
                    <input
                      type="month"
                      ref={inputRef}
                      value={selectedMonthYear}
                      onChange={handleMonthYearChange}
                      className="form-control form-control-sm"
                      style={{ maxWidth: "130px" }}
                    />
                  </div>
                </div>

                <p className="text-muted mb-4">Recent Applications</p>

                {leaveApplications.length > 0 ? (
                  leaveApplications.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border p-3 mb-3 rounded bg-light"
                    >
                      <div>
                        <strong>
                          {formatDateWithDay(item.start_date)} to{" "}
                          {formatDateWithDay(item.end_date)}
                        </strong>
                        {item.status === "rejected" &&
                          item.rejection_reason && (
                            <p className="text-danger mt-2 mb-0 small">
                              Reason: {item.rejection_reason}
                            </p>
                          )}
                        <ul className="mb-0 ps-4">
                          <li className="text-muted">
                            {item.leave_type?.name}
                          </li>
                        </ul>
                      </div>
                      <span
                        className={`badge px-3 py-2 mt-2 mt-sm-0 ${
                          item.status === "approved"
                            ? "bg-success"
                            : item.status === "rejected"
                            ? "bg-danger"
                            : "bg-secondary"
                        } text-white`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No leave records found.</p>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Applyleave;
