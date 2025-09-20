import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "../Contexts/UserContext";
import { BASE_URL } from "../Api";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";
import axios from "axios";
import Swal from "sweetalert2";
const Salary = () => {
  const [salary, setSalary] = useState({
    id: "",
    employee_id: "",
    salary_structure_name: "",
    effective_date: "",
    end_date: "",
    effective_from: "",
    effective_to: "",
    basic_salary: "",
    hra: "",
    conveyance_allowance: "",
    medical_allowance: "",
    special_allowance: "",
    bonus: "",
    other_allowances: "",
    pf_employee: "",
    pf_employer: "",
    esi_employee: "",
    esi_employer: "",
    professional_tax: "",
    tds: "",
    loan_repayment: "",
    other_deductions: "",
    gross_salary: "",
    total_deductions: "",
    net_salary: "",
    ctc: "",
    created_at: "",
    updated_at: "",
  });

  const { role } = useUser();
  const { mode, selectedEmployeeId, employeeData } = useEmployeeData();
  const token = localStorage.getItem("authToken");
  const admintoken = localStorage.getItem("token");

  console.log(employeeData.id);

  const handleChange = (e) => {
    setSalary({ ...salary, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      employee_id: employeeData?.id || salary.employee_id,
      salary_structure_name: salary.salary_structure_name,
      effective_from: salary.effective_from,
      effective_to: salary.effective_to || null,
      basic_salary: parseFloat(salary.basic_salary) || 0,
      hra: parseFloat(salary.hra) || 0,
      conveyance_allowance: parseFloat(salary.conveyance_allowance) || 0,
      medical_allowance: parseFloat(salary.medical_allowance) || 0,
      special_allowance: parseFloat(salary.special_allowance) || 0,
      bonus: parseFloat(salary.bonus) || 0,
      other_allowances: parseFloat(salary.other_allowances) || 0,
      pf_employee: parseFloat(salary.pf_employee) || 0,
      pf_employer: parseFloat(salary.pf_employer) || 0,
      esi_employee: parseFloat(salary.esi_employee) || 0,
      esi_employer: parseFloat(salary.esi_employer) || 0,
      professional_tax: parseFloat(salary.professional_tax) || 0,
      tds: parseFloat(salary.tds) || 0,
      loan_repayment: parseFloat(salary.loan_repayment) || 0,
      other_deductions: parseFloat(salary.other_deductions) || 0,
    };

    try {
      let response;

      if (salary.id) {
        // ✅ Update (PUT) → don't reset form
        const { employee_id, ...updatePayload } = payload;

        response = await axios.put(
          `${BASE_URL}/salary-structures/${salary.id}`,
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${admintoken}`,
              "Content-Type": "application/json",
            },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Salary structure updated successfully!",
          confirmButtonColor: "#198754",
        });
      } else {
        // ✅ Create (POST) → reset form
        response = await axios.post(`${BASE_URL}/salary-structures`, payload, {
          headers: {
            Authorization: `Bearer ${admintoken}`,
            "Content-Type": "application/json",
          },
        });

        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Salary structure created successfully!",
          confirmButtonColor: "#198754",
        });

        // Reset form only after POST
        setSalary({
          id: "",
          employee_id: "",
          salary_structure_name: "",
          effective_date: "",
          end_date: "",
          effective_from: "",
          effective_to: "",
          basic_salary: "",
          hra: "",
          conveyance_allowance: "",
          medical_allowance: "",
          special_allowance: "",
          bonus: "",
          other_allowances: "",
          pf_employee: "",
          pf_employer: "",
          esi_employee: "",
          esi_employer: "",
          professional_tax: "",
          tds: "",
          loan_repayment: "",
          other_deductions: "",
          gross_salary: "",
          total_deductions: "",
          net_salary: "",
          ctc: "",
          created_at: "",
          updated_at: "",
        });
      }
    } catch (error) {
      console.error("❌ Error saving salary:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Failed to save salary structure.",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        let targetId = null;
        let tokenToUse = null;

        if (role === "admin") {
          // ✅ Admin mode
          targetId = employeeData?.id;
          tokenToUse = localStorage.getItem("token"); // admin token
        } else {
          // ✅ Employee mode
          targetId = localStorage.getItem("Id"); // employee’s own id
          tokenToUse = localStorage.getItem("authToken"); // employee token
        }

        if (!targetId || !tokenToUse) {
          console.warn("⚠️ Missing ID or Token, cannot fetch salary.");
          return;
        }

        const res = await axios.get(
          `${BASE_URL}/salary-structures/employee/${targetId}`,
          {
            headers: { Authorization: `Bearer ${tokenToUse}` },
          }
        );

        console.log("🔎 Full API response:", res.data);

        let apiData = res.data?.data || [];

        if (Array.isArray(apiData) && apiData.length > 0) {
          apiData = apiData[0]; // take first salary structure
        }

        if (apiData) {
          const formattedData = Object.keys(salary).reduce((acc, key) => {
            acc[key] =
              apiData[key] !== null && apiData[key] !== undefined
                ? String(apiData[key])
                : "";
            return acc;
          }, {});
          setSalary(formattedData);
          console.log("🎯 Loaded salary data:", formattedData);
        }
      } catch (err) {
        console.error("❌ Error fetching salary details:", err);
      }
    };

    fetchSalary();
  }, [employeeData?.id, role]);

  useEffect(() => {
    const earningsFields = [
      "basic_salary",
      "hra",
      "conveyance_allowance",
      "medical_allowance",
      "special_allowance",
      "bonus",
      "other_allowances",
    ];

    const deductionFields = [
      "pf_employee",
      "pf_employer",
      "esi_employee",
      "esi_employer",
      "professional_tax",
      "tds",
      "loan_repayment",
      "other_deductions",
    ];

    const gross = earningsFields.reduce(
      (sum, field) => sum + (parseFloat(salary[field]) || 0),
      0
    );

    const totalDeduction = deductionFields.reduce(
      (sum, field) => sum + (parseFloat(salary[field]) || 0),
      0
    );

    const net = gross - totalDeduction;

    const ctc =
      (gross +
        (parseFloat(salary.pf_employer) || 0) +
        (parseFloat(salary.esi_employer) || 0)) *
      12;

    setSalary((prev) => ({
      ...prev,
      gross_salary: gross.toFixed(2),
      total_deductions: totalDeduction.toFixed(2),
      net_salary: net.toFixed(2),
      ctc: ctc.toFixed(2), // now annual CTC
    }));
  }, [
    salary.basic_salary,
    salary.hra,
    salary.conveyance_allowance,
    salary.medical_allowance,
    salary.special_allowance,
    salary.bonus,
    salary.other_allowances,
    salary.pf_employee,
    salary.pf_employer,
    salary.esi_employee,
    salary.esi_employer,
    salary.professional_tax,
    salary.tds,
    salary.loan_repayment,
    salary.other_deductions,
  ]);

  const isEmployee = role === "employee";
  return (
    <div className="container mt-1 mb-5">
      {isEmployee ? (
        // ================================
        // 👤 Employee View (Read-Only Table)
        // ================================
        <div className="p-4 border rounded shadow-sm bg-white">
          <h5 className="mb-3">Salary Details</h5>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Salary Structure</th>
                <td>{salary.salary_structure_name}</td>
              </tr>
              <tr>
                <th>Effective From</th>
                <td>{salary.effective_from}</td>
              </tr>
              <tr>
                <th>Effective To</th>
                <td>{salary.effective_to}</td>
              </tr>

              {/* Earnings */}
              <tr className="table-secondary">
                <th colSpan="2">Earnings</th>
              </tr>
              <tr>
                <th>Basic Salary</th>
                <td>{salary.basic_salary}</td>
              </tr>
              <tr>
                <th>HRA</th>
                <td>{salary.hra}</td>
              </tr>
              <tr>
                <th>Conveyance Allowance</th>
                <td>{salary.conveyance_allowance}</td>
              </tr>
              <tr>
                <th>Medical Allowance</th>
                <td>{salary.medical_allowance}</td>
              </tr>
              <tr>
                <th>Special Allowance</th>
                <td>{salary.special_allowance}</td>
              </tr>
              <tr>
                <th>Bonus</th>
                <td>{salary.bonus}</td>
              </tr>
              <tr>
                <th>Other Allowances</th>
                <td>{salary.other_allowances}</td>
              </tr>

              {/* Deductions */}
              <tr className="table-secondary">
                <th colSpan="2">Deductions</th>
              </tr>
              <tr>
                <th>PF Employee</th>
                <td>{salary.pf_employee}</td>
              </tr>
              <tr>
                <th>ESI Employee</th>
                <td>{salary.esi_employee}</td>
              </tr>
              <tr>
                <th>Professional Tax</th>
                <td>{salary.professional_tax}</td>
              </tr>
              <tr>
                <th>TDS</th>
                <td>{salary.tds}</td>
              </tr>
              <tr>
                <th>Loan Repayment</th>
                <td>{salary.loan_repayment}</td>
              </tr>
              <tr>
                <th>Other Deductions</th>
                <td>{salary.other_deductions}</td>
              </tr>

              {/* Summary */}
              <tr className="table-secondary">
                <th colSpan="2">Summary</th>
              </tr>
              <tr>
                <th>Gross Salary</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={salary.gross_salary}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>Total Deductions</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={salary.total_deductions}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>Net Salary</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={salary.net_salary}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>CTC (Annual)</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={salary.ctc}
                    readOnly
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <form
          className="p-4 border rounded shadow-sm bg-white"
          onSubmit={handleSubmit}
        >
          <div className="row">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                {/* Employee Id {employeeData.employee_id} */}
              </label>
              <input
                type="hidden"
                className="form-control"
                name="employee_id"
                value={salary.employee_id || ""}
                onChange={handleChange}
                placeholder={employeeData.id}
                readOnly

                // optional, if you don’t want manual editing
              />
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">Salary Structure Name</label>
              <input
                type="text"
                className="form-control"
                name="salary_structure_name"
                value="Standard Pay"
                readOnly
              />
            </div>
          </div>

          {/* Dates */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Effective From</label>
              <input
                type="date"
                className="form-control"
                name="effective_from"
                value={
                  salary.effective_from ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Effective To</label>
              <input
                type="date"
                className="form-control"
                name="effective_to"
                value={salary.effective_to}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Earnings Section */}
          <h5 className="mt-4">Earnings</h5>
          <div className="row">
            {[
              "basic_salary",
              "hra",
              "conveyance_allowance",
              "medical_allowance",
              "special_allowance",
              "bonus",
              "other_allowances",
            ].map((field, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label className="form-label">
                  {field.replace(/_/g, " ").toUpperCase()}
                </label>
                <input
                  type="number"
                  className="form-control"
                  name={field}
                  value={salary[field]}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Deductions Section */}
          <h5 className="mt-4">Deductions</h5>
          <div className="row">
            {[
              "pf_employee",
              "pf_employer",
              "esi_employee",
              "esi_employer",
              "professional_tax",
              "tds",
              "loan_repayment",
              "other_deductions",
            ].map((field, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label className="form-label">
                  {field.replace(/_/g, " ").toUpperCase()}
                </label>
                <input
                  type="number"
                  className="form-control"
                  name={field}
                  value={salary[field]}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Salary Summary */}
          <h5 className="mt-4">Salary Summary</h5>
          <div className="row">
            {["gross_salary", "total_deductions", "net_salary", "ctc"].map(
              (field, index) => (
                <div className="col-md-4 mb-3" key={index}>
                  <label className="form-label">
                    {field.replace(/_/g, " ").toUpperCase()}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name={field}
                    value={salary[field]}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              )
            )}
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-4">
              Save Salary Details
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Salary;
