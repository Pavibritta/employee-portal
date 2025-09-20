import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Education.css";
import { useUser } from "../Contexts/UserContext";
import { BASE_URL } from "../Api";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";

const Education = () => {
  const [education, setEducation] = useState({
    qualification: "",
    degree: "",
    specialization: "",
    institution: "",
    university_name: "",
    year_of_passing: "",
    grade: "",
    start_date: "",
    end_date: "",
    education_type: "full_time",
    education_mode: "offline",
    description: "",
    status: "active",
    degree_certificate: null,
  });

  const { employeeData } = useEmployeeData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationList, setEducationList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { role } = useUser();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");
  console.log("employeeData:", employeeData);
  // Fetch education list
  const fetchEducations = async () => {
    try {
      let targetUserId = null;
      let tokenToUse = null;

      if (role === "admin") {
        // ✅ Admin mode
        targetUserId = employeeData?.user_id;
        tokenToUse = localStorage.getItem("token"); // admin token
      } else {
        // ✅ Employee mode
        targetUserId = userId; // employee’s own userId
        tokenToUse = localStorage.getItem("authToken"); // employee token
      }

      if (!targetUserId || !tokenToUse) {
        console.warn(
          "⚠️ Missing userId or Token, cannot fetch education details."
        );
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/employee-educations/user/${targetUserId}`,
        {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        }
      );

      setEducationList(response.data.data || []);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      Swal.fire("Error", "Failed to load education details", "error");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      if (employeeData?.user_id) {
        fetchEducations(); // ✅ fetch only when an employee is selected
      }
    } else {
      fetchEducations(); // ✅ employee mode → always fetch own data
    }
  }, [employeeData?.user_id, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setEducation((prev) => ({
      ...prev,
      degree_certificate: e.target.files[0],
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "qualification",
      "degree",
      "institution",
      "year_of_passing",
      "grade",
      "start_date",
    ];

    for (const field of requiredFields) {
      if (!education[field]) {
        Swal.fire(
          "Error",
          `Please fill in the ${field.replace(/_/g, " ")} field`,
          "error"
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    let targetUserId = null;
    let tokenToUse = null;

    if (role === "admin") {
      targetUserId = employeeData?.user_id; // selected employee id
      tokenToUse = localStorage.getItem("token");
    } else {
      targetUserId = userId; // employee’s own id
      tokenToUse = localStorage.getItem("authToken");
    }

    if (!tokenToUse || !targetUserId) {
      Swal.fire(
        "Error",
        "Authentication required. Please login again.",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        user_id: parseInt(targetUserId), // ✅ FIXED
        degree: education.degree,
        education_type: education.education_type,
        field_of_study: education.field_of_study || "",
        institution: education.institution,
        start_date: education.start_date,
        end_date: education.end_date || null,
        grade: education.grade?.toString() || "",
        description: education.description || "",
        is_current: false,
        qualification: education.qualification,
        year_of_passing: education.year_of_passing,
        degree_certificate: education.degree_certificate
          ? education.degree_certificate.name
          : null,
        education_mode: education.education_mode,
        status: education.status,
        university_name: education.university_name || null,
      };

      if (editMode && education.id) {
        await axios.put(
          `${BASE_URL}/employee-educations/${education.id}`,
          payload,
          { headers: { Authorization: `Bearer ${tokenToUse}` } }
        );
        Swal.fire(
          "Updated!",
          "Education details updated successfully!",
          "success"
        );
      } else {
        await axios.post(`${BASE_URL}/employee-educations`, payload, {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        Swal.fire(
          "Success",
          "Education details saved successfully!",
          "success"
        );
      }

      fetchEducations();
      setShowForm(false);
      setEditMode(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error.response?.data);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to save education details.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEducation({
      qualification: "",
      degree: "",
      specialization: "",
      institution: "",
      university_name: "",
      year_of_passing: "",
      grade: "",
      start_date: "",
      end_date: "",
      education_type: "full_time",
      education_mode: "offline",
      description: "",
      status: "active",
      degree_certificate: null,
    });
  };

  const handleEdit = (edu) => {
    setEducation({
      id: edu.id,
      qualification: edu.qualification,
      degree: edu.degree,
      field_of_study: edu.field_of_study || "",
      specialization: edu.specialization || "",
      institution: edu.institution,
      university_name: edu.university_name || "",
      year_of_passing: edu.year_of_passing,
      grade: edu.grade,
      start_date: edu.start_date?.split("T")[0],
      end_date: edu.end_date ? edu.end_date.split("T")[0] : "",
      education_type: edu.education_type || "full_time",
      education_mode: edu.education_mode || "offline",
      description: edu.description || "",
      status: edu.status || "active",
      degree_certificate: edu.degree_certificate
        ? { name: edu.degree_certificate }
        : null,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/employee-educations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Education deleted successfully!", "success");
          fetchEducations();
        } catch (error) {
          Swal.fire("Error", "Failed to delete record.", "error");
        }
      }
    });
  };

  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm">
      
        <div className="mb-3  text-end">
          <button
            className="btn btn-success"
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowForm(true);
            }}
          >
            + Add Education
          </button>
        </div>
    

      {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Qualification */}
            <div className="col-md-6">
              <label className="form-label">
                Qualification <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="qualification"
                value={education.qualification}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Diploma">Diploma</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            {/* Degree */}
            <div className="col-md-6">
              <label className="form-label">
                Degree/Diploma Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="degree"
                value={education.degree}
                onChange={handleChange}
                placeholder="Eg. B.E, B.Tech, MBA"
                
              />
            </div>

            {/* Field of Study (specialization) */}
            <div className="col-md-6">
              <label className="form-label">
                Field of Study / Specialization
              </label>
              <input
                type="text"
                className="form-control"
                name="field_of_study"
                value={education.field_of_study}
                onChange={handleChange}
                placeholder="Eg: Computer Science"
              />
            </div>

            {/* Institution */}
            <div className="col-md-6">
              <label className="form-label">
                Institution Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="institution"
                value={education.institution}
                onChange={handleChange}
                placeholder="Enter Institution Name"
                
              />
            </div>

            {/* Year of Passing */}
            <div className="col-md-6">
              <label className="form-label">
                Year of Passing <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="year_of_passing"
                value={education.year_of_passing}
                onChange={handleChange}
                placeholder="Eg: 2019"
                min="1900"
                max={new Date().getFullYear()}
                
              />
            </div>

            {/* Grade / Percentage */}
            <div className="col-md-6">
              <label className="form-label">
                Grade / Percentage <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="grade"
                value={education.grade}
                onChange={handleChange}
                placeholder="Eg: 78.5% or 8.2 CGPA"
                
              />
            </div>

            {/* Education Type */}
            <div className="col-md-6">
              <label className="form-label">Education Type</label>
              <select
                className="form-select"
                name="education_type"
                value={education.education_type}
                onChange={handleChange}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="online">Online</option>
                
              </select>
            </div>

            {/* Education Mode */}
            <div className="col-md-6">
              <label className="form-label">Mode</label>
              <select
                className="form-select"
                name="education_mode"
                value={education.education_mode}
                onChange={handleChange}
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="col-md-6">
              <label className="form-label">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={education.start_date}
                onChange={handleChange}
                
              />
            </div>

            {/* End Date */}
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={education.end_date || ""}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="col-md-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={education.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief details about your education..."
              />
            </div>


            {/* Degree Certificate Upload */}
            {/* <div className="col-md-6">
              <label className="form-label">Upload Degree Certificate</label>
              <input
                type="file"
                className="form-control"
                name="degree_certificate"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <small className="text-muted">
                Accepted formats: PDF, JPG, PNG, DOC (Max 5MB)
              </small>
            </div> */}
          </div>

          {/* Buttons */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary px-5 py-2 rounded-pill"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : editMode ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => {
                setShowForm(false);
                setEditMode(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-5">
        <h5 className="mb-3">Saved Education Details</h5>

        {educationList.length > 0 ? (
          <div className="row">
            {educationList.map((edu, index) => {
              const formatDate = (date) => {
                if (!date) return "N/A";
                const d = new Date(date);
                return isNaN(d)
                  ? date
                  : d.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
              };

              return (
                <div key={index} className="col-md-6 mb-3">
                  <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body">
                      <h6 className="card-title text-primary mb-2">
                        {edu.degree} ({edu.qualification})
                      </h6>
                      <p className="mb-1">
                        <strong>Specialization:</strong>{" "}
                        {edu.field_of_study || "N/A"}
                      </p>
                      <p className="mb-1">
                        <strong>Institution:</strong> {edu.institution}
                      </p>
                      <p className="mb-1">
                        <strong>Year of Passing:</strong> {edu.year_of_passing}
                      </p>
                      <p className="mb-1">
                        <strong>Percentage/CGPA:</strong> {edu.grade}
                      </p>
                      <p className="mb-1">
                        <strong>Start Date:</strong>{" "}
                        {formatDate(edu.start_date)}
                      </p>
                      <p className="mb-0">
                        <strong>End Date:</strong>{" "}
                        {edu.end_date ? formatDate(edu.end_date) : "Present"}
                      </p>

                      {/* {edu.degree_certificate &&
                      typeof edu.degree_certificate === "object" ? (
                        <p className="mt-2">
                          Current file:{" "}
                          <strong>{edu.degree_certificate.name}</strong>
                        </p>
                      ) : edu.degree_certificate ? (
                        <p className="mt-2">
                          Current file:{" "}
                          <strong>{edu.degree_certificate}</strong>
                        </p>
                      ) : null} */}

                      
                        <div className="mt-3 d-flex justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => handleEdit(edu)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(edu.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                    
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted">No education records found.</p>
        )}
      </div>
    </div>
  );
};

export default Education;
