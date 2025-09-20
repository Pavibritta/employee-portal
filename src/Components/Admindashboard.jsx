import React, { useState, useEffect } from "react";
import { FaUser, FaUserCheck, FaUserTimes, FaUserClock } from "react-icons/fa";
import "./Admindashboard.css";
import { MdDashboard } from "react-icons/md";
import profile from "../images/dpimg.jpg";
import axios from "axios";
import { Badge } from "react-bootstrap";

import { BASE_URL } from "./Api";
const Admindashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [loading, setLoading] = useState([]);

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
        setEmployees(res.data.data.data); // Nested inside `data.data`
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
  return (
    <div className="admin-dashboard container-fluid m-3 mt-lg-5">
      <MdDashboard className="text-dark fs-40 m-3" />
      <span>Dashboard</span>
      {/* Top Cards */}
      <div className="row g-3 m-5 mt-1">
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-primary text-white d-flex align-items-center p-3 rounded">
            <FaUser className="icon me-3" size={30} />
            <div>
              <div className="fw-semibold">Employee</div>
              <h4>{counts["Total Employees"]}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-danger text-white d-flex align-items-center p-3 rounded">
            <FaUserCheck className="icon me-3" size={30} />
            <div>
              <div className="fw-semibold">Check In</div>
              <h4>{counts.Present}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-dark text-white d-flex align-items-center p-3 rounded">
            <FaUserTimes className="icon me-3" size={30} />
            <div>
              <div className="fw-semibold">Absent</div>
              <h4>{counts.Absent}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-10 col-md-3">
          <div className="dashboard-card bg-warning text-dark d-flex align-items-center p-3 rounded">
            <FaUserClock className="icon me-3" size={30} />
            <div>
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
          <h5 className="mb-3">Employees List</h5>
          {employees.map((emp, index) => (
            <div
              key={index}
              className="d-flex align-items-center bg-light p-2 rounded mb-2 shadow-sm"
            >
              <img
                src={`${BASE_URL}/employees/${emp.id}/profile-image`}
                alt="profile"
                className="rounded-circle mb-3"
                width="30"
                height="30"
                onError={(e) => (e.target.src = profile)} // 👈 fallback if no profile image
              />
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <strong>
                    {emp.first_name} {emp.last_name}
                  </strong>
                  <strong>{emp.employee_id}</strong>
                </div>
                <div className="text-muted small">{emp.designation_name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Today Leaves */}
        <div className="col-md-6">
          <h5 className="mb-3">Today Leave Request</h5>
          {todayLeaves.length > 0 ? (
            todayLeaves.map((leave, index) => (
              <div
                key={leave.id || index}
                className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-3 shadow-sm"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={`${BASE_URL}/employees/${leave.id}/profile-image`}
                    alt="profile"
                    className="rounded-circle mb-3"
                    width="30"
                    height="30"
                    onError={(e) => (e.target.src = profile)} // 👈 fallback if no profile image
                  />
                  <div>
                    <h6 className="mb-1">
                      {leave.first_name} {leave.last_name}
                    </h6>
                    <div className="small text-muted">
                      {leave.leave_type_name} | {leave.total_days} Day(s)
                    </div>
                    <div className="small text-muted">
                      {leave.start_date} to {leave.end_date}
                    </div>
                  </div>
                </div>
                <div>
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
              </div>
            ))
          ) : (
            <p className="text-muted">No one is on leave today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
