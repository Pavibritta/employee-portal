import React, { useState, useEffect } from "react";
import "./Experience.css";
import { useUser } from "../Contexts/UserContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../Api";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";

const Experience = () => {
  const { role } = useUser();
  const { employeeData } = useEmployeeData();

  const [experience, setExperience] = useState({
    company_name: "",
    position: "",
    start_date: "",
    end_date: "",
    responsibilities: "",
    employment_type: "",
    work_location: "",
    status: "completed",
  });

  const [experienceList, setExperienceList] = useState([]);
  const [editMode, setEditMode] = useState(false); // ✅ toggle between form & list
  const [editId, setEditId] = useState(null); // ✅ store which exp is being edited
  const [isAdding, setIsAdding] = useState(false); // ✅ new add mode

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");
  const adminToken = localStorage.getItem("token");

  // ---------------- Handle Form Change ----------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperience((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---------------- POST/PUT: Submit Experience ----------------
  // ---------------- POST/PUT: Submit Experience ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let targetUserId =
        role === "admin" ? employeeData?.user_id : Number(userId);

      let payload = {
        ...experience,
        user_id: targetUserId,
        end_date: experience.end_date || null,
      };

      delete payload.id;
      delete payload.is_current;

      const headers = {
        Authorization: `Bearer ${role === "admin" ? adminToken : token}`,
      };

      if (editMode && editId) {
        // ✅ Update existing record
        await axios.put(`${BASE_URL}/employee-experiences/${editId}`, payload, {
          headers,
        });

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Experience updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // ✅ Add new record
        await axios.post(`${BASE_URL}/employee-experiences`, payload, {
          headers,
        });

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Experience added successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      resetForm();
      fetchExperiences();
    } catch (err) {
      console.error("Error Payload:", experience);
      console.error("Error:", err.response?.data || err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save experience",
      });
    }
  };

  // ---------------- GET: Fetch Experience List ----------------
  const fetchExperiences = async () => {
    try {
      let url = "";
      let headers = {};

      if (role === "employee") {
        url = `${BASE_URL}/employee-experiences/user/${userId}`;
        headers = { Authorization: `Bearer ${token}` };
      } else if (role === "admin" && employeeData?.user_id) {
        url = `${BASE_URL}/employee-experiences/user/${employeeData.user_id}`;
        headers = { Authorization: `Bearer ${adminToken}` };
      }

      if (!url) return;
      const res = await axios.get(url, { headers });
      setExperienceList(res.data.data || []);
      console.log(res.data.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire("Error", "Failed to load experiences", "error");
    }
  };

  // ---------------- DELETE: Delete Experience ----------------
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the experience permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/employee-experiences/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Experience has been deleted.", "success");
          fetchExperiences();
        } catch (err) {
          console.error("Delete Error:", err);
          Swal.fire("Error", "Failed to delete experience", "error");
        }
      }
    });
  };

  // ---------------- Edit Experience ----------------
  const handleEdit = (exp) => {
    setExperience({ ...exp }); // pre-fill form
    setEditId(exp.id);
    setEditMode(true);
    setIsAdding(false); // not adding
  };

  // ---------------- Add New Experience ----------------
  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
    setEditMode(true);
  };

  // ---------------- Reset ----------------
  const resetForm = () => {
    setExperience({
      company_name: "",
      position: "",
      start_date: "",
      end_date: "",
      responsibilities: "",
      employment_type: "",
      work_location: "",
      status: "completed",
    });
    setEditId(null);
    setEditMode(false);
    setIsAdding(false);
  };

  useEffect(() => {
    fetchExperiences();
  }, [role, employeeData?.id]);

  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm">
      {/* ------------ ADD EXPERIENCE BUTTON (Employee Only) ------------ */}

      <div className="mb-3 text-end">
        <button className="btn btn-success" onClick={handleAddNew}>
          + Add Experience
        </button>
      </div>

      {/* ------------ FORM (for Add/Edit) ------------ */}
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                name="company_name"
                value={experience.company_name}
                onChange={handleChange}
                placeholder="Company Name"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                name="position"
                value={experience.position}
                onChange={handleChange}
                placeholder="Software Developer"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Employment Type</label>
              <select
                className="form-select"
                name="employment_type"
                value={experience.employment_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Employment Type</option>
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="intern">Intern</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={experience.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={experience.end_date || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Roles & Responsibilities</label>
              <textarea
                className="form-control"
                name="responsibilities"
                value={experience.responsibilities}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your roles and responsibilities"
                required
              ></textarea>
            </div>

            <div className="col-md-6">
              <label className="form-label">Work Location</label>
              <input
                type="text"
                className="form-control"
                name="work_location"
                value={experience.work_location}
                onChange={handleChange}
                placeholder="Eg: Chennai"
                required
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-primary px-5 py-2 rounded-pill"
            >
              {editId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-3 px-5 py-2 rounded-pill"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* ------------ EXPERIENCE LIST ------------ */
        <div className="mt-3">
          <h5 className="fw-bold mb-3">My Experiences</h5>

          {experienceList.length === 0 ? (
            <p className="text-muted">No experiences added yet.</p>
          ) : (
            experienceList.map((exp) => (
              <Card key={exp.id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    {/* Experience Info */}
                    <div>
                      <Card.Title as="h6" className="mb-1 fw-bold">
                        {exp.company_name}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {exp.position} • {exp.employment_type}
                      </Card.Subtitle>
                      <Card.Text className="mb-1">
                        {exp.start_date} - {exp.end_date || "Present"}
                      </Card.Text>
                      <Card.Text className="mb-1">
                        <strong>Year of Experience:</strong>
                        {exp.total_experience}
                      </Card.Text>
                      <Card.Text className="mb-1">
                        <strong>Location:</strong> {exp.work_location}
                      </Card.Text>
                      <Card.Text className="mb-0">
                        {exp.responsibilities}
                      </Card.Text>
                    </div>

                    {/* Action Buttons */}

                    <div className="d-flex align-items-start gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(exp)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FaEdit />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(exp.id)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FaTrash />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Experience;
