import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { BASE_URL } from "./Api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Holiday.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null); // ✅ track edit
  const [holidayData, setHolidayData] = useState({
    name: "",
    date: "",
    type: "fixed",
    is_active: 1,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  const token = localStorage.getItem("token");

  // Fetch holiday list
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Add or Update holiday
  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        // ✅ Update holiday (PUT)
        const res = await axios.put(
          `${BASE_URL}/holidays/${editingHoliday.id}`,
          holidayData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 200) {
          toast.success("✅ Holiday updated successfully!");
        }
      } else {
        // ✅ Add new holiday (POST)
        const res = await axios.post(`${BASE_URL}/holidays`, holidayData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 201 || res.status === 200) {
          toast.success("🎉 Holiday added successfully!");
        }
      }

      setShowModal(false);
      setEditingHoliday(null);
      setHolidayData({
        name: "",
        date: "",
        type: "fixed",
        is_active: 1,
        description: "",
      });
      fetchHolidays();
    } catch (err) {
      console.error("Error saving holiday:", err);
      toast.error("❗ Error saving holiday.");
    }
  };

  // Edit holiday (open modal pre-filled)
  const handleEditClick = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      is_active: holiday.is_active,
      description: holiday.description,
    });
    setShowModal(true);
  };

  // Delete holiday
  const handleDeleteClick = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This holiday will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/holidays/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          toast.success("🗑️ Holiday deleted successfully!");
          fetchHolidays();

          Swal.fire("Deleted!", "The holiday has been removed.", "success");
        } catch (err) {
          console.error("Failed to delete holiday:", err);
          Swal.fire("Error!", "Something went wrong while deleting.", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Holiday List</h2>

      <Button
        variant="primary"
        onClick={() => {
          setEditingHoliday(null);
          setHolidayData({
            name: "",
            date: "",
            type: "fixed",
            is_active: 1,
            description: "",
          });
          setShowModal(true);
        }}
      >
        + Add Holiday
      </Button>

      {loading ? (
        <p className="mt-3">Loading holidays...</p>
      ) : (
        <div style={{ maxHeight: "400px", overflow: "auto" }}>
          <table className="table table-striped table-bordered mt-3">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                {/* <th>Description</th> */}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {holidays.length > 0 ? (
                holidays.map((h, index) => (
                  <tr key={h.id || index}>
                    <td>{index + 1}</td>
                    <td>{h.name}</td>
                    <td>{h.date}</td>
                    <td>{h.type}</td>
                    <td>{h.is_active ? "Active" : "Inactive"}</td>
                    {/* <td
                      style={{
                        maxWidth: "200px",
                        maxHeight: "60px",
                        overflowY: "auto",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {h.description}
                    </td> */}

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setSelectedDescription(h.description);
                            setShowDescriptionModal(true);
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditClick(h)}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaEdit />
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(h.id)}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No holidays found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="modal-responsive"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHoliday ? "Update Holiday" : "Add New Holiday"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveHoliday}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Holiday Name</Form.Label>
              <Form.Control
                type="text"
                value={holidayData.name}
                onChange={(e) =>
                  setHolidayData({ ...holidayData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={holidayData.date}
                onChange={(e) =>
                  setHolidayData({ ...holidayData, date: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={holidayData.type}
                onChange={(e) =>
                  setHolidayData({ ...holidayData, type: e.target.value })
                }
              >
                <option value="fixed">Fixed</option>
                <option value="optional">Optional</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={holidayData.is_active}
                onChange={(e) =>
                  setHolidayData({
                    ...holidayData,
                    is_active: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={holidayData.description}
                onChange={(e) =>
                  setHolidayData({
                    ...holidayData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingHoliday ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer />

      <Modal
        show={showDescriptionModal}
        onHide={() => setShowDescriptionModal(false)}
        centered
        dialogClassName="modal-responsive"
      >
        <Modal.Header closeButton>
          <Modal.Title>Holiday Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedDescription}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDescriptionModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Holiday;
