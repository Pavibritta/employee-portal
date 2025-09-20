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

  // ✅ store full date parts
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch leave data based on selected date
  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);
    axios
      .get(
        `${BASE_URL}/leave-applications/month?month=${selectedMonth}&year=${selectedYear}&day=${selectedDay}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data?.data?.data) {
          setLeaveData(res.data.data.data);
        } else {
          setLeaveData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leave data:", err);
        setLoading(false);
      });
  }, [selectedMonth, selectedYear, selectedDay]);

  // 🔹 Handle status click (no change)
  const handleStatusClick = (item) => {
    Swal.fire({
      title: `${item.first_name} ${item.last_name}'s Leave Details`,
      html: `
        <div class="swal-content">
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

  // 🔹 Update leave status (unchanged)
  const updateLeaveStatus = (leaveId, status, rejection_reason = null) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const approved_by = user?.id || 1;

    const payload = { status, approved_by };
    if (status === "rejected" && rejection_reason) {
      payload.rejection_reason = rejection_reason;
    }

    axios
      .put(`${BASE_URL}/leave/${leaveId}/process`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
    <div className="p-4 bg-white rounded shadow-sm min-vh-100 mx-sm-3 mt-4">
      <div className="d-flex justify-content-between flex-wrap align-items-center mb-4">
        <div className="d-flex gap-5 align-items-center">
          <label className="fw-semibold">Filter by Date:</label>
          <input
            type="date"
            className="form-control"
            value={`${selectedYear}-${String(selectedMonth).padStart(
              2,
              "0"
            )}-${String(selectedDay).padStart(2, "0")}`}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              setSelectedYear(Number(year));
              setSelectedMonth(Number(month));
              setSelectedDay(Number(day));
            }}
          />
        </div>

        <div className="d-flex gap-3 align-items-center">
          <label className="fw-semibold">Filter by Status:</label>
          <select
            className="form-select"
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

      <h5 className="mb-3">Ongoing Leave Applications</h5>
      <div className="table-responsive">
        <Table bordered hover responsive>
          <thead className="table-light text-nowrap">
            <tr>
              <th>Name(s)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Days</th>
              <th>Type</th>
              <th>Reason(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No leave applications found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>{item.total_days}</td>
                  <td>{item.leave_type_name}</td>
                  <td>{item.reason}</td>
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
