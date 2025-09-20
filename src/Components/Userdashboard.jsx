import { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import profile from "../images/profileimg1.jpg";
import { FaClock } from "react-icons/fa";
import "./Userdashboard.css";
import axios from "axios";
import { useEmployee } from "./Contexts/EmployeeContext";
import { BASE_URL } from "./Api";

const Userdashboard = () => {
  const { updateEmployeeData } = useEmployee();
  const navigate = useNavigate();

  const [check, setCheck] = useState("Check In");
  const [workingTime, setWorkingTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [monthSummary, setMonthSummary] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [timerId, setTimerId] = useState(null);

  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const id = localStorage.getItem("Id");
  const employeeId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");
  const timerRef = useRef(null);
  // ---------------- Timer Helpers ----------------
  const startTimer = (initialSeconds = 0) => {
    if (timerRef.current) return; // prevent duplicate intervals
    timerRef.current = setInterval(() => {
      setWorkingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---------------- Current Time Clock ----------------
  useEffect(() => {
    const updateTime = () =>
      setCurrentTime(new Date().toTimeString().slice(0, 8));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- Fetch Current Attendance Status ----------------
  const fetchCurrentStatus = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const response = await axios.get(
        `${BASE_URL}/attendance?user_id=${employeeId}&month=${month}&year=${year}&page=1&limit=1`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200) {
        const data = response.data.attendances?.[0];

        if (
          data &&
          data.date === today &&
          data.status === "present" &&
          !data.check_out &&
          !hasCheckedOut // ✅ prevent overriding after manual checkout
        ) {
          // Checked in but not checked out
          setCheck("Check Out");
          setIsTracking(true);

          const checkInTime = new Date(`${today}T${data.check_in}`);
          const elapsed = Math.floor(
            (Date.now() - checkInTime.getTime()) / 1000
          );

          const workedSeconds = parseFloat(data.working_hours || 0) * 3600;
          const totalWorked = workedSeconds + elapsed;

          setWorkingTime(totalWorked);
          startTimer(totalWorked);
        } else {
          // Already checked out OR absent
          setCheck("Check In");
          setIsTracking(false);
          const backendHours = parseFloat(data?.working_hours || 0) * 3600;
          if (backendHours > 0) {
            setWorkingTime(backendHours);
          }

          stopTimer();
        }
      }
    } catch (error) {
      console.error("Failed to fetch current status", error);
    }
  };

  // ---------------- Handle Check In/Out ----------------
  // ---------------- Handle Check In/Out ----------------
  const confirmAction = async (title, confirmText, apiField, successMsg) => {
    const result = await Swal.fire({
      title,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const requestBody = {
        employee_id: parseInt(employeeId),
        date: new Date().toISOString().slice(0, 10),
        check_in_ip: "192.168.1.100",
        check_in_location: "Main Gate",
      };

      if (apiField === "check-in") {
        requestBody.check_in = new Date().toLocaleTimeString("en-GB", {
          hour12: false,
        });
      } else {
        requestBody.check_out = new Date().toLocaleTimeString("en-GB", {
          hour12: false,
        });
      }

      const response = await axios.post(
        `${BASE_URL}/attendance/${apiField}`,
        requestBody,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire(successMsg, "Operation successful.", "success");

        if (apiField === "check-out") {
          stopTimer();
          setIsTracking(false);
          // reset to 0 immediately
          setCheck("Check In");
          setHasCheckedOut(true); // mark checkout
        }

        // Refresh latest data from backend
        fetchCurrentStatus();
      }
    } catch (error) {
      console.error("Attendance error:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong.",
        "error"
      );
    }
  };

  // ---------------- Fetch Monthly Summary ----------------
  useEffect(() => {
    const fetchMonthSummary = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/attendance/user-month-summary?month=${selectedMonth}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            withCredentials: true,
          }
        );
        if (response.status === 200) setMonthSummary(response.data);
      } catch (err) {
        console.error("Failed to fetch monthly summary:", err);
      }
    };
    fetchMonthSummary();
  }, [selectedMonth]);

  // ---------------- Fetch Employee Details ----------------
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/employee/my-details`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });
        if (res.status === 200) {
          setEmployeeData(res.data.data);
          localStorage.setItem("Id", res.data.data.id);
          updateEmployeeData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      }
    };
    fetchEmployee();
  }, []);

  // ---------------- On Mount ----------------
  useEffect(() => {
    if (!employeeId || !authToken) {
      Swal.fire("Session Expired", "Please log in again.", "warning");
      navigate("/employeelogin");
      return;
    }
    fetchCurrentStatus();
    return () => stopTimer();
  }, []);

  // ---------------- Helpers ----------------
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const pad2 = (n) => n.toString().padStart(2, "0");

  // ---------------- Render ----------------
  return (
    <>
      <Navbar />
      <div className="container-fluid dashboard-container mt-2">
        <h4 className="dashboard-title mt-2 mb-4">Dashboard</h4>

        <div className="row text-white rounded-4 p-4 mb-4 top-card m-1">
          <div className="col-md-7 d-flex align-items-center gap-3">
            <img
              src={`${BASE_URL}/employees/${id}/profile-image`}
              alt="profile"
              className="rounded-circle mb-3"
              width="80"
              height="80"
              onError={(e) => (e.target.src = profile)}
            />

            <div>
              <h5 className="profile-name">
                {employeeData?.first_name} {employeeData?.last_name}
              </h5>
              <p className="designation">{employeeData?.designation_name}</p>
              <strong>{employeeData?.employee_id}</strong>
            </div>
          </div>

          <div className="col-md-5 text-center">
            <h5 className="attendance-title mb-3">Attendance</h5>
            <div className="d-flex justify-content-center gap-3 align-items-center flex-wrap mt-2">
              <div className="clock-box d-flex align-items-center gap-2 hover">
                <FaClock className="clock-icon" />
                <span className="clock-time">{formatTime(workingTime)}</span>
              </div>

              <button
                className="check-btn"
                onClick={() =>
                  check === "Check In"
                    ? confirmAction(
                        "Do you want to Check-In?",
                        "Check-In",
                        "check-in",
                        "Checked In"
                      )
                    : confirmAction(
                        "Do you want to Check-Out?",
                        "Check-Out",
                        "check-out",
                        "Checked Out"
                      )
                }
              >
                {check}
              </button>
            </div>
          </div>
        </div>

        <h5 className="quick-actions-title">Quick Actions</h5>
        <div className="row g-3 mb-4">
          {[
            { path: "Applyleave", label: "Apply Leave" },
            { path: "Attendence", label: "Attendance" },
            { path: "Payslip", label: "Pay Slip" },
            { path: "Updateprofile", label: "Update Profile" },
          ].map((item, i) => (
            <div key={i} className="col-sm-6 col-md-3">
              <button
                className="quick-btn w-100"
                onClick={() => navigate(`/${item.path}`)}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>

        {monthSummary && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="summary-box h-100 p-3">
                <h5>Today Attendance</h5>
                <div className="summary-cards d-flex flex-wrap gap-3 mt-3">
                  <div className="card present flex-fill mt-3">
                    <p className="fs-4 p-1">Present</p>
                    <strong>{pad2(monthSummary.data.present_days)}</strong>
                  </div>
                  <div className="card absent flex-fill mt-3">
                    <p className="fs-4 p-1">Absent</p>
                    <strong>{pad2(monthSummary.data.final_absent_days)}</strong>
                  </div>
                  <div className="card leave flex-fill mt-3">
                    <p className="fs-4 p-1">Leaves</p>
                    <strong>{pad2(monthSummary.data.leave_days)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="holiday-box p-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Coming Holidays</h5>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                  />
                </div>
                {monthSummary?.data?.holidays?.length > 0 ? (
                  <>
                    <p className="month-year">{monthSummary.data.month}</p>
                    {monthSummary.data.holidays.map((holiday, i) => (
                      <div className="holiday-card" key={i}>
                        <p className="holiday-date">{holiday.date}</p>
                        <p className="holiday-name">{holiday.description}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-muted">No holidays this month.</p>
                )}
                <div className="text-center mt-3">
                  <button className="view-all-btn">View All</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Userdashboard;
