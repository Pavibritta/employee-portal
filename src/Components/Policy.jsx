import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./Api";
import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";

const Policy = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false); // ✅ for modal

  const [showPdf, setShowPdf] = useState(false);

  // ✅ Fetch policies
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/policies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPolicies(res.data.data.data);
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !pdfFile) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("policy_name", name);
    formData.append("description", description);
    formData.append("pdf_file", pdfFile);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/policies`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage("Policy added successfully!");
      setName("");
      setDescription("");
      setPdfFile(null);

      fetchPolicies();
      setShowModal(false); // ✅ close modal after submit
    } catch (err) {
      console.error("Error Response:", err.response?.data || err.message);
      setMessage("Error posting policy.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This policy will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await axios.delete(`${BASE_URL}/policies/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          fetchPolicies();
          Swal.fire("Deleted!", "The policy has been deleted.", "success");
        } catch (err) {
          console.error("Delete Error:", err.response?.data || err.message);
          Swal.fire("Error!", "Failed to delete the policy.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="container mt-5">
      {/* Button to Open Modal */}
      <div className="mb-4">
        <button
          className="btn btn-primary px-4 py-2 rounded-pill"
          onClick={() => setShowModal(true)}
        >
          + Add Policy
        </button>
      </div>

      {/* Responsive Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        scrollable
        dialogClassName="mx-3 mx-sm-auto" // ✅ margin on mobile
      >
        <Modal.Header closeButton className="bg-white text-white">
          <Modal.Title className="text-center text-md-start m-auto m-md-0">
            Add New Policy
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmit} className="holiday-form">
          <Modal.Body>
            {message && (
              <p className="text-center text-success fw-semibold">{message}</p>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Policy Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter policy name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">PDF File</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                required
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Posting..." : "Save Policy"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Policies List */}
      <div className="mt-5">
        <h3 className="mb-4 fw-bold">All Policies</h3>

        {loading ? (
          <p className="text-center">Loading policies...</p>
        ) : policies.length === 0 ? (
          <p className="text-center text-muted">No policies found.</p>
        ) : (
          <div className="row">
            {policies.map((policy) => (
              <div key={policy.id} className="col-md-6 col-lg-4 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{policy.policy_name}</h5>
                    {/* <h6 className="card-subtitle mb-2 text-muted">
                      {policy.title}
                    </h6> */}
                    <p className="card-text flex-grow-1">
                      {policy.description}
                    </p>
                    <p className="small text-secondary mb-2">
                      Created by:{" "}
                      <strong>
                        {policy.creator?.first_name} {policy.creator?.last_name}
                      </strong>
                    </p>

                    <div className="d-flex justify-content-between mt-auto">
                      <div className="d-flex justify-content-between mt-auto">
                        {policy.pdf_path ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowPdf(true)}
                          >
                            View PDF
                          </Button>
                        ) : (
                          <span className="text-muted">No PDF</span>
                        )}
                      </div>
                      <Modal
                        show={showPdf}
                        onHide={() => setShowPdf(false)}
                        size="xl"
                        centered
                        dialogClassName="mx-2 mx-sm-auto" // better mobile spacing
                      >
                        <Modal.Header closeButton>
                          <Modal.Title>Policy Document</Modal.Title>
                        </Modal.Header>

                        <Modal.Body style={{ height: "80vh" }}>
                          <iframe
                            src={`${BASE_URL}/policies/${policy.id}/view`}
                            title="Policy PDF"
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                          ></iframe>
                        </Modal.Body>

                        <Modal.Footer>
                          <Button
                            variant="secondary"
                            onClick={() => setShowPdf(false)}
                          >
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(policy.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Policy;
