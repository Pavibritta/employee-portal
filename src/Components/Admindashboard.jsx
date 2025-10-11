import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaUserCheck, FaUserTimes, FaUserClock } from "react-icons/fa";
import "./Admindashboard.css";
import { MdDashboard } from "react-icons/md";
import profile from "../images/dpimg.jpg";
import axios from "axios";
import { Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdFirstPage } from "react-icons/md";
import { MdLastPage } from "react-icons/md";

import { BASE_URL } from "./Api";
const Admindashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [loading, setLoading] = useState([]);
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // ✅ flag
  const [loadingContent, setLoadingContent] = useState(false);

  const containerRef = useRef(null);
  const fetchAttendanceData = async (selectedDate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token Missing", "Please log in again.", "warning");
        return;
      }

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
      const today = new Date().toISOString().split("T")[0];
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const todayData = data.filter((item) => item.date === today);
      console.log("data", todayData);
      setAttendanceData(todayData);
      // setPresentData(data);
    } catch (error) {
      console.error("❌ API Error:", error);
      // Swal.fire({
      //   icon: "error",
      //   title: "Fetch Failed",
      //   text: "Unable to load attendance data.",
      // });
      setAttendanceData([]);
      // setPresentData([])
    } finally {
      setLoading(false);
    }
  };

  // Fetch Attendance
  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const [counts, setCounts] = useState({
    Present: 0,
    Absent: 0,
    "On Leave": 0,
    "Total Employees": 0,
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setEmployees(res.data.data.data);
        console.log("employees", res.data.data.data); // Nested inside `data.data`
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    fetchDashboardData();
    fetchTodayLeaves(); // new call
  }, []);

  const fetchTodayLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/leave-applications/current-day`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const leaves = res.data?.data?.leave_applications?.data || [];
      console.log(leaves);
      setTodayLeaves(leaves);
    } catch (error) {
      console.error("Today leave fetch error", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/attendance/current-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data || {};
      setCounts({
        Present: data.counts?.["Checked In"] || 0,
        Absent: data.counts?.Absent || 0,
        "On Leave": data.counts?.["On Leave"] || 0,
        "Total Employees": data.counts?.["Total Employees"] || 0,
      });
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };
  console.log(counts);

  // employees = your 17 employees
  // attendance = today's 14 records
  console.log(
    "Employees:",
    employees.map((e) => e.date_of_birth)
  );
  console.log(
    "AttendanceData:",
    attendanceData.map((a) => a.user?.employee_id)
  );

  // 1️⃣ Get today's date in 'YYYY-MM-DD' format
  const today = new Date().toISOString().split("T")[0];
  // ✅ check who has birthday today
  const todayDate = new Date();
  const todayMonth = todayDate.getMonth() + 1; // (0-based, so +1)
  const todayDay = todayDate.getDate();

  const birthdayEmployees = employees.filter((e) => {
    if (!e.date_of_birth) return false; // skip empty
    const [year, month, day] = e.date_of_birth.split("-"); // assuming format "YYYY-MM-DD"
    return parseInt(month) === todayMonth && parseInt(day) === todayDay;
  });

  console.log("🎂 Birthday Employees:", birthdayEmployees);

  // 2️⃣ Merge employees with today's attendance
  // 2️⃣ Merge employees with today's attendance
  const mergedData = employees.map((emp) => {
    const empId = String(emp.employee_id).trim().toLowerCase();

    const att = attendanceData.find((a) => {
      const attId = String(a.user?.employee_id || a.employee_id)
        .trim()
        .toLowerCase();
      return attId === empId && a.date === today;
    });

    return {
      ...emp,
      check_in: att?.check_in || null, // null if not checked in
      status: att ? att.status : "absent", // 'absent' if no record
    };
  });

  // ✅ Sort: show employees with check_in first
  // ✅ Sort: Employees who checked in come first,
  // then sorted by earliest check_in time
  const sortedMergedData = [...mergedData].sort((a, b) => {
    if (a.check_in && b.check_in) {
      // Both have check_in → compare times
      return (
        new Date(`1970-01-01T${a.check_in}`) -
        new Date(`1970-01-01T${b.check_in}`)
      );
    }

    if (a.check_in && !b.check_in) return -1; // a checked in → comes first
    if (!a.check_in && b.check_in) return 1; // b checked in → comes first
    return 0; // both absent → keep order
  });

  console.log("sortedMergedData", sortedMergedData);

  // 🔢 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sortedMergedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = sortedMergedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loading || !hasMore) return;

    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 5
    ) {
      // near bottom → load next page
      setPage((prev) => prev + 1);
    }
  };
  return (
    <div className="admin-dashboard container-fluid mt-lg-5 mt-5">
      <MdDashboard className="text-dark fs-40 m-3" />
      <span>Dashboard</span>
      {/* Top Cards */}
      <div className="row g-3 m-5 mt-1">
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-primary text-white d-flex align-items-center p-3 rounded">
            <FaUser className="icon me-3" size={30} />
            <div onClick={() => navigate("/Layout/Employemanagement")}>
              <div className="fw-semibold">Employee</div>
              <h4>{counts["Total Employees"]}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-danger text-white d-flex align-items-center p-3 rounded">
            <FaUserCheck className="icon me-3" size={30} />
            <div onClick={() => navigate("/Layout/attendencemanagement")}>
              <div className="fw-semibold">Check In</div>
              <h4>{counts.Present}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-dark text-white d-flex align-items-center p-3 rounded">
            <FaUserTimes className="icon me-3" size={30} />
            <div
              onClick={() =>
                navigate("/Layout/Attendencemanagement", {
                  state: { tab: "absent" },
                })
              }
            >
              <div className="fw-semibold">Absent</div>
              <h4>{counts.Absent}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-warning text-dark d-flex align-items-center p-3 rounded">
            <FaUserClock className="icon me-3" size={30} />
            <div onClick={() => navigate("/Layout/Leavemanagement")}>
              <div className="fw-semibold">Leaves</div>
              <h4>{counts["On Leave"]}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List & Leave Section */}
      <div className="row g-4 m-3">
        {/* Employee List */}
        <div className="col-md-6">
          <h5 className="mb-3">Today Attendance</h5>
          <div
            className="d-flex flex-column gap-2"
            style={{ maxHeight: "400px", overflowY: "auto" }}
            ref={containerRef}
            onScroll={handleScroll}
          >
            {sortedMergedData.map((emp, index) => (
              <div
                key={index}
                className="d-flex align-items-center bg-light p-3 rounded shadow-sm justify-content-between"
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={`${BASE_URL}/employees/${emp.id}/profile-image`}
                    alt="profile"
                    className="rounded-circle"
                    width="40"
                    height="40"
                    onError={(e) => (e.target.src = profile)}
                  />
                  <div>
                    <div className="small text-muted">
                      Employee ID: {emp.employee_id}
                    </div>
                    <strong className="text-muted small mt-1 d-block">
                      {emp.first_name} {emp.last_name}
                    </strong>
                  </div>
                </div>
                <div className="text-end">
                  <strong className="small text-muted">
                    Check In:{" "}
                    {emp.check_in || (
                      <span className="text-danger small">---</span>
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          {/* {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
              <MdFirstPage
                size={20} // numeric size in pixels
                style={{
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onClick={() => goToPage(currentPage - 1)}
              />

              <span>
                Page {currentPage} of {totalPages}
              </span>
              <MdLastPage
                size={20} // numeric size in pixels
                style={{
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
                onClick={() => goToPage(currentPage + 1)}
              />
            </div>
          )} */}

          {loading && (
            <div className="text-center py-2 text-muted">Loading...</div>
          )}
          {!hasMore && (
            <div className="text-center py-2 text-muted">No more records</div>
          )}
        </div>

        {/* Today Leaves */}
        <div className="col-md-6">
          <h5 className="mb-3">Today Leave Request</h5>
          <div className="d-flex flex-column gap-2">
            {todayLeaves.length > 0 ? (
              todayLeaves.map((leave, index) => (
                <div
                  key={leave.id || index}
                  className="d-flex align-items-center bg-light p-3 rounded shadow-sm justify-content-between"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={`${BASE_URL}/employees/${leave.id}/profile-image`}
                      alt="profile"
                      className="rounded-circle"
                      width="40"
                      height="40"
                      onError={(e) => (e.target.src = profile)}
                    />
                    <div>
                      <strong>
                        {leave.first_name} {leave.last_name}
                      </strong>
                      <div className="small text-muted">
                        {leave.leave_type_name} | {leave.total_days} Day(s)
                      </div>
                      <div className="small text-muted">
                        {leave.start_date} to {leave.end_date}
                      </div>
                    </div>
                  </div>
                  <Badge
                    bg={
                      leave.status === "Approved"
                        ? "success"
                        : leave.status === "Pending"
                        ? "warning"
                        : leave.status === "Rejected"
                        ? "danger"
                        : "secondary"
                    }
                  >
                    {leave.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted">No one is on leave today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
