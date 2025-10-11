import React, { useState, useEffect } from "react";
import { useUser } from "../Contexts/UserContext";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../Api";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";
import { Modal, Button, Form } from "react-bootstrap";

const API_URL = `${BASE_URL}/employee-documents`;

const DOCUMENT_FIELDS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "pancard", label: "PAN Card" },
  { key: "voter_id", label: "Voter ID" },
  { key: "driving_license", label: "Driving License" },
  { key: "passport", label: "Passport" },
  { key: "photo", label: "Passport Size Photo" },
  { key: "offer_letter", label: "Offer Letter" },
  { key: "experience_certificate", label: "Experience Certificate" },
  { key: "relieving_letter", label: "Relieving Letter" },
  { key: "salary_slip", label: "Salary Slip" },
  { key: "education_certificate", label: "Education Certificate" },
  { key: "other", label: "Other Documents" }, // 👈 Special case
];

const Documents = () => {
  const { user } = useUser();
  const { employeeData } = useEmployeeData();

  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [customType, setCustomType] = useState(""); // 👈 new
  const [file, setFile] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const userId =
    user.role === "admin" ? employeeData?.user_id : localStorage.getItem("userId");

  // ✅ Fetch documents
  useEffect(() => {
    if (!userId) return;
    const token =
      user.role === "admin"
        ? localStorage.getItem("token")
        : localStorage.getItem("authToken");

    axios
      .get(`${BASE_URL}/employee-documents/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("doc", res.data); // ✅ log here
        setDocuments(res.data.data || []);
      })
      .catch((err) => console.error("❌ Error fetching documents:", err));
  }, [user, userId]);

  // ✅ Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userId || !selectedType || !file) {
      Swal.fire("Error", "Please select a document type and file", "error");
      return;
    }

    // If "other" is chosen, customType is required
    if (selectedType === "other" && !customType.trim()) {
      Swal.fire("Error", "Please enter a custom document name", "error");
      return;
    }

    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    formData.append("user_id", userId);
    formData.append("document_type", selectedType);

    // If "other" → use custom document field
    if (selectedType === "other") {
      formData.append("custom_document_type", customType.trim());
    } else {
      formData.append(
        "document_name",
        DOCUMENT_FIELDS.find((f) => f.key === selectedType)?.label ||
          selectedType
      );
    }

    formData.append("document_file", file);

    try {
      const res = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("Success", res.data.message, "success");
      setDocuments((prev) => [...prev, res.data.data]);

      // Reset form
      setShowForm(false);
      setSelectedType("");
      setCustomType(""); // reset custom field
      setFile(null);
    } catch (error) {
      Swal.fire("Error", "Upload failed", "error");
      console.error(error);
    }
  };

  // ✅ Delete document
  const handleDelete = async (docId) => {
    const token =
      user.role === "admin"
        ? localStorage.getItem("token")
        : localStorage.getItem("authToken");

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This document will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${docId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Document has been deleted.", "success");
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } catch (error) {
        Swal.fire("Error", "Failed to delete document.", "error");
      }
    }
  };

  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm">
      <h5 className="mb-3">Uploaded Documents</h5>
      {documents.length > 0 ? (
        <ul className="list-group">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {doc.document_name || doc.custom_document_type}
              <div>
                {doc.view_url ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2" // ✅ add right margin
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowPdf(true);
                    }}
                  >
                    View PDF
                  </Button>
                ) : (
                  <span className="text-muted me-2">No PDF</span> // ✅ space before delete button
                )}

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents uploaded yet.</p>
      )}

      <div className="text-center mt-4">
        <button
          className="btn btn-primary px-4 py-2 rounded-pill"
          onClick={() => setShowForm(true)}
        >
          Add Document
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="mt-4">
          {/* Select type */}
          <div className="mb-3">
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">-- Select Document --</option>
              {DOCUMENT_FIELDS.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show custom input if "other" is chosen */}
          {selectedType === "other" && (
            <div className="mb-3">
              <label className="form-label">Custom Document Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter custom document name"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </div>
          )}

          {/* File input */}
          <div className="mb-3">
            <label className="form-label">Upload File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn btn-success px-5 py-2 rounded-pill me-2"
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary px-5 py-2 rounded-pill"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <Modal
        show={showPdf}
        onHide={() => {
          setShowPdf(false);
          setSelectedDoc(null); // reset on close
        }}
        size="xl"
        centered
        dialogClassName="mx-2 mx-sm-auto"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDoc?.document_name ||
              selectedDoc?.custom_document_type ||
              "Policy Document"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "80vh" }}>
          {selectedDoc?.view_url ? (
            <iframe
              src={`${BASE_URL}/employee-documents/${selectedDoc.id}/view`} // ✅ full URL
              title="Document PDF"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            ></iframe>
          ) : (
            <p className="text-center text-muted">No PDF available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPdf(false);
              setSelectedDoc(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Documents;
