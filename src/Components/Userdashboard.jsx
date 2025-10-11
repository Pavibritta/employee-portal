import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import profile from "../images/dpimg.jpg";
import { FaClock } from "react-icons/fa";
import "./Userdashboard.css";
import axios from "axios";
import { useEmployee } from "./Contexts/EmployeeContext";
import { useUser } from "./Contexts/UserContext";
import { BASE_URL } from "./Api";
import { Modal, Button } from "react-bootstrap";

const Userdashboard = () => {
  const { updateEmployeeData } = useEmployee();
  const { user, userId, setUserId } = useUser();
  // console.log("role", user);
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [absentData, setAbsentData] = useState([]);
  const [check, setCheck] = useState("Check In");
  const [workingTime, setWorkingTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [monthSummary, setMonthSummary] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [currentStatus, setCurrentstatus] = useState([]);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const id = localStorage.getItem("Id");
  const employeeId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");

  const fetchAttendanceData = async (selectedDate) => {
    try {
      const token = localStorage.getItem("authToken");
      // if (!token) {
      //   Swal.fire("Token Missing", "Please log in again.", "warning");
      //   return;
      // }

      const [year, month] = selectedDate.split("-");

      const res = await axios.get(
        `${BASE_URL}/attendance/all?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      // Filter only today's data
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const todayData = data.filter((item) => item.date === today);

      console.log("Today's attendance:", todayData);
      setAttendanceData(todayData);
    } catch (error) {
      console.error("❌ API Error:", error);
      // Swal.fire({
      //   icon: "error",
      //   title: "Fetch Failed",
      //   text: "Unable to load attendance data.",
      // });
      setAttendanceData([]);
    }
  };

  // Fetch Attendance
  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchAbsentData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const [year, month, day] = selectedDate.split("-"); // 👈 also extract day

        const res = await axios.get(
          `${BASE_URL}/attendances/${selectedDate}/absent`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("absent", res.data.data);
        setAbsentData(res.data.data || []);
        // setTodayAbsentData(res.data?.absent_employees || []);
      } catch (err) {
        console.error("❌ Error fetching absent data:", err);
        setAbsentData([]);
        // setTodayAbsentData([])
      }
    };

    fetchAbsentData();
  }, [selectedDate]);

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
        `${BASE_URL}/attendance?user_id=${employeeId}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200) {
        const data = response.data.attendances || [];
        console.log("attendances", data);

        const todayRecord = data.find((item) => item.date === today);
        setCurrentstatus(todayRecord);

        if (
          todayRecord &&
          todayRecord.status === "present" &&
          !todayRecord.check_out &&
          !hasCheckedOut
        ) {
          // Checked in but not checked out
          setCheck("Check Out");
          setIsTracking(true);

          const checkInTime = new Date(`${today}T${todayRecord.check_in}`);
          const elapsed = Math.floor(
            (Date.now() - checkInTime.getTime()) / 1000
          );

          const workedSeconds =
            parseFloat(todayRecord.working_hours || 0) * 3600;
          const totalWorked = workedSeconds + elapsed;

          setWorkingTime(totalWorked);
          startTimer(totalWorked);
        } else {
          // Already checked out OR absent
          setCheck("Check In");
          setIsTracking(false);

          const backendHours =
            parseFloat(todayRecord?.working_hours || 0) * 3600;
          if (backendHours > 0) {
            setWorkingTime(0);
          }

          stopTimer();
        }
      }
    } catch (error) {
      console.error("Failed to fetch current status", error);
    }
  };

  useEffect(() => {
    if (currentStatus) {
      console.log("currentStatus updated:", currentStatus);
    }
  }, [currentStatus]);

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
          stopTimer(); // Stop the running timer
          setIsTracking(false); // Stop tracking
          setWorkingTime(0); // ✅ Reset the displayed timer to 0
          setCheck("Check In"); // Change button back to Check In
          setHasCheckedOut(true); // Mark as checked out
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
          // setUserId(res.data.data.id);
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
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/messages/inbox`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log("wishes", response.data.data);
        setWishMessage(response.data.data || []); // ✅ save data in state
      } catch (error) {
        console.error("❌ Error fetching wishes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes(); // ✅ call the function
  }, [authToken]); // dependency so it runs when token is available

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
              <span>
                Total Working Hours: {currentStatus?.working_hours || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="row mb-4">
          {/* Quick Actions */}
          <div className="col-12">
            <h5 className="quick-actions-title mb-3">Quick Actions</h5>
            <div className="row g-3">
              {[
                { path: "Applyleave", label: "Apply Leave" },
                { path: "Attendence", label: "Attendance" },
                { path: "Payslip", label: "Pay Slip" },
                { path: "Updateprofile", label: "Update Profile" },
              ].map((item, i) => (
                <div key={i} className="col-lg-3 col-md-6">
                  <button
                    className="quick-btn w-100"
                    onClick={() => navigate(`/${item.path}`)}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {monthSummary && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div
                className="summary-box h-100 p-3"
                style={{ maxHeight: "250px", overflowY: "auto" }}
              >
                <h5>Attendance Month Summary</h5>
                <div className="summary-cards d-flex flex-wrap gap-1 mt-3">
                  <div className="card present flex-fill mt-3">
                    <p className="fs-8 p-1">Present</p>
                    <strong className="text-center">
                      {pad2(monthSummary.data.present_days)}
                    </strong>
                  </div>
                  <div className="card absent flex-fill mt-3">
                    <p className="fs-8 p-1">Remaining Days</p>
                    <strong className="text-center">
                      {pad2(monthSummary.data.final_absent_days)}
                    </strong>
                  </div>
                  <div className="card leave flex-fill mt-3">
                    <p className="fs-8 p-1">Leaves</p>
                    <strong className="text-center">
                      {pad2(monthSummary.data.leave_days)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 ">
              <div className="summary-box p-3">
                <h5>Today's Attendance</h5>

                {attendanceData.length > 0 || absentData.length > 0 ? (
                  <div style={{ maxHeight: "190px", overflowY: "auto" }}>
                    <table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>Present</th>
                          <th>Absent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Determine the max rows needed */}
                        {Array.from(
                          {
                            length: Math.max(
                              attendanceData.length,
                              absentData.length
                            ),
                          },
                          (_, index) => (
                            <tr key={index}>
                              <td>
                                {attendanceData[index]
                                  ? attendanceData[index].user?.full_name ||
                                    attendanceData[index].name
                                  : ""}
                              </td>
                              <td>
                                {absentData[index]
                                  ? absentData[index].name
                                  : ""}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No attendance records for today.</p>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="holiday-box p-1"
                style={{
                  maxHeight: "300px", // set the height of the container
                  overflowY: "auto", // vertical scroll
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
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
              </div>

              <div
                className="border rounded p-3 bg-white mt-2"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {wishMessage.length > 0 ? (
                  <>
                    <p className="fw-bold text-center mb-3">
                      {monthSummary?.data?.month}
                    </p>
                    <div className="d-flex flex-column gap-3">
                      {wishMessage.map((wish, i) => (
                        <div
                          className="p-3 border rounded shadow-sm bg-light"
                          key={i}
                        >
                          <p className="fw-semibold mb-1">
                            {wish.sender.first_name} {wish.sender.last_name}
                          </p>
                          <p className="mb-0 text-muted">{wish.message}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted text-center"></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Userdashboard;
