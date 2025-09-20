import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useEmployee } from "../Contexts/EmployeeContext";
import { FaEdit } from "react-icons/fa";
import { BASE_URL } from "../Api";

const EmployeeDetails = () => {
  const { employeeData } = useEmployee();
  const navigate = useNavigate();
  const location = useLocation();
  const employee = employeeData;
  console.log(employee);
  const id = localStorage.getItem("Id");
  // If no employee data is available
  if (!employee) {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">No employee data found.</p>
        <Button variant="primary" onClick={() => navigate("/personal")}>
          Go Back to Form
        </Button>
      </div>
    );
  }
  console.log(employee);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mt-1">
      <Card className="p-4 shadow-sm position-relative">
        {/* ✏️ Edit Icon - top right */}
        <Button
          variant="link"
          className="position-absolute top-0 end-0 m-3 d-flex align-items-center text-warning fw-semibold"
          onClick={() =>
            navigate(`/updateprofile/employeedetails/${employee.id}/personal`)
          }
          style={{
            fontSize: "0.95rem",
            textDecoration: "none",
            gap: "5px",
          }}
        >
          <FaEdit size={18} />
          Edit
        </Button>

        {/* Profile Image */}
        <div className="text-center mb-4">
          <img
            src={`${BASE_URL}/employees/${id}/profile-image`}
            alt="profile"
            className="rounded-circle mb-3"
            width="80"
            height="80"
            onError={(e) => (e.target.src = dpimg)} // 👈 fallback if no profile image
          />

          <h3 className="mt-2 mb-0 text-primary">
            {employee.first_name} {employee.last_name}
          </h3>
          <p className="text-primary">{employee.email}</p>
        </div>

        <hr />

        {/* Employee Info */}
        <div className="row">
          <div className="col-md-6">
            <p>
              <strong>Employee ID:</strong>{" "}
              {employee.employee_id || employeeId || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {employee.phone || "N/A"}
            </p>
            <p>
              <strong>Gender:</strong>{" "}
              {employee.gender
                ? employee.gender.charAt(0).toUpperCase() +
                  employee.gender.slice(1)
                : "N/A"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {formatDate(employee.date_of_birth)}
            </p>
            <p>
              <strong>Marital Status:</strong>{" "}
              {employee.marital_status
                ? employee.marital_status.charAt(0).toUpperCase() +
                  employee.marital_status.slice(1)
                : "N/A"}
            </p>
            <p>
              <strong>Blood Group:</strong> {employee.blood_group || "N/A"}
            </p>
          </div>
          <div className="col-md-6">
            <p>
              <strong>Department:</strong>{" "}
              {employee.department_name || employee.department?.name || "N/A"}
            </p>
            <p>
              <strong>Designation:</strong> {employee.designation_name || "N/A"}
            </p>
            <p>
              <strong>Shift:</strong>{" "}
              {employee.shift_name || employee.shift?.name || "N/A"}
            </p>
            {/* <p>
              <strong>Salary:</strong>{" "}
              {employee.salary ? `$${employee.salary}` : "N/A"}
            </p> */}
          </div>
        </div>

        <hr />

        {/* Addresses */}
        {/* <div className="row mb-3">
          <div className="col-md-6">
            <h6 className="fw-bold">Current Address:</h6>
            <p>{employee.present_address || "N/A"}</p>
          </div>
          <div className="col-md-6">
            <h6 className="fw-bold">Permanent Address:</h6>
            <p>{employee.permanent_address || "N/A"}</p>
          </div>
        </div> */}

        {/* Emergency Contact */}
        <div className="mb-3">
          <h6 className="fw-bold">Emergency Contact:</h6>
          <p>
            <strong>Name:</strong> {employee.emergency_contact_name || "N/A"}
          </p>
          <p>
            <strong>Number:</strong> {employee.emergency_contact || "N/A"}
          </p>
        </div>

        {/* Family Info */}
        <div className="mb-3">
          <h6 className="fw-bold">Family Information:</h6>
          <p>
            <strong>Father's Name:</strong> {employee.father_name || "N/A"}
          </p>
          <p>
            <strong>Mother's Name:</strong> {employee.mother_name || "N/A"}
          </p>
        </div>

        {/* Employment Dates */}
        <div className="mb-3">
          <h6 className="fw-bold">Employment Dates:</h6>
          <p>
            <strong>Joining Date:</strong> {formatDate(employee.joining_date)}
          </p>
          <p>
            <strong>Probation End Date:</strong>{" "}
            {formatDate(employee.probation_end_date)}
          </p>
        </div>

        {/* Action Buttons */}
        {/* <div className="text-center mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="me-3"
          >
            Go Back
          </Button>
          <Button variant="info" onClick={() => window.print()}>
            Print Details
          </Button>
        </div> */}
      </Card>
    </div>
  );
};

export default EmployeeDetails;
