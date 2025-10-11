import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaTelegramPlane, FaEdit, FaExclamationTriangle } from "react-icons/fa";
import profileImg from "../images/dpimg.jpg";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ SweetAlert2
import { BASE_URL } from "./Api";

const Announcement = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState({});
  const [form, setForm] = useState({ title: "", message: "" });
  const [employees, setEmployees] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch current user ID and employees on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);

    fetchEmployees(token);
    if (userId) {
      fetchUserAnnouncements(userId, token);
    }
  }, []);

  // Fetch employees
  const fetchEmployees = async (token) => {
    setLoadingEmployees(true);
    try {
      const res = await axios.get(`${BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data?.data || [];
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employee list");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch announcements
  const fetchUserAnnouncements = async (userId, token) => {
    setLoadingAnnouncements(true);
    setError(null);
    try {
      const endpoints = [
        `${BASE_URL}/announcements?recipient_id=${userId}`,
        `${BASE_URL}/announcements/user/${userId}`,
      ];

      let response;
      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        } catch (e) {
          if (e.response?.status !== 404) throw e;
        }
      }

      if (!response) throw new Error("No valid announcement endpoint found");

      setUserAnnouncements(response.data.data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(
        err.response?.status === 404
          ? "Announcements feature not available"
          : "Failed to load announcements"
      );
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Toggle select all
  const handleSelectAll = () => {
    const allSelected = !selectAll;
    const newState = {};
    employees.forEach((emp) => {
      newState[emp.user_id] = allSelected;
    });
    setSelected(newState);
    setSelectAll(allSelected);
  };

  // Toggle single employee
  const handleToggle = (userId) => {
    setSelected((prev) => {
      const updated = { ...prev, [userId]: !prev[userId] };
      const allChecked = employees.every((emp) => updated[emp.user_id]);
      setSelectAll(allChecked);
      return updated;
    });
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit announcement with SweetAlert
  const handleSubmit = async () => {
    const selectedEmployeeIds = Object.keys(selected)
      .filter((id) => selected[id])
      .map(Number);

    if (form.title.trim() === "" || form.message.trim() === "") {
      Swal.fire(
        "Validation Error",
        "Please fill in both title and message.",
        "warning"
      );
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      Swal.fire(
        "Validation Error",
        "Please select at least one employee.",
        "warning"
      );
      return;
    }

    const token = localStorage.getItem("token");
    setSubmitLoading(true);

    try {
      const payload = {
        title: form.title,
        content: form.message,
        type: "news",
        published_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        recipients: selectedEmployeeIds,
      };

      const res = await axios.post(`${BASE_URL}/announcements`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAnnouncements((prev) => [
        { ...res.data.data, seen: false }, // make sure 'seen' property exists
        ...prev,
      ]);
      Swal.fire("Success", "Announcement sent successfully!", "success");
      console.log("res", res);
      setForm({ title: "", message: "" });
      setSelected({});
      setSelectAll(false);

      if (currentUserId) {
        fetchUserAnnouncements(currentUserId, token);
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Failed to send announcement. Please try again.",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };
  const fetchAnnouncements = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${BASE_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = response.data.data?.data || []; // 👈 pagination fix
      console.log("annonsments", rawData);
      const sorted = rawData
        .slice()
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .map((a) => ({ ...a, seen: a.seen ?? false }));

      setAnnouncements(sorted);
    } catch (err) {
      console.error("❌ Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDeleteAnnouncement = async (id) => {
    const token = localStorage.getItem("token");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        Swal.fire("Deleted!", "Announcement has been deleted.", "success");

        // Refresh the list
        if (currentUserId) {
          fetchUserAnnouncements(currentUserId, token);
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to delete announcement.",
          "error"
        );
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm min-vh-100 mt-5">
      <div className="mb-3 d-flex align-items-center gap-2">
        <FaTelegramPlane style={{ color: "black", fontSize: "20px" }} />
        <span className="fw-bold fs-5">Announcement</span>
      </div>

      <Row className="g-4">
        {/* Form Section */}
        <Col md={6}>
          <Card className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">📢 Create Announcement</h6>
              {/* <FaEdit title="Edit (Coming Soon)" style={{ cursor: "pointer" }} /> */}
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter title"
                disabled={submitLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Enter message"
                disabled={submitLoading}
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Card>

          {/* Received Announcements Section */}
          {/* Received Announcements Section */}
          {/* Received Announcements Section */}
          <Card className="p-4 mt-4">
            <h6 className="fw-bold mb-3">📨 Received Announcements</h6>

            {loadingAnnouncements ? (
              <div className="text-center py-3">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="warning" className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                {error}
              </Alert>
            ) : announcements.length > 0 ? (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="mb-3 p-3 border rounded d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <h6>{announcement.title}</h6>
                      <p>{announcement.content}</p>

                      {/* Sender */}
                      <small className="d-block text-muted mb-1">
                        <strong>From:</strong> {announcement.user?.first_name}{" "}
                        {announcement.user?.last_name}
                      </small>

                      {/* Recipients */}
                      {announcement.recipients?.length > 0 && (
                        <small className="d-block text-muted mb-1">
                          <strong>To:</strong>{" "}
                          {announcement.recipients
                            .map((r) => `${r.first_name} ${r.last_name}`)
                            .join(", ")}
                        </small>
                      )}

                      {/* Published date */}
                      <small className="text-muted">
                        {new Date(announcement.published_at).toLocaleString()}
                      </small>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No announcements received yet.</p>
            )}
          </Card>
        </Col>

        {/* Employees Section */}
        <Col md={6}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold">Employees</h6>
            <Form.Check
              type="checkbox"
              label="Select All"
              checked={selectAll}
              onChange={handleSelectAll}
              disabled={loadingEmployees}
              className="custom-checkbox"
            />
          </div>

          {loadingEmployees ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">
              Failed to load employees. Please refresh the page.
            </Alert>
          ) : (
            <>
              <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {employees.map((emp) => (
                  <Card
                    key={emp.user_id}
                    className="d-flex flex-row align-items-center mb-2 p-2 shadow-sm"
                  >
                    <img
                      src={`${BASE_URL}/employees/${emp.id}/profile-image`}
                      className="me-3 border rounded-circle"
                      width={45}
                      height={45}
                      alt="Employee"
                      onError={(e) => (e.target.src = profileImg)}
                    />

                    <div className="ms-3 flex-grow-1">
                      <div className="fw-semibold">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <small className="text-muted">
                        {emp.designation_name}
                      </small>
                    </div>
                    <Form.Check
                      type="checkbox"
                      checked={selected[emp.user_id] || false}
                      onChange={() => handleToggle(emp.user_id)}
                      disabled={submitLoading}
                    />
                  </Card>
                ))}
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Button
                  className="px-4 py-2 rounded-pill"
                  variant="success"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Announcement;
