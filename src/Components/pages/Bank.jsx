import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useUser } from "../Contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Api";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";

const Bank = () => {
  const { user } = useUser(); // Role from context
  const [bankDetails, setBankDetails] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mode, selectedEmployeeId, employeeData } = useEmployeeData();

  const token = localStorage.getItem("authToken");
  const admintoken = localStorage.getItem("token");
  const navigate = useNavigate();
  console.log(employeeData);
  // ================== Fetch Employee Bank Details (Admin Edit Mode) ==================

  // ================== Fetch All Employees (Admin Only) ==================
  useEffect(() => {
    const fetchEmployees = async () => {
      if (user.role === "admin" && token) {
        try {
          const res = await axios.get(`${BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${admintoken}` },
          });
          console.log("Full response:", res);
          console.log("Response data:", res.data.data);
          setEmployeeList(res.data.data.data || []);
        } catch (error) {
          console.error("Error fetching employees:", error);
          Swal.fire("Error", "Failed to fetch employee list", "error");
        }
      }
    };

    fetchEmployees();
  }, [user, token]);

  // ================== Employee Selection (Admin Mode) ==================
  const handleEmployeeSelect = async (e) => {
    console.log(employeeList);
    const userId = e.target.value;
    if (!userId) {
      setBankDetails({});
      return;
    }
    console.log(bankDetails);
    setBankDetails((prev) => ({ ...prev, user_id: userId }));

    // try {
    //   setIsLoading(true);
    //   const res = await axios.get(`${BASE_URL}/bank-details/${userId}`, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   setBankDetails(res.data?.data || { user_id: userId });
    // } catch (error) {
    //   console.error("Error fetching selected employee bank details:", error);
    //   if (error.response?.status === 404) {
    //     setBankDetails({ user_id: userId });
    //   } else {
    //     Swal.fire("Error", "Failed to fetch employee bank details", "error");
    //   }
    // } finally {
    //   setIsLoading(false);
    // }
  };
  useEffect(() => {
    const fetchBankDetails = async () => {
      const userId = localStorage.getItem("userId");
      setIsLoading(true);
      try {
        let url = "";

        if (user.role === "admin" && mode === "edit" && employeeData?.user_id) {
          // Admin fetching details of selected employee
          url = `${BASE_URL}/bank-details/${employeeData.user_id}`;
        } else if (user.role === "employee" && userId) {
          // Employee fetching their own bank details
          url = `${BASE_URL}/bank-details/${userId}`;
        } else {
          setIsLoading(false);
          return;
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user.role === "admin" ? admintoken : token}`,
          },
        });

        console.log("Bank details response:", res);
        setBankDetails(res.data?.data || {});
      } catch (error) {
        console.error("Error fetching bank details:", error);
        if (error.response?.status === 404) {
          // No bank details yet → still keep id for consistency
          setBankDetails(
            user.role === "admin"
              ? { user_id: employeeData?.user_id }
              : { user_id: userId?.id }
          );
        } else {
          Swal.fire("Error", "Failed to fetch bank details", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankDetails();
  }, [user, mode, employeeData, admintoken, token]);

  // ================== Handlers ==================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBankDetails((prev) => ({
          ...prev,
          passbook_image: file, // ✅ store actual file
          passbook_image_url: reader.result, // ✅ for preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "user_id",
      "account_number",
      "ifsc_code",
      "bank_name",
      "branch_name",
    ];

    for (const field of requiredFields) {
      if (!bankDetails?.[field]) {
        Swal.fire("Error", `Please fill in ${field}`, "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const formData = new FormData();

    // If editing, include the id so backend knows it's an update
    if (user.role === "admin" && mode === "edit" && bankDetails?.id) {
      formData.append("id", bankDetails.id);
    }

    formData.append("user_id", bankDetails.user_id);
    formData.append("account_number", bankDetails.account_number);
    formData.append("ifsc_code", bankDetails.ifsc_code);
    formData.append("bank_name", bankDetails.bank_name);
    formData.append("branch_name", bankDetails.branch_name);
    formData.append(
      "account_holder_name",
      bankDetails.account_holder_name || ""
    );
    formData.append("pan_number", bankDetails.pan_number || "");

    if (bankDetails.passbook_image) {
      formData.append("passbook_image", bankDetails.passbook_image);
    }

    try {
      const res = await axios.post(`${BASE_URL}/bank-details`, formData, {
        headers: {
          Authorization: `Bearer ${user.role === "admin" ? admintoken : token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Saved bank details:", res.data.data);
      setBankDetails(res.data.data);

      Swal.fire("Success", "Bank details saved successfully!", "success");
      navigate("/layout/employemanagement", { replace: true });
    } catch (error) {
      console.error("Error saving bank details:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to save bank details",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log(bankDetails);
  // ================== UI ==================
  if (isLoading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  // Employee View (Read-Only)
  if (user.role === "employee") {
    if (!bankDetails) {
      return (
        <div className="p-4">
          <h4>No bank details found</h4>
        </div>
      );
    }
    return (
      <div className="container bg-white p-4 mt-2 rounded shadow-sm">
        <h4 className="mb-3">My Bank Details</h4>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Account Holder:</strong> {bankDetails.account_holder_name}
          </li>
          <li className="list-group-item">
            <strong>Bank Name:</strong> {bankDetails.bank_name}
          </li>
          <li className="list-group-item">
            <strong>Account Number:</strong> {bankDetails.account_number}
          </li>
          <li className="list-group-item">
            <strong>IFSC Code:</strong> {bankDetails.ifsc_code}
          </li>
          <li className="list-group-item">
            <strong>Branch:</strong> {bankDetails.branch_name}
          </li>
          <li className="list-group-item">
            <strong>PAN:</strong> {bankDetails.pan_number}
          </li>
          {bankDetails.passbook_image_path && (
            <li className="list-group-item">
              <a
                href={`${BASE_URL}/employees/${bankDetails.id}/passbook-image`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Passbook Image
              </a>
            </li>
          )}
        </ul>
      </div>
    );
  }

  // Admin View (Form)
  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm">
      <h4 className="mb-3">Add / Update Bank Details</h4>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Employee Select */}
          {/* Account Holder */}
          <div className="col-md-6">
            <label className="form-label">Account Holder Name</label>
            <input
              type="text"
              className="form-control"
              name="account_holder_name"
              value={bankDetails?.account_holder_name || ""}
              onChange={handleChange}
            />
          </div>

          {/* PAN Number */}
          <div className="col-md-6">
            <label className="form-label">PAN Number</label>
            <input
              type="text"
              className="form-control"
              name="pan_number"
              value={bankDetails?.pan_number || ""}
              onChange={handleChange}
            />
          </div>

          {/* Account Number */}
          <div className="col-md-6">
            <label className="form-label">Account Number</label>
            <input
              type="text"
              className="form-control"
              name="account_number"
              value={bankDetails?.account_number || ""}
              onChange={handleChange}
            />
          </div>

          {/* IFSC */}
          <div className="col-md-6">
            <label className="form-label">IFSC Code</label>
            <input
              type="text"
              className="form-control"
              name="ifsc_code"
              value={bankDetails?.ifsc_code || ""}
              onChange={handleChange}
            />
          </div>

          {/* Bank Name */}
          <div className="col-md-6">
            <label className="form-label">Bank Name</label>
            <input
              type="text"
              className="form-control"
              name="bank_name"
              value={bankDetails?.bank_name || ""}
              onChange={handleChange}
            />
          </div>

          {/* Branch Name */}
          <div className="col-md-6">
            <label className="form-label">Branch Name</label>
            <input
              type="text"
              className="form-control"
              name="branch_name"
              value={bankDetails?.branch_name || ""}
              onChange={handleChange}
            />
          </div>

          {/* Upload */}
          <div className="col-md-6">
            <label className="form-label">Upload Passbook Image</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            {bankDetails?.passbook_image_path && (
              <div className="mt-2">
                <a
                  href={`${BASE_URL}/employees/${bankDetails.id}/passbook-image`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview Uploaded File
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary px-5 py-2 rounded-pill"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Bank;
