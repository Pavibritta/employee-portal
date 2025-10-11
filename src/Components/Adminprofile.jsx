import React, { useEffect, useState } from "react";
import "./Adminprofile.css";
import { FaUser, FaKey } from "react-icons/fa";
import { LuCamera } from "react-icons/lu";
import defaultAvatar from "../images/dpimg.jpg";
import Swal from "sweetalert2";
import { BASE_URL } from "./Api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Adminprofile = () => {
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const [isEditable, setIsEditable] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/admins`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Assuming API returns an array of admins in data
        setAdmins(data.data || data);
      })
      .catch((err) => {
        console.error("Failed to fetch admins:", err);
        Swal.fire("Error!", "Failed to load admin list", "error");
      });
  }, []);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    email: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [newAdmin, setNewAdmin] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    email: "",
    password: "",
  });

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user"));

  //  console.log(userId)
  // 🔸 Fetch profile on load
  useEffect(() => {
    fetch(`${BASE_URL}/users/${userId.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.data || data; // handle nested API response
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          role: (user.role || "").toLowerCase(), // normalize role
          email: user.email || "",
        });
        // console.log(data)
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  // 🔸 Save profile
  const handleSave = () => {
    fetch(`${BASE_URL}/users/${userId.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "Profile updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        Swal.fire({
          title: "Error!",
          text: "Error saving profile",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  // 🔸 Password change
  const submitPasswordChange = () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      return Swal.fire("Error!", "All password fields are required!", "error");
    }

    if (passwordData.new_password.length < 8) {
      return Swal.fire(
        "Error!",
        "Password must be at least 8 characters!",
        "error"
      );
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return Swal.fire("Error!", "New passwords do not match!", "error");
    }

    fetch(`${BASE_URL}/users/${userId.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to change password");
        return data;
      })
      .then(() => {
        Swal.fire("Success!", "Password changed successfully!", "success");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setShowPasswordForm(false);
      })
      .catch((err) => {
        Swal.fire("Error!", err.message || "Error changing password", "error");
      });
  };

  // 🔸 Add Admin

  // 🔹 Upload profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Preview (works fine already)
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      console.log("Uploading file:", file.name, file.type);

      const res = await fetch(
        `${BASE_URL}/employees/${userId.id}/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // don't set Content-Type!
          },
          body: formData,
        }
      );

      const text = await res.text(); // ✅ capture raw response
      console.log("Raw response:", res.status, text);

      let data;
      try {
        data = JSON.parse(text); // if backend returns JSON
      } catch {
        data = { message: text }; // fallback for HTML/500 error page
      }

      if (!res.ok) throw new Error(data.message || "Failed to upload image");

      Swal.fire("Success!", "Profile image updated!", "success");
    } catch (error) {
      console.error("Image upload error:", error);
      Swal.fire("Error!", error.message || "Upload failed", "error");
    }
  };

  return (
    <div className="admin-profile-container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 px-4">
        <h5 className="d-flex align-items-center">
          <FaUser className="me-2" /> Admin Profile
        </h5>
        {/* <button className="add-admin-btn" onClick={() => setShowAddAdminForm(!showAddAdminForm)}>+ Add User</button> */}
      </div>

      {/* 🔹 Profile card */}
      <div className="profile-card mx-auto p-4">
        <div className="text-center position-relative">
          <img
            src={`${BASE_URL}/employees/${userId.id}/profile-image`}
            alt="profile"
            className="rounded-circle mb-3"
            width="80"
            height="80"
            onError={(e) => (e.target.src = profileImage)} // 👈 fallback if no profile image
          />

          <label htmlFor="upload-photo" className="upload-icon">
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

        <div className="form-fields mt-4">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                name="first_name"
                className="form-control"
                placeholder="First Name"
                value={formData.first_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Last Name"
                value={formData.last_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="number"
                name="phone"
                className="form-control"
                placeholder="Phone Number"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input type="hidden" name="role" value="admin" />
            </div>
          </div>

          <div className="text-center mt-3">
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button
              className="change-password-btn ms-3"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Change Password <FaKey className="ms-2" />
            </button>
          </div>

          {showPasswordForm && (
            <div className="password-form mt-4">
              {/* Current Password */}
              <div className="position-relative mb-2">
                <div className="password-input-wrapper mb-2">
                  <input
                    type={passwordVisibility.current ? "text" : "password"}
                    name="current_password"
                    placeholder="Current Password"
                    className="form-control"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                  />
                  <span
                    className="toggle-password-icon"
                    onClick={() =>
                      setPasswordVisibility({
                        ...passwordVisibility,
                        current: !passwordVisibility.current,
                      })
                    }
                  >
                    {passwordVisibility.current ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>

              {/* New Password */}
              {/* New Password */}
              <div className="position-relative mb-2">
                <div className="password-input-wrapper mb-2 position-relative">
                  <input
                    type={passwordVisibility.new ? "text" : "password"}
                    name="new_password"
                    placeholder="New Password"
                    className="form-control"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                  />
                  <span
                    className="toggle-password-icon"
                    onClick={() =>
                      setPasswordVisibility({
                        ...passwordVisibility,
                        new: !passwordVisibility.new,
                      })
                    }
                  >
                    {passwordVisibility.new ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="position-relative mb-2">
                <div className="password-input-wrapper mb-2 position-relative">
                  <input
                    type={passwordVisibility.confirm ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Confirm New Password"
                    className="form-control"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                  <span
                    className="toggle-password-icon"
                    onClick={() =>
                      setPasswordVisibility({
                        ...passwordVisibility,
                        confirm: !passwordVisibility.confirm,
                      })
                    }
                  >
                    {passwordVisibility.confirm ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-success mt-2"
                onClick={submitPasswordChange}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="admins-list mt-3 mx-auto p-2">
        <h6 className="mb-4 fw-bold">Admin Users</h6>
        <div className="table-responsive-sm">
          <table className="table table-bordered table-striped table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>S.NO</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id || index}>
                    <td>{index + 1}</td>
                    <td>{admin.first_name}</td>
                    <td>{admin.last_name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.phone}</td>
                    <td>{admin.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Adminprofile;
