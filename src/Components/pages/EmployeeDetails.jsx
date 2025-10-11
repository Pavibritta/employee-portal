import React from "react";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useEmployee } from "../Contexts/EmployeeContext";
import {
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaTransgender,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaHeartbeat,
  FaUserFriends,
} from "react-icons/fa";
import { BASE_URL } from "../Api";
import dpimg from "../images/dpimg.jpg";

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
    <div className="container my-4 mt-0">
      <Card className="shadow-lg border-0 rounded-4 overflow-hidden p-4 position-relative bg-light">
        {/* ✏️ Edit Button */}
        <Button
          variant="warning"
          className="position-absolute top-0 end-0 m-3 fw-semibold text-white rounded-3"
          onClick={() =>
            navigate(`/updateprofile/employeedetails/${employee.id}/personal`)
          }
        >
          <FaEdit className="me-2" />
          Edit
        </Button>

        {/* Profile Header */}
        <div className="text-center mb-4">
          <img
            src={`${BASE_URL}/employees/${id}/profile-image`}
            alt="Profile"
            className="rounded-circle shadow-sm border border-3 border-white"
            width="110"
            height="110"
            onError={(e) => (e.target.src = dpimg)}
          />
          <h4 className="mt-3 text-primary fw-bold mb-0">
            {employee.first_name} {employee.last_name}
          </h4>
          <p className="text-muted mb-1">
            {employee.designation_name || "Employee"}
          </p>
          <Badge bg="primary" className="px-3 py-2">
            {employee.department_name || employee.department?.name || "N/A"}
          </Badge>
        </div>

        <hr />

        {/* Personal Info */}
        <Row className="gy-3">
          <Col md={6}>
            <h6 className="fw-bold text-secondary mb-2">
              Personal Information
            </h6>
            <p>
              <FaUserTie className="me-2 text-primary" />{" "}
              <strong>Employee ID:</strong> {employee.employee_id}
            </p>
            <p>
              <FaPhone className="me-2 text-primary" /> <strong>Phone:</strong>{" "}
              {employee.phone || "N/A"}
            </p>
            <p>
              <FaEnvelope className="me-2 text-primary" />{" "}
              <strong>Email:</strong> {employee.email}
            </p>
            <p>
              <FaTransgender className="me-2 text-primary" />{" "}
              <strong>Gender:</strong>{" "}
              {employee.gender
                ? employee.gender.charAt(0).toUpperCase() +
                  employee.gender.slice(1)
                : "N/A"}
            </p>
            <p>
              <FaCalendarAlt className="me-2 text-primary" />{" "}
              <strong>DOB:</strong> {formatDate(employee.date_of_birth)}
            </p>
          </Col>

          <Col md={6}>
            <h6 className="fw-bold text-secondary mb-2">Employment Details</h6>
            <p>
              <FaBuilding className="me-2 text-primary" />{" "}
              <strong>Shift:</strong>{" "}
              {employee.shift_name || employee.shift?.name || "N/A"}
            </p>
            <p>
              <FaUserTie className="me-2 text-primary" />{" "}
              <strong>Marital Status:</strong>{" "}
              {employee.marital_status
                ? employee.marital_status.charAt(0).toUpperCase() +
                  employee.marital_status.slice(1)
                : "N/A"}
            </p>
            <p>
              <FaHeartbeat className="me-2 text-primary" />{" "}
              <strong>Blood Group:</strong> {employee.blood_group || "N/A"}
            </p>
            <p>
              <FaCalendarAlt className="me-2 text-primary" />{" "}
              <strong>Joining Date:</strong> {formatDate(employee.joining_date)}
            </p>
            <p>
              <FaCalendarAlt className="me-2 text-primary" />{" "}
              <strong>Probation End:</strong>{" "}
              {formatDate(employee.probation_end_date)}
            </p>
          </Col>
        </Row>

        <hr />

        {/* Emergency Contact */}
        <Row>
          <Col md={6}>
            <h6 className="fw-bold text-secondary mb-2">Emergency Contact</h6>
            <p>
              <FaUserFriends className="me-2 text-danger" />{" "}
              <strong>Name:</strong> {employee.emergency_contact_name || "N/A"}
            </p>
            <p>
              <FaPhone className="me-2 text-danger" /> <strong>Number:</strong>{" "}
              {employee.emergency_contact || "N/A"}
            </p>
          </Col>

          <Col md={6}>
            <h6 className="fw-bold text-secondary mb-2">Family Details</h6>
            <p>
              <strong>Father:</strong> {employee.father_name || "N/A"}
            </p>
            <p>
              <strong>Mother:</strong> {employee.mother_name || "N/A"}
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeDetails;
