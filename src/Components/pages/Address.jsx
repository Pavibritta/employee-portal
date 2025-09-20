import React, { useEffect, useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { useUser } from "../Contexts/UserContext";
import { useEmployeeData } from "../Contexts/EmployeeDataContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../Api";
import axios from "axios";

const Address = () => {
  const { role } = useUser();
  const { employeeData } = useEmployeeData();

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [address, setAddress] = useState({
    area: "",
    city: "",
    pincode: "",
    district: "",
    state: "",
    country: "",
    landmark: "",
    address_type: "present",
  });

  // ✅ Fetch addresses
  const fetchAddresses = async () => {
    try {
      const targetUserId = role === "employee" ? userId : employeeData?.user_id;

      const response = await axios.get(
        `${BASE_URL}/employee-addresses/user/${targetUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses(response.data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to load addresses", "error");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ✅ Handle form change
  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // ✅ Submit new or updated address
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode && editId) {
        // Update existing address
        await axios.put(`${BASE_URL}/employee-addresses/${editId}`, address, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Updated", "Address updated successfully!", "success");
      } else {
        // Add new address
        const payload = {
          user_id: role === "employee" ? userId : employeeData?.user_id,
          ...address,
        };

        await axios.post(`${BASE_URL}/employee-addresses`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Success", "Address saved successfully!", "success");
      }

      // Reset form
      setShowForm(false);
      setEditMode(false);
      setEditId(null);
      setAddress({
        area: "",
        city: "",
        pincode: "",
        district: "",
        state: "",
        country: "",
        landmark: "",
        address_type: "present",
      });

      fetchAddresses(); // refresh list
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);

      if (error.response?.status === 422) {
        // Laravel-style validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join("\n");
        Swal.fire("Validation Error", errorMessages, "error");
      } else {
        // Show API message or fallback to full data/message
        const apiError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          error.message;

        Swal.fire("Error", apiError, "error");
      }
    }
  };

  // ✅ Handle edit
  const handleEdit = (addr) => {
    setAddress(addr);
    setEditId(addr.id);
    setEditMode(true);
    setShowForm(true);
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the address.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/employee-addresses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted", "Address deleted successfully!", "success");
        fetchAddresses();
      } catch (error) {
        console.error("Delete Error:", error);
        Swal.fire("Error", "Failed to delete address", "error");
      }
    }
  };
  // inside Address component

  // ✅ Auto-fetch address when pincode entered
  useEffect(() => {
    if (address.pincode && address.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${address.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];

            setAddress((prev) => ({
              ...prev,
              city: po.Name || prev.city,
              district: po.District || prev.district,
              state: po.State || prev.state,
              country: po.Country || prev.country,
            }));
          } else {
            Swal.fire(
              "Invalid Pincode",
              "No details found for this pincode",
              "warning"
            );
          }
        })
        .catch((err) => {
          console.error("Pincode API Error:", err);
        });
    }
  }, [address.pincode]);

  return (
    <div className="container-fluid bg-white p-4 mt-2 rounded shadow-sm ">
      {/* Add Address Button (aligned right) */}

      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="success"
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setEditId(null);
          }}
        >
          + Add Address
        </Button>
      </div>

      {/* Address Cards */}
      {!showForm && addresses.length > 0 && (
        <div className="row">
          {addresses.map((addr) => (
            <div className="col-md-6 mb-3" key={addr.id}>
              <Card className="shadow-sm border-0 rounded-3">
                {/* Header */}
                <Card.Header className="bg-primary text-white fw-bold">
                  {addr.address_type.toUpperCase()} Address
                </Card.Header>

                {/* Body */}
                <Card.Body className="p-3">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>Address:</strong> {addr.area}
                    </li>
                    <li className="list-group-item">
                      <strong>City:</strong> {addr.city}
                    </li>
                    <li className="list-group-item">
                      <strong>Pincode:</strong> {addr.pincode}
                    </li>
                    <li className="list-group-item">
                      <strong>District:</strong> {addr.district}
                    </li>
                    <li className="list-group-item">
                      <strong>State:</strong> {addr.state}
                    </li>
                    <li className="list-group-item">
                      <strong>Country:</strong> {addr.country}
                    </li>
                    <li className="list-group-item">
                      <strong>Landmark:</strong> {addr.landmark}
                    </li>
                  </ul>
                </Card.Body>

                {/* Footer with buttons */}
                <Card.Footer className="d-flex justify-content-end gap-2 bg-light">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => handleEdit(addr)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                  >
                    🗑️ Delete
                  </Button>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* If no addresses */}
      {!showForm && addresses.length === 0 && (
        <div className="text-center text-muted mt-5">
          <p>No address details found.</p>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="mt-4 bg-white p-3 rounded shadow-sm">
          <h5>{editMode ? "Edit Address" : "Add Address"}</h5>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={address.area}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="number"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>District</Form.Label>
                <Form.Control
                  type="text"
                  name="district"
                  value={address.district || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={address.state || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={address.country || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Landmark</Form.Label>
                <Form.Control
                  type="text"
                  name="landmark"
                  value={address.landmark || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Address Type</Form.Label>
                <Form.Select
                  name="address_type"
                  value={address.address_type}
                  onChange={handleChange}
                >
                  <option value="present">Present</option>
                  <option value="permanent">Permanent</option>
                </Form.Select>
              </div>
            </div>

            <Button type="submit" variant="success" className="me-2">
              {editMode ? "Update" : "Save"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditMode(false);
                setEditId(null);
              }}
            >
              Cancel
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
};

export default Address;
