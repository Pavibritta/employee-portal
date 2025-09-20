import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

const Createuser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
const token=localStorage.getItem("authToken")
    try {
      const response = await axios.post("http://192.168.1.33:8000/api/users", formData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
          // If your API requires authentication, add Authorization token here:
          // Authorization: `Bearer ${your_token}`
        },
      });

      console.log("Success:", response.data);
      Swal.fire("Success", "User created successfully!", "success");

      // Optionally reset form
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to create user", "error");
    }
  };

  return (
    <Card className="p-4 mt-4 mx-auto" style={{ maxWidth: "500px" }}>
      <h4 className="mb-4 text-center">Create User</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter name"
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter email"
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter password"
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Create Account
        </Button>
      </Form>
    </Card>
  );
};

export default Createuser;
