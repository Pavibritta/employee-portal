import React, { useEffect, useState } from "react";
import { Table, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import "./Leavemanagement.css";
import { BASE_URL } from "./Api";

const Leavemanagement = () => {
  const today = new Date();

  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState("day");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ✅ Fetch leave data dynamically based on filter mode
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    let url =
      viewMode === "month"
        ? `${BASE_URL}/leave-applications/month?month=${selectedMonth}&year=${selectedYear}`
        : `${BASE_URL}/leave-applications/month?month=${selectedMonth}&year=${selectedYear}&day=${selectedDay}`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLeaveData(res.data?.data?.data || []);
      })
      .catch((err) => console.error("Error fetching leave data:", err))
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear, selectedDay, viewMode]);

  // ✅ Handle Approve / Reject
  const handleStatusClick = (item) => {
    Swal.fire({
      title: `${item.first_name} ${item.last_name}'s Leave Details`,
      html: `
        <div class="swal-content text-start">
          <p><strong>Start Date:</strong> ${item.start_date}</p>
          <p><strong>End Date:</strong> ${item.end_date}</p>
          <p><strong>Total Days:</strong> ${item.total_days}</p>
          <p><strong>Leave Type:</strong> ${item.leave_type_name}</p>
          <p><strong>Reason:</strong> ${item.reason}</p>
        </div>
      `,
      showDenyButton: true,
      confirmButtonText: "Approve",
      denyButtonText: "Reject",
      confirmButtonColor: "#28a745",
      denyButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) {
        updateLeaveStatus(item.id, "approved");
      } else if (result.isDenied) {
        Swal.fire({
          title: "Reject Reason",
          input: "textarea",
          inputPlaceholder: "Enter rejection reason...",
          showCancelButton: true,
          confirmButtonText: "Submit",
          confirmButtonColor: "#dc3545",
        }).then((reasonResult) => {
          if (reasonResult.isConfirmed) {
            const reason = reasonResult.value || "No reason provided";
            updateLeaveStatus(item.id, "rejected", reason);
          }
        });
      }
    });
  };

  const updateLeaveStatus = (leaveId, status, rejection_reason = null) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const approved_by = user?.id || 1;

    const payload = { status, approved_by };
    if (status === "rejected" && rejection_reason)
      payload.rejection_reason = rejection_reason;

    axios
      .put(`${BASE_URL}/leave/${leaveId}/process`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        Swal.fire(
          status === "approved" ? "Approved!" : "Rejected!",
          `Leave has been marked as ${status}.`,
          "success"
        );
        setLeaveData((prev) =>
          prev.map((item) =>
            item.id === leaveId ? { ...item, status, rejection_reason } : item
          )
        );
      })
      .catch((err) => {
        console.error(`${status} failed:`, err.response?.data || err);
        Swal.fire("Error", "Something went wrong.", "error");
      });
  };

  const filteredData = leaveData.filter(
    (item) => selectedStatus === "" || item.status === selectedStatus
  );

  return (
    <div className="p-3 p-md-4 bg-white rounded shadow-sm min-vh-100 mt-4 mx-2 mx-md-3">
      {/* 🔹 Filters Section */}
      <div className="container-fluid mb-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3 align-items-center justify-content-between">
              {/* 🔹 Left Section: View Mode & Date Controls */}
              <div className="col-12 col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <div>
                    <label className="fw-semibold me-2 text-secondary small">
                      View Mode:
                    </label>
                    <select
                      className="form-select form-select-sm shadow-sm"
                      style={{ minWidth: "120px" }}
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                    >
                      <option value="day">By Date</option>
                      <option value="month">By Month</option>
                    </select>
                  </div>

                  {viewMode === "day" ? (
                    <div className="d-flex align-items-center gap-2">
                      <label className="fw-semibold mt-4 text-secondary small">
                        Date:
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm shadow-sm mt-4"
                        style={{ minWidth: "160px" }}
                        value={`${selectedYear}-${String(
                          selectedMonth
                        ).padStart(2, "0")}-${String(selectedDay).padStart(
                          2,
                          "0"
                        )}`}
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split("-");
                          setSelectedYear(Number(year));
                          setSelectedMonth(Number(month));
                          setSelectedDay(Number(day));
                        }}
                      />
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <label className="fw-semibold me-1 text-secondary small">
                        Month:
                      </label>
                      <select
                        className="form-select form-select-sm shadow-sm"
                        style={{ minWidth: "120px" }}
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                      >
                        {months.map((month, i) => (
                          <option key={i + 1} value={i + 1}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <label className="fw-semibold me-1 text-secondary small">
                        Year:
                      </label>
                      <select
                        className="form-select form-select-sm shadow-sm"
                        style={{ minWidth: "100px" }}
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                      >
                        {[2023, 2024, 2025, 2026].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 🔹 Right Section: Status Filter */}
              <div className="col-12 col-lg-4 text-lg-end">
                <div className="d-flex flex-wrap justify-content-lg-end align-items-center gap-3">
                  <label className="fw-semibold me-1 text-secondary small">
                    Status:
                  </label>
                  <select
                    className="form-select form-select-sm shadow-sm"
                    style={{ minWidth: "130px" }}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Table Section */}
      <h5 className="mb-3 text-center text-md-start">Leave Applications</h5>
      <div
        className="table-responsive"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <Table bordered hover className="align-middle text-center mb-0">
          <thead className="table-light text-nowrap sticky-top">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Start</th>
              <th>End</th>
              <th>Days</th>
              <th>Type</th>
              <th style={{ minWidth: "250px" }}>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No leave applications found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>{item.total_days}</td>
                  <td>{item.leave_type_name}</td>
                  <td style={{ minWidth: "250px", wordBreak: "break-word" }}>
                    {item.reason}
                  </td>
                  <td>
                    <Badge
                      bg={
                        item.status === "approved"
                          ? "success"
                          : item.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                      className="text-capitalize"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleStatusClick(item)}
                    >
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Leavemanagement;
