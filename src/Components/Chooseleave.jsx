import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./ApplyLeave.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "./Chooseleave.css";
import axios from "axios";
import { BASE_URL } from "./Api";

const Applyleave = () => {
  const [leaveType, setLeaveType] = useState("Full Day");
  const [category, setCategory] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [totalDays, setTotalDays] = useState(0);

  const navigate = useNavigate();

  // Map category to leave_type_id
  const getLeaveTypeId = (category) => {
    const map = {
      "Casual Leave": 1,
      "Sick Leave": 2,
      "Optional Leaves": 3,
    };
    return map[category] || null;
  };

  // Map leaveType to code
  const getLeaveDurationCode = (type) => {
    const map = {
      "Full Day": 1,
      "Half Day": 2,
    };
    return map[type] || 1;
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
      setTotalDays(diff > 0 ? diff : 0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;

      if (leaveType === "Half Day") {
        setTotalDays(0.5);
      } else {
        setTotalDays(diff > 0 ? diff : 0);
      }
    }
  }, [startDate, endDate, leaveType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    if (!token || !userEmail || !userId) {
      Swal.fire(
        "Missing Info",
        "Authentication or user info missing!",
        "error"
      );
      return;
    }

    const leaveTypeId = getLeaveTypeId(category);
    const leaveDurationCode = getLeaveDurationCode(leaveType);

    if (!leaveTypeId) {
      Swal.fire("Error", "Invalid leave category selected", "error");
      return;
    }

    if (!startDate || !endDate) {
      Swal.fire(
        "Invalid Dates",
        "Start and End dates are required!",
        "warning"
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ✅ Check if selected dates are in the current month
    const today = new Date();
    // Reset time for accurate comparison (00:00:00)
    today.setHours(0, 0, 0, 0);

    // if (start < today) {
    //   Swal.fire(
    //     "Invalid Start Date",
    //     "You cannot apply for leave in the past.",
    //     "error"
    //   );
    //   return;
    // }
    if (end < start) {
      Swal.fire(
        "Invalid Date",
        "End date cannot be earlier than start date.",
        "error"
      );
      return;
    }

    if (totalDays <= 0) {
      Swal.fire(
        "Invalid Duration",
        "Total leave days must be greater than 0.",
        "warning"
      );
      return;
    }

    if (!reason.trim()) {
      Swal.fire(
        "Reason Required",
        "Please enter a reason for your leave.",
        "warning"
      );
      return;
    }

    const payload = {
      employee_id: userId,
      email: userEmail,
      leave_type_id: leaveTypeId,
      leave_duration: leaveDurationCode,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason: reason,
    };

    try {
      const response = await axios.post(`${BASE_URL}/leave/apply`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Leave Applied Successfully!",
        text: `Your ${category} (${leaveType}) from ${startDate} to ${endDate} (${totalDays} day(s)) has been submitted.`,
      }).then(() => {
        navigate("/Applyleave");
        window.location.reload();
      });

      // Reset form
      setLeaveType("Full Day");
      setCategory("Casual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");
      setTotalDays(0);
    } catch (error) {
      console.error("Leave Apply Error:", error.response?.data || error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Leave submission failed",
        "error"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid apply-leave-container py-4 position-relative">
        <div className="container bg-white rounded shadow p-4 position-relative">
          <div className="close-icon" onClick={() => navigate("/Applyleave")}>
            <FaTimes />
          </div>

          <h5 className="mb-4 fw-bold">Choose Leave Type</h5>

          <div className="d-flex gap-4 mb-4">
            {["Casual Leave", "Sick Leave", "Optional Leaves"].map(
              (cat, index) => (
                <div className="form-check" key={index}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="leaveCategory"
                    id={cat}
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={cat}>
                    {cat}
                  </label>
                </div>
              )
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Leave Type</label>
              <select
                className="form-select w-100"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control w-100"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control w-100"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Total Days</label>
              <input
                type="number"
                className="form-control w-100"
                value={totalDays}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control w-100"
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill"
            >
              Apply Leave
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Applyleave;
