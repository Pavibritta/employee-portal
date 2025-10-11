import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Tab,
  Dropdown,
  Table,
  Badge,
  Form,
  Card,
  ListGroup,
  Button,
  Spinner,
  Alert,
  Modal,
  Image,
} from "react-bootstrap";
import { FaEdit, FaRegFileAlt } from "react-icons/fa";
import dpimg from "../images/dpimg.jpg";
import axios from "axios";
import Swal from "sweetalert2";
import "./Salarymanagement.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import kitelogo from ".././images/kitelogo.png";
import { FaRegFilePdf } from "react-icons/fa";
import { BASE_URL } from "./Api";

// API base URL configuration

const Salarymanagement = () => {
  const [activeTab, setActiveTab] = useState("payroll");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  console.log(searchTerm);
  const [formData, setFormData] = useState({
    employee_id: "",
    basic_salary: "",
    hra: "",
    medical_allowance: "",
    transport_allowance: "",
    pf: "",
    esi: "",
    net_salary: "",
    status: "Unpaid",
  });

  const monthNames = [
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

  // 🗓️ Automatically set to last month
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1); // Go to previous month
  const defaultMonth = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

        // ✅ Handle both "August 2025", "August", or "08"
        const currentYear = new Date().getFullYear();
        let year = currentYear;
        let month;

        if (selectedMonth.includes(" ")) {
          const [monthName, yearStr] = selectedMonth.split(" ");
          year = parseInt(yearStr || currentYear, 10);
          const monthIndex = monthNames.findIndex((m) => m === monthName) + 1;
          month = monthIndex.toString().padStart(2, "0");
        } else if (isNaN(selectedMonth)) {
          // case: "August"
          const monthIndex =
            monthNames.findIndex((m) => m === selectedMonth) + 1;
          month = monthIndex.toString().padStart(2, "0");
        } else {
          // case: "08"
          month = selectedMonth.toString().padStart(2, "0");
        }

        console.log(
          "Fetching payroll:",
          `${BASE_URL}/salary-payslips?year=${year}&month=${month}`
        );

        const res = await axios.get(
          `${BASE_URL}/salary-payslips?year=${year}&month=${month}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API response:", res.data);

        const rawData = res.data.data || [];
        const mappedData = rawData.map((item) => ({
          id: item.employee_pk_id,
          name: item.employee_name,
          salary: item.basic_salary,
          net_salary: item.net_salary,
          status: "Unpaid",
          department: item.department,
          ...item,
        }));

        setSalaryData(mappedData);
        if (mappedData.length === 0) setSelectedEmployee(null);

        console.log("mappedData", mappedData);
      } catch (err) {
        console.error("Error fetching payroll:", err);
        setError("Failed to load payroll data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedMonth) {
      fetchPayroll();
    }
  }, [selectedMonth]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };
  console.log(selectedEmployee);
  const filteredEmployees = salaryData.filter((emp) => {
    const fullName = `${emp.employee?.first_name || ""} ${
      emp.employee?.last_name || ""
    }`;
    const empId = emp.employee?.employee_id || "";
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleShow = (employee = null) => {
    if (employee) {
      setFormData({
        employee_id: employee.id,
        basic_salary: employee.salary_structure.basic_salary || "",
        hra: employee.hra || "",
        medical_allowance: employee.medical_allowance || "",
        transport_allowance: employee.transport_allowance || "",
        pf: employee.pf || "",
        esi: employee.esi || "",
        net_salary: employee.net_salary || "",
        status: employee.status || "Unpaid", // ✅ set current status
      });
    } else {
      setFormData({
        employee_id: "",
        basic_salary: "",
        hra: "",
        medical_allowance: "",
        transport_allowance: "",
        pf: "",
        esi: "",
        net_salary: "",
        status: "Unpaid",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate net salary when relevant fields change
    if (
      name !== "net_salary" &&
      (name === "basic_salary" ||
        name === "hra" ||
        name === "medical_allowance" ||
        name === "transport_allowance" ||
        name === "pf" ||
        name === "esi")
    ) {
      calculateNetSalary();
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const medical = parseFloat(formData.medical_allowance) || 0;
    const transport = parseFloat(formData.transport_allowance) || 0;
    const pf = parseFloat(formData.pf) || 0;
    const esi = parseFloat(formData.esi) || 0;

    const netSalary = basic + hra + medical + transport - pf - esi;
    setFormData((prev) => ({
      ...prev,
      net_salary: netSalary.toFixed(2),
    }));
  };

  const SalaryTable = ({ data, onSelect, selectedEmployee }) => {
    console.log("data", data);
    const handleSave = () => {
      // Save to state
      setSalaryData((prevData) =>
        prevData.map((emp) =>
          emp.id === formData.employee_id
            ? { ...emp, status: formData.status }
            : emp
        )
      );

      // Save each employee's status in localStorage
      const storedStatuses = JSON.parse(localStorage.getItem("statuses")) || {};
      storedStatuses[formData.employee_id] = formData.status;
      localStorage.setItem("statuses", JSON.stringify(storedStatuses));

      setShowModal(false);
    };

    const status = localStorage.getItem("status");
    if (data.length === 0) {
      return (
        <div className="text-center py-5">
          <p>No payroll data available</p>
        </div>
      );
    }

    return (
      <div className="table-responsive mb-5">
        <Table hover className="salary-table">
          <thead className="table-light">
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Salary</th>
              <th>Payslip Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onSelect(emp)}
                className={`${
                  selectedEmployee?.id === emp.id ? "table-active" : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                <td>{emp.employee.employee_id}</td>
                <td>
                  {emp.employee.first_name} {emp.employee.last_name}
                </td>
                <td>₹{emp.net_salary.toLocaleString() || "N/A"}</td>
                <td>
                  <Badge
                    bg={
                      JSON.parse(localStorage.getItem("statuses") || "{}")[
                        emp.id
                      ] === "Paid"
                        ? "success"
                        : "warning"
                    }
                  >
                    {JSON.parse(localStorage.getItem("statuses") || "{}")[
                      emp.id
                    ] === "Paid"
                      ? "Paid"
                      : "Unpaid"}
                  </Badge>
                </td>

                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShow(emp);
                    }}
                  >
                    <FaEdit />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Employee Salary</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* other fields if you want to keep them */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  const SalarySlipCard = ({ employee, selectedMonth }) => {
    console.log("employee", employee);
    if (!employee) {
      return (
        <div className="col-md-4">
          {loading ? (
            <Card className="text-center p-4">
              <Card.Body>
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading employee details...</p>
              </Card.Body>
            </Card>
          ) : salaryData.length === 0 ? (
            <Card className="text-center p-4">
              <Card.Body>
                <h6>No Payroll Data</h6>
                <p className="text-muted small">
                  Salary slips will appear here once payroll data is available.
                </p>
              </Card.Body>
            </Card>
          ) : selectedEmployee ? (
            <SalarySlipCard
              employee={selectedEmployee}
              selectedMonth={selectedMonth}
            />
          ) : (
            <Card className="text-center p-4">
              <Card.Body>
                <h6>No Employee Selected</h6>
                <p className="text-muted small">
                  Click on an employee from the list to view their salary
                  details
                </p>
              </Card.Body>
            </Card>
          )}
        </div>
      );
    }

    console.log("employee data:", employee);

    const profileImage = employee.employee?.profile_image || dpimg; // nested employee object

    return (
      <Card className="card-style text-white rounded-4 salary-slip-card p-3">
        <div className="d-flex align-items-center mb-3">
          <Image
            src={`${BASE_URL}/employees/${employee.employee.id}/profile-image`}
            roundedCircle
            width={60}
            height={60}
            className="me-3 border"
            alt="Employee"
            onError={(e) => (e.target.src = dpimg)} // fallback
          />
          <div>
            <h6 className="mb-0">
              {employee.employee?.first_name} {employee.employee?.last_name}
            </h6>
            <small>Employee ID: {employee.employee.employee_id}</small>
          </div>
        </div>

        <p>
          <strong> Salary:</strong> ₹{employee.net_salary || "0.00"}
        </p>
        <p>
          <strong>HRA:</strong> ₹{employee.hra || "0.00"}
        </p>
        <p>
          <strong>Medical Allowance:</strong> ₹
          {employee.medical_allowance || "0.00"}
        </p>
        <p>
          <strong>Transport Allowance:</strong> ₹
          {employee.transport_allowance || "0.00"}
        </p>
        <p>
          <strong>PF:</strong> ₹{employee.pf || "0.00"}
        </p>
        <p>
          <strong>ESI:</strong> ₹{employee.esi || "0.00"}
        </p>
        <p>
          <strong>Other Deduction:</strong> ₹{employee.esi || "0.00"}
        </p>
        <hr />
        <h6>
          <strong>Net Salary:</strong> ₹{employee.net_salary || "0.00"}
        </h6>
      </Card>
    );
  };

  const EmployeeSlipGrid = () => {
    const [selectAll, setSelectAll] = useState(false);
    const [selected, setSelected] = useState({});
    const [employees, setEmployees] = useState([]);
    const [gridLoading, setGridLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("January");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const today = new Date();
    const defaultMonthYear = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    const [selectedMonthYear, setSelectedMonthYear] =
      useState(defaultMonthYear);
    const [year, month] = selectedMonthYear.split("-");
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

    useEffect(() => {
      const fetchEmployees = async () => {
        setGridLoading(true);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${BASE_URL}/user-employee-details`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const employeesData = res.data.data.map((emp) => ({
            id: emp.employee_pk_id, // 🔹 use employee_pk_id as selection key
            user_id: emp.user_id,
            employee_pk_id: emp.employee_pk_id,
            employee_code: emp.employee_id, // e.g. KC-2025-0003
            name: emp.full_name,
            role: emp.designation || "Unknown",
            image: emp.profile_image || dpimg,
          }));

          setEmployees(employeesData);
        } catch (error) {
          console.error("Error fetching employees:", error);
          Swal.fire("Error", "Failed to fetch employee data", "error");
        } finally {
          setGridLoading(false);
        }
      };

      fetchEmployees();
    }, []);

    const toggleSelectAll = () => {
      const newState = {};
      employees.forEach((emp) => {
        newState[emp.id] = !selectAll; // emp.id === employee_pk_id
      });
      setSelectAll(!selectAll);
      setSelected(newState);
    };

    const toggleIndividual = (id) => {
      setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleGenerateAndSend = async () => {
      const selectedIds = Object.keys(selected).filter((id) => selected[id]);
      console.log(selectedIds);
      if (selectedIds.length === 0) return;

      setGridLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [year, month] = selectedMonthYear.split("-");
        const payload = {
          employee_ids: selectedIds.map((id) => parseInt(id, 10)),
          year: parseInt(year, 10),
          month: parseInt(month, 10), // <-- use numeric month directly from input
          payment_date: new Date().toISOString().split("T")[0],
          payment_mode: "Bank Transfer",
          transaction_ref: `TRX${Date.now()}`,
        };

        // 🔹 Send to backend (POST)
        const res = await axios.post(
          `${BASE_URL}/salary/payslip/generate-multiple`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Bulk API response:", res.data);
        Swal.fire(
          "Success",
          "Salary slips generated & sent successfully!",
          "success"
        );
      } catch (error) {
        console.error("Error generating slips:", error);
        if (error.response?.data) {
          const { message, results } = error.response.data;

          if (results?.failed?.length) {
            const firstFail = results.failed[0];
            Swal.fire(
              "Payslip Generation Failed",
              `${message}. Employee ID: ${firstFail.employee_id}. Reason: ${firstFail.error}`,
              "error"
            );
          } else {
            Swal.fire("Error", message || "Unknown server error", "error");
          }
        } else {
          Swal.fire("Error", "Network or unexpected error", "error");
        }
      } finally {
        setGridLoading(false);
      }
    };

    const handlePreviewIndividualSlip = async (empId) => {
      setGridLoading(true);
      try {
        const token = localStorage.getItem("token");
        const monthIndex = months.indexOf(selectedMonth) + 1;

        // ✅ empId is now employee_pk_id
        const res = await axios.get(
          `${BASE_URL}/salary/payslip/generate/${empId}/${year}/${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pdf = new jsPDF("p", "pt", "a4");
        const emp = employees.find((e) => e.id === empId);
        const slip = res.data;
        console.log("slip", res.data);
        const tempDiv = document.createElement("div");
        tempDiv.style.width = "595px";
        tempDiv.style.padding = "20px";
        tempDiv.style.backgroundColor = "#ffffff";
        tempDiv.style.fontFamily = "Arial, sans-serif";

        tempDiv.innerHTML = `
      <div class="card p-4" id="pdf-content">
        <div class="d-flex justify-content-around align-items-center mb-3">
          <img src="${kitelogo}" width="100" alt="logo" />
          <h5 class="mb-0">Salary Slip</h5>
          <div style="width: 100px;"></div>
        </div>
        <hr />
        <div class="row mb-2">
          <div class="col-md-6"><strong>Name:</strong> ${
            slip.employee.full_name || "-"
          }</div>
          <div class="col-md-6"><strong>Employee ID:</strong> ${
            slip.employee.employee_id || "-"
          }</div>
          <div class="col-md-6"><strong>Designation:</strong> ${
            slip?.employee.designation || "-"
          }</div>
          <div class="col-md-6"><strong>Gross Salary:</strong> ${
            slip?.salary_structure.basic_salary || "-"
          }</div>
          <div class="col-md-6"><strong>Month:</strong> ${month} ${year}</div>
        </div>
        <hr />
        <div class="row">
          <div class="col-md-6"><strong>Total Days in month:</strong> ${
            slip?.period?.total_days_in_month || 31
          }</div>
          <div class="col-md-6"><strong>Paid Days:</strong> ${
            slip?.attendance_summary?.total_present_days || 0
          }</div>
          </div>
          <div class="row">
          <div class="col-md-6"><strong>LOP Days:</strong> ${
            slip?.attendance_summary?.absent_days || 0
          }</div>
          <div class="col-md-6"><strong>Paid leave Days:</strong> ${
            slip?.attendance_summary?.paid_casual_leave_days ||
            0 + slip?.attendance_summary?.paid_sick_leave_days ||
            0
          }</div>
        </div>
        <hr/>
        <div class="row mb-3">
  <div class="col-md-12 mx-auto">
    <table class="table table-bordered text-center">
      <thead class="table-light">
        <tr><th>Earnings</th><th>Deductions</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary: ₹${Math.round(slip?.payslip.basic_salary || 0)}</td>
          <td>Professional Tax: ₹${Math.round(
            slip?.payslip?.professional_tax || 0
          )}</td>
        </tr>
        <tr>
          <td>HRA: ₹${Math.round(slip?.payslip?.hra || 0)}</td>
          <td>TDS: ₹${Math.round(slip?.payslip?.tds || 0)}</td>
        </tr>
        <tr>
          <td>Bonus: ₹${Math.round(slip?.payslip?.bonus || 0)}</td>
          <td>Loan Repayment: ₹${Math.round(
            slip?.payslip?.loan_repayment || 0
          )}</td>
        </tr>
        <tr>
          <td>Special Allowance: ₹${Math.round(
            slip?.payslip?.special_allowance || 0
          )}</td>
          <td>Other Deductions: ₹${Math.round(
            slip?.payslip?.other_deductions || 0
          )}</td>
        </tr>
        <tr>
          <td>Other Allowances: ₹${Math.round(
            slip?.payslip?.other_allowance || 0
          )}</td>
          <td>PF (Employee): ₹${Math.round(
            slip?.payslip?.pf_employee || 0
          )}</td>
        </tr>
        <tr>
          <td>Medical Allowance: ₹${Math.round(
            slip?.payslip?.medical_allowance || 0
          )}</td>
          <td>ESI (Employee): ₹${Math.round(
            slip?.payslip?.esi_employee || 0
          )}</td>
        </tr>
        <tr>
          <td>Conveyance Allowance: ₹${Math.round(
            slip?.payslip?.conveyance_allowance || 0
          )}</td>
          <td></td>
        </tr>
        <tr class="table-info fw-bold">
          <td>Gross Earnings: ₹${Math.round(
            slip?.payslip?.gross_salary || 0
          )}</td>
          <td>Total Deductions: ₹${Math.round(
            slip?.payslip?.total_deductions || 0
          )}</td>
        </tr>
        <tr class="table-secondary fw-bold">
          <td colspan="2">Net Salary: ₹${Math.round(
            slip?.payslip?.net_salary || 0
          )}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


      </div>
    `;

        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(pdfUrl);
        setShowPdfPreview(true);
      } catch (error) {
        console.error("Error fetching individual slip:", error);
        Swal.fire("Error", "Failed to fetch salary slip", "error");
      } finally {
        setGridLoading(false);
      }
    };

    const handleClosePreview = () => {
      setShowPdfPreview(false);
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
    };
    const todayDate = new Date();
    // 👇 set max to *last month*, so current & future months are disabled
    const maxSelectableMonth = new Date(
      today.getFullYear(),
      todayDate.getMonth() - 1
    );
    const maxMonthYear = `${maxSelectableMonth.getFullYear()}-${String(
      maxSelectableMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    return (
      <div className="p-3 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold">Employee Salary Slip</h5>
          <div className="d-flex align-items-center gap-3">
            <label className="fw-semibold mb-0">Filter by Month:</label>
            <input
              type="month"
              className="form-control form-control-sm"
              style={{ maxWidth: "150px" }}
              value={selectedMonthYear}
              max={maxMonthYear} // 👈 disables current & future months
              onChange={(e) => {
                const picked = e.target.value; // e.g., "2025-08"
                if (picked <= maxMonthYear) {
                  // extra safety
                  setSelectedMonthYear(picked);
                } else {
                  Swal.fire(
                    "Invalid Selection",
                    "You can only select past months.",
                    "warning"
                  );
                }
              }}
            />

            {/* <Form.Control
              type="number"
              min="2000"
              max="2100"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: "90px" }}
              size="sm"
            /> */}

            <Form.Check
              type="checkbox"
              label="Select All"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="ms-2"
            />
          </div>
        </div>

        {/* Employee Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {employees.map((emp) => (
            <div className="col" key={emp.id}>
              <Card
                className={`d-flex flex-row align-items-center p-2 shadow-sm ${
                  selected[emp.id] ? "border-primary" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleIndividual(emp.id)}
              >
                <Form.Check
                  type="checkbox"
                  checked={!!selected[emp.id]}
                  onChange={() => toggleIndividual(emp.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="me-2"
                />
                <img
                  src={`${BASE_URL}/employees/${emp.id}/profile-image`}
                  alt="profile"
                  className="rounded-circle"
                  width="40"
                  height="40"
                  onError={(e) => (e.target.src = dpimg)} // 👈 fallback if no profile image
                />
                <div className="ms-3 flex-grow-1">
                  <div className="fw-semibold">{emp.name}</div>
                  <small className="text-muted">{emp.employee_code}</small>
                </div>
                <FaRegFileAlt
                  className="text-muted fs-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewIndividualSlip(emp.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </Card>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-4 gap-3">
          <Button
            onClick={handleGenerateAndSend}
            disabled={!Object.values(selected).some((v) => v) || gridLoading}
            className="px-4 py-2 rounded-pill"
          >
            {gridLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Generate Salary Slips And Send"
            )}
          </Button>

          {pdfPreviewUrl && (
            <Button
              variant="outline-primary"
              onClick={() => setShowPdfPreview(true)}
              className="px-4 py-2 rounded-pill"
            >
              <FaRegFilePdf className="me-2" />
              Preview PDF
            </Button>
          )}
        </div>

        <Modal
          show={showPdfPreview}
          onHide={handleClosePreview}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Salary Slip Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "80vh" }}>
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                title="Salary Slip Preview"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePreview}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfPreviewUrl;
                link.download = `Salary_Slip_${selectedMonth}_${selectedYear}.pdf`;
                link.click();
              }}
            >
              Download PDF
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };
  const SalaryStructureTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchSalaryStructures = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/salary-structures`);
          setData(response.data.data || []); // adjust depending on API structure
        } catch (error) {
          console.error("Error fetching salary structures:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSalaryStructures();
    }, []);
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading salary structures...</p>
        </div>
      );
    }
    return (
      <div>
        <h5 className="mb-3">Salary Structure</h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Emp ID</th>
              <th>Employee Name</th>
              <th>Basic Salary</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No salary structures found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.employee ? item.employee.employee_id : "N/A"}</td>
                  <td>
                    {item.employee
                      ? `${item.employee.first_name} ${item.employee.last_name}`
                      : "Unknown Employee"}
                  </td>
                  <td>{item.basic_salary}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    );
  };
  return (
    <div className="p-4 bg-white rounded shadow-sm min-vh-100 mt-3 mx-sm-3">
      <div className="d-flex gap-2 align-items-center mb-2 justify-content-end"></div>

      <h5 className="fw-bold mb-4">Salary Management</h5>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3 custom-tabs"
      >
        <Tab eventKey="payroll" title="Salary Pay Roll List">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold">Pay Roll</h6>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                style={{ width: "200px" }}
              />
              <Dropdown onSelect={(month) => setSelectedMonth(month)}>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  {selectedMonth}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {monthNames.map((month) => (
                    <Dropdown.Item key={month} eventKey={month}>
                      {month}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <div className="row">
            <div className="col-md-8">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading payroll data...</p>
                </div>
              ) : (
                <SalaryTable
                  data={filteredEmployees}
                  onSelect={handleEmployeeSelect}
                  selectedEmployee={selectedEmployee}
                />
              )}
            </div>
            <div className="col-md-4">
              {selectedEmployee ? (
                <SalarySlipCard employee={selectedEmployee} />
              ) : (
                <Card className="text-center p-4">
                  <Card.Body>
                    <h6>No Employee Selected</h6>
                    <p className="text-muted small">
                      Click on an employee from the list to view their salary
                      details
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </Tab>
        <Tab eventKey="slip" title="Employee Salary Slip">
          <EmployeeSlipGrid />
        </Tab>
        <Tab eventKey="structure" title="Salary Structure">
          <div className="p-3">
            {/* You can create a new component or table to show salary structure */}
            <SalaryStructureTable />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Salarymanagement;
