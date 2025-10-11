import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { CiFilter } from "react-icons/ci";
import dpimg from "../images/dpimg.jpg";
import "./Employemanagement.css";
import axios from "axios";
import { useEmployeeData } from "./Contexts/EmployeeDataContext";
import { BASE_URL } from "./Api";
import { Modal } from "react-bootstrap";
import Updateprofile from "./Updateprofile";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdFirstPage } from "react-icons/md";
import { MdLastPage } from "react-icons/md";

const Employemanagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    setEmployeeData,
    mode,
    setMode,
    setSelectedEmployeeId,
    employeeData,
  } = useEmployeeData();
  const token = localStorage.getItem("token");

  // For Modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const empArray = Array.isArray(res.data.data.data)
          ? res.data.data.data
          : [];
        const formattedEmployees = empArray.map((emp) => ({
          id: emp.id || "N/A",
          employee_id: emp.employee_id || "N/A",
          name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          role: emp.designation_name || "N/A",
          joiningDate: emp.joining_date?.split("T")[0] || "N/A",
          email: emp.email || "N/A",
          phone: emp.phone || "N/A",
          status: emp.status || "N/A",
          // image: emp.avatar
          //   ? `${BASE_URL}/employees/${employeeData.id}/profile-image`
          //   : "",
          first_name: emp.first_name || "",
          last_name: emp.last_name || "",
          gender: emp.gender || "",
          date_of_birth: emp.date_of_birth || "",
          present_address: emp.present_address || "",
          permanent_address: emp.permanent_address || "",
          blood_group: emp.blood_group || "",
          marital_status: emp.marital_status || "",
          emergency_contact: emp.emergency_contact || "",
          emergency_contact_name: emp.emergency_contact_name || "",
          father_name: emp.father_name || "",
          mother_name: emp.mother_name || "",
          joining_date: emp.joining_date || "",
          probation_end_date: emp.probation_end_date || "",
          salary: emp.salary || "",
          designation_id: emp.designation_id || "",
          department_id: emp.department_id || "",
          shift_id: emp.shift_id || "",
          user_id: emp.user_id,
        }));

        setEmployees(formattedEmployees);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setLoading(false);
      });
  }, []);
  console.log(employees);
  // Handle Edit
  const handleEditEmployee = (employee) => {
    console.log("emp-select", employee);

    setEmployeeData(employee);
    console.log(employee);

    setMode("edit");
    setSelectedEmployeeId(employee.id);
    setShowModal(true);
  };

  // Handle Add
  const handleAddEmployee = () => {
    setEmployeeData({
      id: "",
      employee_id: "",
      first_name: "",
      last_name: "",
      phone: "",
      gender: "",
      date_of_birth: "",
      present_address: "",
      permanent_address: "",
      blood_group: "",
      marital_status: "",
      emergency_contact: "",
      emergency_contact_name: "",
      father_name: "",
      mother_name: "",
      joining_date: "",
      probation_end_date: "",
      salary: "",
      designation_id: "",
      department_id: "",
      shift_id: "",
      email: "",
    });
    setMode("add");
    setSelectedEmployeeId(null);
    setShowModal(true);
  };
  console.log(employeeData.employee_id);

  const [passwordData, setPasswordData] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // show 5 employees per page

  // Calculate pagination

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔎 Apply filters
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase());

    // Normalize both sides (lowercase + trim)
    const empStatus = emp.status ? emp.status.toLowerCase().trim() : "";
    const filterStatus = statusFilter.toLowerCase().trim();

    const matchesStatus = filterStatus === "all" || empStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ✅ Pagination after filtering
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-4 bg-light min-vh-100 mt-5">
      {/* Header */}
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
          {/* 🧩 Heading */}
          <h5 className="fw-bold text-center text-md-start mb-0">
            👥 Employee Management
          </h5>

          {/* 🔍 Search + Filter + Button */}
          <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-100 w-md-auto">
            {/* 🔎 Search Bar */}
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name or ID..."
              style={{ minWidth: "180px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* ⬇️ Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Employees</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* ➕ Add Button */}
            <button
              className="btn btn-success px-4 fw-bold"
              onClick={handleAddEmployee}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <p>Loading employees...</p>
        </div>
      ) : (
        <div className="row g-3">
          {currentEmployees.map((emp, idx) => (
            <div className="col-md-4 col-lg-3" key={idx}>
              <div className="card employee-card shadow-sm border-0 h-100">
                <div
                  className="card-body d-flex flex-column align-items-center text-center position-relative"
                  onClick={() => handleEditEmployee(emp)}
                >
                  {/* <div
                    className="edit-icon position-absolute top-0 end-0 p-2"
                    onClick={() => handleEditEmployee(emp)}
                  >
                    <FaEdit style={{ cursor: "pointer", color: "#6c757d" }} />
                  </div> */}
                  <img
                    src={`${BASE_URL}/employees/${emp.id}/profile-image`}
                    alt="profile"
                    className="rounded-circle mb-3"
                    width="50"
                    height="50"
                    onError={(e) => (e.target.src = dpimg)} // 👈 fallback if no profile image
                  />

                  <h6 className="fw-bold mb-1">
                    {emp.first_name}{" "}
                    <span className="ms-2">{emp.last_name}</span>
                  </h6>

                  <p className="mb-1 small">{emp.role}</p>
                  <span
                    className={`badge ${
                      emp.status === "Active" ? "bg-success" : "bg-secondary"
                    } mb-3`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="card-footer bg-white text-start small">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <span className="text-muted d-block">Employee ID:</span>
                      <strong>{emp.employee_id}</strong>
                    </div>
                    <div>
                      <span className="text-muted d-block">Joining Date:</span>
                      <strong>{emp.joiningDate}</strong>
                    </div>
                  </div>
                  <p className="mb-1">
                    <MdEmail className="text-danger me-2" />
                    <strong>{emp.email}</strong>
                  </p>
                  <p className="mb-0">
                    <FaPhoneAlt className="text-danger me-2" />
                    <strong>{emp.phone}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
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
          )}
        </div>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        dialogClassName="modal-90w"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "edit" ? (
              <>
                ✏️ Edit Employee Profile –{" "}
                <span className="text-primary">
                  {employeeData.first_name || "Unknown"}{" "}
                  {employeeData.last_name}
                </span>
              </>
            ) : (
              "➕ Add New"
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mode === "edit" ? (
            <Updateprofile />
          ) : (
            // 👉 Create New User form directly here
            <div className="me-4">
              <h6 className="mb-3">Create New User</h6>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const newUser = {
                    employee_id: e.target.employee_id.value,
                    first_name: e.target.first_name.value,
                    last_name: e.target.last_name.value,
                    email: e.target.email.value,
                    phone: e.target.phone.value,
                    role: e.target.role.value,
                    password: e.target.password.value,
                    password_confirmation: e.target.password_confirmation.value,
                  };

                  Swal.fire({
                    title: "Are you sure?",
                    text: "Do you want to add this user?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#198754",
                    cancelButtonColor: "#dc3545",
                    confirmButtonText: "Okay",
                    cancelButtonText: "Cancel",
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      try {
                        await axios.post(`${BASE_URL}/users`, newUser, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        });

                        Swal.fire({
                          icon: "success",
                          title: "Success",
                          text: "User created successfully!",
                          confirmButtonColor: "#198754",
                        }).then(() => {
                          window.location.reload(); // ✅ reloads after user creation
                        });

                        setShowModal(false);
                      } catch (err) {
                        console.error(
                          "Error creating user:",
                          err.response?.data || err.message
                        );

                        let errorMsg = "Failed to create user";
                        if (err.response?.data?.errors) {
                          errorMsg = Object.entries(err.response.data.errors)
                            .map(
                              ([field, msgs]) => `${field}: ${msgs.join(", ")}`
                            )
                            .join("\n");
                        } else if (err.response?.data?.message) {
                          errorMsg = err.response.data.message;
                        }

                        Swal.fire({
                          icon: "error",
                          title: "Validation Error",
                          text: errorMsg,
                          confirmButtonColor: "#dc3545",
                        });
                      }
                    }
                  });
                }}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      name="employee_id"
                      className="form-control"
                      placeholder="Enter Employee ID"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className="form-control"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-control"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="Enter phone number"
                      pattern="\d{10}" // ✅ must be 10 digits
                      maxLength="10" // ✅ limit typing to 10
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      className="form-control role-select"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <div className="password-input-wrapper mb-2">
                      <input
                        type={passwordVisibility.password ? "text" : "password"}
                        name="password"
                        placeholder="Enter Password"
                        className="form-control"
                        value={passwordData.password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <span
                        className="toggle-password-icon"
                        onClick={() =>
                          setPasswordVisibility({
                            ...passwordVisibility,
                            password: !passwordVisibility.password,
                          })
                        }
                      >
                        {passwordVisibility.password ? (
                          <FaEye />
                        ) : (
                          <FaEyeSlash />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Confirm Password</label>
                    <div className="password-input-wrapper mb-2">
                      <input
                        type={passwordVisibility.confirm ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Confirm Password"
                        className="form-control"
                        value={passwordData.password_confirmation}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            password_confirmation: e.target.value,
                          })
                        }
                        required
                      />
                      <span
                        className="toggle-password-icon"
                        onClick={() =>
                          setPasswordVisibility({
                            ...passwordVisibility,
                            confirm: !passwordVisibility.confirm,
                          })
                        }
                      >
                        {passwordVisibility.confirm ? (
                          <FaEye />
                        ) : (
                          <FaEyeSlash />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-success px-4">
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Employemanagement;
