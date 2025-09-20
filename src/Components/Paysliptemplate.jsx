// PayslipTemplate.jsx
import React from "react";
import "./Payslip.css";
import kitelogo from "../images/kitelogo.png";

const PayslipTemplate = ({ data }) => {
  if (!data) return null;
  console.log("PayslipTemplate received:", data);

  const user = data?.user || data?.employee || {};
  const period = data?.period || {};
  const attendance = data?.attendance_summary || {};
  const leave = data?.leave_summary || {};
  const payslip = data?.payslip || {}; // 👈 all salary fields come from here

  return (
    <div className="card p-4" id="pdf-content">
      {/* Header */}
      <div className="d-flex justify-content-around align-items-center mb-3">
        <img src={kitelogo} width="100" alt="logo" />
        <h5 className="mb-0">Salary Slip</h5>
        <div style={{ width: 100 }} />
      </div>
      <hr />

      {/* Employee Info */}
      <div className="row mb-2">
        <div className="col-md-6">
          <strong>Name:</strong> {user?.full_name || "N/A"}
        </div>
        <div className="col-md-6">
          <strong>Employee ID:</strong> {user?.employee_id || "N/A"}
        </div>
        <div className="col-md-6">
          <strong>Designation:</strong> {user?.designation || "N/A"}
        </div>
        <div className="col-md-6">
          <strong>Month:</strong> {period?.month_name || "N/A"}{" "}
          {period?.year || ""}
        </div>
      </div>

      <hr />

      {/* Attendance Summary */}
      <div className="row">
        <div className="col-md-3">
          <strong>Total Days in month:</strong>{" "}
          {period?.total_days_in_month || 0}
        </div>
        <div className="col-md-3">
          <strong>Paid Days:</strong> {attendance?.present_days || 0}
        </div>
        <div className="col-md-3">
          <strong>LOP Days:</strong> {leave?.total_leave_lop_days || 0}
        </div>
        <div className="col-md-3">
          <strong>Paid Leave Days:</strong>{" "}
          {(attendance?.paid_casual_leave_days || 0) +
            (attendance?.paid_sick_leave_days || 0)}
        </div>
      </div>

      <hr />

      {/* Salary Table */}
      <div className="row mb-3">
        <div className="col-md-12 mx-auto">
          <table className="table table-bordered text-center">
            <thead className="table-light">
              <tr>
                <th>Earnings</th>
                <th>Deductions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Basic Salary: ₹{Math.round(payslip?.basic_salary || 0 || 0)}
                </td>
                <td>
                  Professional Tax: ₹
                  {Math.round(payslip?.professional_tax || 0)}
                </td>
              </tr>
              <tr>
                <td>HRA: ₹{Math.round(payslip?.hra || 0)}</td>
                <td>TDS: ₹{Math.round(payslip?.tds || 0)}</td>
              </tr>
              <tr>
                <td>Bonus: ₹{Math.round(payslip?.bonus || 0)}</td>
                <td>
                  Loan Repayment: ₹{Math.round(payslip?.loan_repayment || 0)}
                </td>
              </tr>
              <tr>
                <td>
                  Special Allowance: ₹
                  {Math.round(payslip?.special_allowance || 0)}
                </td>
                <td>
                  Other Deductions: ₹
                  {Math.round(payslip?.other_deductions || 0)}
                </td>
              </tr>
              <tr>
                <td>
                  Other Allowances: ₹{Math.round(payslip?.other_allowance || 0)}
                </td>
                <td>PF (Employee): ₹{Math.round(payslip?.pf_employee || 0)}</td>
              </tr>
              <tr>
                <td>
                  Medical Allowance: ₹
                  {Math.round(payslip?.medical_allowance || 0)}
                </td>
                <td>
                  ESI (Employee): ₹{Math.round(payslip?.esi_employee || 0)}
                </td>
              </tr>
              <tr>
                <td>
                  Conveyance Allowance: ₹
                  {Math.round(payslip?.conveyance_allowance || 0)}
                </td>
                <td></td>
              </tr>
              <tr className="table-info fw-bold">
                <td>
                  Gross Earnings: ₹{Math.round(payslip?.gross_salary || 0)}
                </td>
                <td>
                  Total Deductions: ₹
                  {Math.round(payslip?.total_deductions || 0)}
                </td>
              </tr>
              <tr className="table-secondary fw-bold">
                <td colSpan="2">
                  Net Salary: ₹{Math.round(payslip?.net_salary || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;
