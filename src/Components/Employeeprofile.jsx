import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaUser, FaKey, FaTimes } from "react-icons/fa";
import { LuCamera } from "react-icons/lu";
import defaultAvatar from "../images/dpimg.jpg";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BASE_URL } from "./Api";

const Employeeprofile = ({ show, handleClose }) => {
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("userId"));
  const id = localStorage.getItem("Id");

  // 🔹 Fetch profile
  useEffect(() => {
    if (!show) return; // fetch only when modal is opened
    fetch(`${BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched user:", data);
        const user = data.data || data;
        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || user.employee?.last_name || "",
          phone: user.phone || user.employee?.phone || "",
          email: user.email || "",
        });
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, [show]);

  // 🔹 Change password
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

    fetch(`${BASE_URL}/users/${userId}`, {
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

  // 🔹 Upload avatar (just local preview)
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
        `${BASE_URL}/employees/${id}/upload-profile-image`,
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
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser className="me-2" /> Employee Profile
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="profile-card mx-auto p-4">
          <div className="text-center position-relative">
            <img
              src={`${BASE_URL}/employees/${id}/profile-image`}
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
                  className="form-control"
                  value={formData.first_name}
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  value={formData.last_name}
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  className="form-control"
                  value={formData.phone}
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  readOnly
                />
              </div>
            </div>

            <div className="text-center mt-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                Change Password <FaKey className="ms-2" />
              </button>
              <button className="btn btn-secondary ms-3" onClick={handleClose}>
                Cancel
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
      </Modal.Body>
    </Modal>
  );
};

export default Employeeprofile;
