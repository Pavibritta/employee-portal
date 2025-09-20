import React, { useState, useEffect, useLayoutEffect } from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import "./Personal.css";
import profileDefault from "../images/profileimg1.jpg";
import { LuCamera } from "react-icons/lu";
import axios from "axios";
import Swal from "sweetalert2";
import { useUser } from "../Contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";
import { BASE_URL } from "../Api";
import imageCompression from "browser-image-compression";

const Personal = () => {
  const { role } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    employeeData,
    updateField,
    setEmployeeData,
    mode,
    selectedEmployeeId,
  } = useEmployeeData();

  const [profileFile, setProfileFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    console.log("Employee Data:", employeeData);
  }, [employeeData]);

  useLayoutEffect(() => {
    if (mode === "edit" || role === "employee") {
      setIsEdit(true);
    } else {
      setIsEdit(false);
      if (role === "admin") {
        const emptyData = {
          id: "",
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
          // salary: "",
          designation_id: "",
          department_id: "",
          shift_id: "",
          email: "",
          user_id: "",
        };
        setEmployeeData(emptyData);
      }
    }
  }, [location, role, setEmployeeData, mode]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        setProfileFile(compressedFile); // 👈 Save file for API

        const reader = new FileReader();
        reader.onloadend = () => setProfileImage(reader.result); // 👈 Preview
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error while compressing image:", error);
      }
    }
  };
  // Handle input changes - update context
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  // Handle user selection for admin
  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = userOptions.find((user) => user.id == userId);
    updateField("user_id", userId);
    if (selectedUser) {
      updateField("email", selectedUser.email);
    }
  };

  // Validation
  const validateForm = () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "phone",
      "gender",
      "date_of_birth",
      "email",
    ];

    for (const field of requiredFields) {
      if (!employeeData[field]) {
        Swal.fire(
          "Error",
          `Please fill in the ${field.replace(/_/g, " ")} field`,
          "error"
        );
        return false;
      }
    }

    if (employeeData.phone && !/^\d{10,15}$/.test(employeeData.phone)) {
      Swal.fire("Error", "Please enter a valid phone number", "error");
      return false;
    }

    if (
      employeeData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)
    ) {
      Swal.fire("Error", "Please enter a valid email address", "error");
      return false;
    }

    return true;
  };

  // Role-based API call
  // Role-based API call
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    const adminToken = localStorage.getItem("token");

    if ((role === "admin" && !adminToken) || (role === "employee" && !token)) {
      Swal.fire(
        "Error",
        "Missing authentication token. Please log in again.",
        "error"
      );
      setIsLoading(false);
      return;
    }

    if (role === "admin" && !isEdit && !employeeData.user_id) {
      Swal.fire("Error", "Please select a user for this employee", "error");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...employeeData,
      user_id:
        role === "admin"
          ? employeeData.user_id
          : localStorage.getItem("userId"),
      salary: Number(employeeData.salary) || 0,
      designation_id: Number(employeeData.designation_id) || 0,
      department_id: Number(employeeData.department_id) || 0,
      shift_id: Number(employeeData.shift_id) || 0,
    };

    try {
      let response;
      if (role === "admin") {
        if (isEdit) {
          // Update existing employee
          response = await axios.put(
            `${BASE_URL}/employees/${employeeData.id}`,
            payload,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );
        } else {
          // Create new employee
          response = await axios.post(`${BASE_URL}/employees`, payload, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
        }

        await Swal.fire({
          title: "Success",
          text: isEdit
            ? "Employee updated successfully!"
            : "Employee created successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        if (profileFile) {
          const formData = new FormData();
          formData.append("profile_image", profileFile); // 👈 use file object

          await axios.post(
            `${BASE_URL}/employees/${employeeData.id}/upload-profile-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`, // or adminToken if admin
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        await Swal.fire({
          title: "Success",
          text: "Profile updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate("/layout/employemanagement", { replace: true });
      } else if (role === "employee") {
        response = await axios.put(
          `${BASE_URL}/employees/${employeeData.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await Swal.fire({
          title: "Success",
          text: "Profile updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        if (profileFile) {
          const formData = new FormData();
          formData.append("profile_image", profileFile); // 👈 use file object
          const id = localStorage.getItem("Id");
          await axios.post(
            `${BASE_URL}/employees/${id}/upload-profile-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`, // or adminToken if admin
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        await Swal.fire({
          title: "Success",
          text: "Profile updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate(`/updateprofile/employeedetails/${response.data.data.id}`);
        window.location.reload();
      }
    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        if (error.response.status === 422) {
          if (error.response.data.errors) {
            const firstError = Object.values(error.response.data.errors)[0][0];
            errorMessage = firstError;
          } else if (error.response.data.message.includes("user_id")) {
            errorMessage = "This user is already assigned to another employee.";
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const id = localStorage.getItem("Id");

      if (role === "employee") {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (token && userId) {
          try {
            // 🔹 Fetch employee details
            const response = await axios.get(`${BASE_URL}/employees/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const emp = response.data.data;
            console.log(emp);

            const filled = {
              id: emp.id || "",
              first_name: emp.first_name || "",
              last_name: emp.last_name || "",
              phone: emp.phone || "",
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
              designation_id: emp.designation_id || "",
              designation_name: emp.designation?.name || "",
              department_id: emp.department_id || "",
              department_name: emp.department?.name || "",
              shift_id: emp.shift_id || "",
              shift_name: emp.shift?.name || "",
              email: emp.user?.email || emp.email || "",
              user_id: emp.user_id || "",
              employee_id: emp.employee_id,
            };

            setEmployeeData(filled);
            setIsEdit(true);

            // 🔹 Fetch profile image separately
            try {
              const imgRes = await axios.get(
                `${BASE_URL}/employees/${id}/profile-image`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: "blob", // important for images
                }
              );

              const imageUrl = URL.createObjectURL(imgRes.data);
              setProfileImage(imageUrl); // 👈 show in <img />
            } catch (imgErr) {
              console.warn("No profile image found:", imgErr);
            }
          } catch (err) {
            console.error("Error fetching employee:", err);
          }
        }
      } else if (role === "admin" && isEdit && selectedEmployeeId) {
        const token = localStorage.getItem("token");

        if (token) {
          try {
            // 🔹 Fetch employee details
            const response = await axios.get(
              `${BASE_URL}/employees/${selectedEmployeeId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const emp = response.data.data;
            console.log(emp);

            const filled = {
              id: emp.id || "",
              first_name: emp.first_name || "",
              last_name: emp.last_name || "",
              phone: emp.phone || "",
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
              designation_id: emp.designation_id || "",
              designation_name: emp.designation?.name || "",
              department_id: emp.department_id || "",
              department_name: emp.department?.name || "",
              shift_id: emp.shift_id || "",
              shift_name: emp.shift?.name || "",
              email: emp.user?.email || emp.email || "",
              user_id: emp.user_id || "",
            };

            setEmployeeData(filled);

            // 🔹 Fetch profile image separately
            try {
              const imgRes = await axios.get(
                `${BASE_URL}/employees/${selectedEmployeeId}/profile-image`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: "blob",
                }
              );

              const imageUrl = URL.createObjectURL(imgRes.data);
              setProfileImage(imageUrl);
            } catch (imgErr) {
              console.warn("No profile image found:", imgErr);
            }
          } catch (err) {
            console.error("Error fetching employee for admin edit:", err);
          }
        }
      }
    };

    fetchEmployeeData();
  }, [role, setEmployeeData, isEdit, selectedEmployeeId]);

  useEffect(() => {
    if (role === "admin") {
      const token = localStorage.getItem("token");

      const fetchUsers = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(res);
          if (Array.isArray(res.data.data)) {
            setUserOptions(res.data.data);
          } else if (Array.isArray(res.data)) {
            setUserOptions(res.data);
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };

      if (token) fetchUsers();
    }
  }, [role]);

  const resetForm = () => {
    if (role === "admin" && isEdit) {
      // For admin edit mode, refetch the original data
      const token = localStorage.getItem("token");

      if (token && selectedEmployeeId) {
        axios
          .get(`${BASE_URL}/employees/${selectedEmployeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const emp = res.data.data;
            console.log(res);
            const filled = {
              id: emp.id || "",
              first_name: emp.first_name || "",
              last_name: emp.last_name || "",
              phone: emp.phone || "",
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
              // salary: emp.salary || "",

              // Designation
              designation_id: emp.designation_id || "",
              designation_name: emp.designation?.name || "",

              // Department
              department_id: emp.department_id || "",
              department_name: emp.department?.name || "",

              // Shift
              shift_id: emp.shift_id || "",
              shift_name: emp.shift?.name || "",

              // Email / User
              email: emp.user?.email || emp.email || "",
              user_id: emp.user_id || "",
            };

            setEmployeeData(filled);
            console.log(employeeData);
            if (emp.avatar) {
              setProfileImage(emp.avatar);
              localStorage.setItem("employeeProfileImage", emp.avatar);
            }
          })
          .catch((err) => console.error("Error resetting form:", err));
      }
    }
    // else {
    //   // For add mode or employee role
    //   const emptyFormData = {
    //     id: "",
    //     first_name: "",
    //     last_name: "",
    //     phone: "",
    //     gender: "",
    //     date_of_birth: "",
    //     present_address: "",
    //     permanent_address: "",
    //     blood_group: "",
    //     marital_status: "",
    //     emergency_contact: "",
    //     emergency_contact_name: "",
    //     father_name: "",
    //     mother_name: "",
    //     joining_date: "",
    //     probation_end_date: "",
    //     salary: "",
    //     designation_id: "",
    //     department_id: "",
    //     shift_id: "",
    //     email: "",
    //     user_id: "",
    //   };
    //   setEmployeeData(emptyFormData);
    //   setProfileImage(profileDefault);
    //   localStorage.removeItem("employeeProfileImage");
    // }
  };
  const departmentOptions = [
    { id: 1, name: "Development" },
    { id: 2, name: "Human Resources" },
    { id: 3, name: "Marketing" },
    { id: 4, name: "Operations" },
  ];

  const designationOptions = [
    { id: 1, name: "Software Engineer" },
    { id: 2, name: "Senior Software Engineer" },
    { id: 3, name: "Tech Lead" },
    { id: 4, name: "HR Executive" },
    { id: 5, name: "HR Manager" },
    { id: 6, name: "Accountant" },
    { id: 7, name: "Finance Manager" },
    { id: 8, name: "Marketing Executive" },
    { id: 9, name: "Marketing Manager" },
    { id: 10, name: "Operations Executive" },
  ];

  const shiftOptions = [
    { id: 1, name: "General Shift (09:00 AM – 06:00 PM)" },
    { id: 2, name: "Morning Shift (08:00 AM – 05:00 PM)" },
    { id: 3, name: "Evening Shift (02:00 PM – 11:00 PM)" },
    { id: 4, name: "Night Shift (10:00 PM – 06:00 AM)" },
    { id: 5, name: "Flexi Shift (10:00 AM – 07:00 PM)" },
  ];

  return (
    <div className="personal-form-container p-3 p-md-4">
      {isLoading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      <div className="text-center mb-4">
        <div className="profile-pic-wrapper position-relative d-inline-block">
          <img
            src={profileImage}
            alt="Profile"
            className="rounded-circle profile-pic img-fluid"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
          <label
            htmlFor="upload-photo"
            className="upload-icon position-absolute"
          >
            <LuCamera />
          </label>
          <input
            type="file"
            id="upload-photo"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        {role === "admin" && !isEdit && (
          <Row className="mb-3">
            <Col lg={12}>
              <Form.Label>
                Select User <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="user_id"
                value={employeeData.user_id || ""}
                onChange={handleUserChange}
                required
              >
                <option value="">Choose a user</option>
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || `${user.first_name} ${user.last_name}`} (
                    {user.email})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              First Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="First Name"
              name="first_name"
              value={employeeData.first_name || ""}
              onChange={handleChange}
              required
            />
          </Col>
          <Col lg={6}>
            <Form.Label>
              Last Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Last Name"
              name="last_name"
              value={employeeData.last_name || ""}
              onChange={handleChange}
              required
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Gender <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="gender"
              value={employeeData.gender || ""}
              onChange={handleChange}
            >
              <option value="">Choose</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Form.Select>
          </Col>
          <Col lg={6}>
            <Form.Label>
              Date of Birth <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="date_of_birth"
              value={employeeData.date_of_birth || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>Marital Status</Form.Label>
            <Form.Select
              name="marital_status"
              value={employeeData.marital_status || ""}
              onChange={handleChange}
            >
              <option value="">Choose</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </Form.Select>
          </Col>
          <Col lg={6}>
            <Form.Label>
              Phone Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text" // 👈 use text instead of number to allow maxlength
              name="phone"
              placeholder="Phone"
              value={employeeData.phone || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // allow only digits
                if (val.length <= 10) {
                  handleChange({
                    target: { name: "phone", value: val },
                  });
                }
              }}
              maxLength={10} // 👈 ensures only 10 digits
              disabled={isEdit && role !== "admin"}
              required
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Email Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              value={employeeData.email || ""}
              onChange={handleChange}
              required
              readOnly={isEdit && role !== "admin"}
            />
          </Col>
          <Col lg={6}>
            <Form.Label>Blood Group</Form.Label>
            <Form.Control
              type="text"
              name="blood_group"
              placeholder="Blood Group"
              value={employeeData.blood_group || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>

        {/* <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Current Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="present_address"
              placeholder="Current Address"
              value={employeeData.present_address || ""}
              onChange={handleChange}
              required
            />
          </Col>
          <Col lg={6}>
            <Form.Label>
              Permanent Address <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="permanent_address"
              placeholder="Permanent Address"
              value={employeeData.permanent_address || ""}
              onChange={handleChange}
              required
            />
          </Col>
        </Row> */}

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Emergency Contact Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="emergency_contact_name"
              placeholder="Emergency Contact Name"
              value={employeeData.emergency_contact_name || ""}
              onChange={handleChange}
            />
          </Col>
          <Col lg={6}>
            <Form.Label>
              Emergency Contact Number <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="tel"
              name="emergency_contact"
              placeholder="Emergency Contact Number"
              value={employeeData.emergency_contact || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>Father's Name</Form.Label>
            <Form.Control
              type="text"
              name="father_name"
              placeholder="Father's Name"
              value={employeeData.father_name || ""}
              onChange={handleChange}
            />
          </Col>
          <Col lg={6}>
            <Form.Label>Mother's Name</Form.Label>
            <Form.Control
              type="text"
              name="mother_name"
              placeholder="Mother's Name"
              value={employeeData.mother_name || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Joining Date <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="joining_date"
              value={employeeData.joining_date || ""}
              onChange={handleChange}
              disabled={isEdit && role !== "admin"}
            />
          </Col>
          <Col lg={6}>
            <Form.Label>Probation End Date</Form.Label>
            <Form.Control
              type="date"
              name="probation_end_date"
              value={employeeData.probation_end_date || ""}
              onChange={handleChange}
            />
          </Col>
        </Row>

        {/* <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>Salary</Form.Label>
            <Form.Control
              type="number"
              name="salary"
              placeholder="Salary"
              value={employeeData.salary || ""}
              onChange={handleChange}
              disabled={isEdit && role !== "admin"}
            />
          </Col>
        </Row> */}

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Department <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="department_id"
              value={employeeData.department_id || ""}
              onChange={handleChange}
              disabled={isEdit && role !== "admin"}
            >
              <option value="">Choose Department</option>
              {departmentOptions.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={6}>
            <Form.Label>
              Designation <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="designation_id"
              value={employeeData.designation_id || ""}
              onChange={handleChange}
              disabled={isEdit && role !== "admin"}
            >
              <option value="">Choose Designation</option>
              {designationOptions.map((des) => (
                <option key={des.id} value={des.id}>
                  {des.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6}>
            <Form.Label>
              Shift <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="shift_id"
              value={employeeData.shift_id || ""}
              onChange={handleChange}
              disabled={isEdit && role !== "admin"}
            >
              <option value="">Choose Shift</option>
              {shiftOptions.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button
            type="submit"
            className="submit-btn w-100 w-md-auto mb-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Processing...
              </>
            ) : (
              "Update"
            )}{" "}
            {/* ✅ Always show Update now */}
          </Button>

          <Button
            variant="outline-danger"
            className="ms-2 w-100 w-md-auto mt-2 mt-md-0"
            onClick={resetForm}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Personal;
