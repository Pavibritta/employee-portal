import React, { useEffect, useState } from "react";
import "./Adminprofile.css";
import { FaUser, FaKey } from "react-icons/fa";
import { LuCamera } from "react-icons/lu";
import defaultAvatar from "../images/profileimg1.jpg";
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
  const submitNewAdmin = () => {
    if (
      !newAdmin.first_name ||
      !newAdmin.last_name ||
      !newAdmin.email ||
      !newAdmin.password ||
      !newAdmin.role
    ) {
      Swal.fire({
        title: "Warning!",
        text: "Please fill all required fields.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You are about to add a new user",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newAdmin,
            role: newAdmin.role.toLowerCase(),
          }), // normalize role
        })
          .then((res) => res.json())
          .then(() => {
            Swal.fire({
              title: "Added!",
              text: "New user added successfully!",
              icon: "success",
              confirmButtonText: "OK",
            });
            setNewAdmin({
              first_name: "",
              last_name: "",
              phone: "",
              role: "",
              email: "",
              password: "",
            });
            setShowAddAdminForm(false);
          })
          .catch((err) => {
            console.error("Failed to add user:", err);
            Swal.fire({
              title: "Error!",
              text: "Error adding new user",
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      }
    });
  };

  // 🔹 Upload profile image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Preview first
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await fetch(
        `${BASE_URL}/employees/${userId.id}/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // 🔑 add token
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

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
            onError={(e) => (e.target.src = dpimg)} // 👈 fallback if no profile image
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

      {/* 🔹 Add User Form */}
      {/* <div className={`modal fade ${showAddAdminForm ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New User</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddAdminForm(false)}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                className="form-control mb-2"
                value={newAdmin.first_name}
                onChange={e => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                className="form-control mb-2"
                value={newAdmin.last_name}
                onChange={e => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="form-control mb-2"
                value={newAdmin.phone}
                onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="form-control mb-2"
                value={newAdmin.email}
                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
              <select
                name="role"
                className="form-control mb-2 role-select"
                value={newAdmin.role}
                onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="form-control mb-2"
                value={newAdmin.password}
                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddAdminForm(false)}>Close</button>
              <button className="btn btn-success" onClick={submitNewAdmin}>Add User</button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Adminprofile;
