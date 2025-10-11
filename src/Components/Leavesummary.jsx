import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./Api";
import { useEmployeeData } from "./Contexts/EmployeeDataContext";

const Leavesummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { employeeData } = useEmployeeData();
  const authToken = localStorage.getItem("token");

  // Default to **last month**
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth()); // last month
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    if (!employeeData?.id) return;

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // ✅ Only allow past months
    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
      setSummary(null);
      setError("No data available for this month.");
      return;
    }

    const fetchLeaveSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BASE_URL}/salary/payslip/generate/${
            employeeData.id
          }/${year}/${String(month).padStart(2, "0")}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        console.log("Leave Summary:", res.data);
        setSummary(res.data);
      } catch (err) {
        console.error("❌ Error fetching leave summary:", err);
        setSummary(null);
        setError("No data available for this month.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveSummary();
  }, [year, month, employeeData, authToken]);

  // 🟢 UI States
  if (loading) return <p>Loading leave summary...</p>;
  if (error) return <p>{error}</p>;
  if (!summary) return <p>No data available for this month.</p>;

  const { attendance_summary, days_summary, period } = summary;

  return (
    <div className="container mt-3">
      <h3>Monthly Attendance and leave summary</h3>

      {/* 🔽 Month/Year Filter */}
      <div className="d-flex gap-2 mb-3">
        {/* Month Dropdown */}
        <select
          className="form-select w-auto"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1)
            .filter((m) => {
              const currentMonth = today.getMonth() + 1;
              const currentYear = today.getFullYear();
              if (year === currentYear) {
                return m < currentMonth; // ✅ only past months
              }
              return true;
            })
            .map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
        </select>

        {/* Year Dropdown */}
        <select
          className="form-select w-auto"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
      </div>

      {/* Attendance Summary */}
      <div className="card p-3 mb-3">
        <h5>
          Attendance Summary for {period.month_name} {period.year}
        </h5>
        <ul>
          <li>Present Days: {attendance_summary.present_days}</li>
          <li>Absent Days: {attendance_summary.absent_days}</li>
          <li>Half Days: {attendance_summary.half_days}</li>
          <li>Leave Days: {attendance_summary.leave_days}</li>
          <li>LOP Days: {attendance_summary.lop_days}</li>
          <li>
            Paid Casual Leave: {attendance_summary.paid_casual_leave_days}
          </li>
          <li>Paid Sick Leave: {attendance_summary.paid_sick_leave_days}</li>
          <li>Total Present Days: {attendance_summary.total_present_days}</li>
        </ul>
      </div>

      {/* Days Summary */}
      <div className="card p-3">
        <h5>Days Summary</h5>
        <ul>
          <li>Total Working Days: {days_summary.total_working_days}</li>
          <li>Holidays: {days_summary.holidays}</li>
          <li>Sundays: {days_summary.breakdown.sundays}</li>
          <li>Paid Sundays: {days_summary.breakdown.paid_sundays}</li>
          <li>First Saturday: {days_summary.breakdown.first_saturday}</li>
          <li>Working Saturdays: {days_summary.breakdown.working_saturdays}</li>
        </ul>
      </div>
    </div>
  );
};

export default Leavesummary;
