import React, { useState, useEffect } from "react";
import { useUser } from "../Contexts/UserContext";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../Api";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";

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
  { key: "other", label: "Other Documents" },
];

const Documents = () => {
  const { role } = useUser();
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const { employeeData } = useEmployeeData();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const userId =
    role === "admin" ? employeeData?.user_id : localStorage.getItem("userId");

  // ✅ Fetch for both employee & admin
  useEffect(() => {
    if (!userId) return;
    const token =
      role === "admin"
        ? localStorage.getItem("token")
        : localStorage.getItem("authToken");

    axios
      .get(`${BASE_URL}/employee-documents/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDocuments(res.data.data || []))
      .catch((err) => console.error(err));
  }, [role, userId]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userId || !selectedType || !file) {
      Swal.fire("Error", "Please select a document type and file", "error");
      return;
    }

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("document_type", selectedType);
    formData.append(
      "document_name",
      DOCUMENT_FIELDS.find((f) => f.key === selectedType)?.label || selectedType
    );
    formData.append("document_file", file);

    try {
      const res = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire("Success", res.data.message, "success");

      // ✅ Refresh list
      setDocuments((prev) => [...prev, res.data.data]);
      setShowForm(false);
      setFile(null);
      setSelectedType("");
      setUploadedFiles((prev) => [...prev, file]);
    } catch (error) {
      Swal.fire("Error", "Upload failed", "error");
      console.error(error);
    }
  };
  const handleDownloadFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm">
      {/* List of Documents */}
      <h5 className="mb-3">Uploaded Documents</h5>
      {documents.length > 0 ? (
        <ul className="list-group">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {doc.document_name}
              <div>
                <a
                  href={`${BASE_URL}/employee-documents/${doc.id}/view`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  View
                </a>
                {/* <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => handleDownloadFile(file)}
                >
                  Download
                </button> */}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents uploaded yet.</p>
      )}

      {/* Employee Upload Button & Form */}

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
    </div>
  );
};

export default Documents;
