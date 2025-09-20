import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { BASE_URL } from "./Api";

const NotificationModal = ({ show, handleClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${BASE_URL}/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response.data.data);

      const announcementArray = response.data.data || [];

      // ✅ Sort by latest published_at
      const sortedAnnouncements = announcementArray
        .slice()
        .sort(
          (a, b) =>
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
        );

      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    if (show) {
      fetchAnnouncements();
      setVisibleCount(3); // Reset visible count each time modal opens
    }
  }, [show]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 3);
      setLoading(false);
    }, 300); // Simulate loading delay
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {announcements.slice(0, visibleCount).map((item, index) => (
          <div key={index} className="mb-3 p-3 border rounded shadow-sm">
            <h5>{item.title}</h5>
            <p className="text-muted mb-1">{item.content}</p>
            <small className="text-secondary">
              Published on: {new Date(item.published_at).toLocaleString()}
            </small>
          </div>
        ))}

        {visibleCount < announcements.length && (
          <div className="text-center mt-3">
            <Button
              variant="outline-primary"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "More"}
            </Button>
          </div>
        )}

        {announcements.length === 0 && (
          <p className="text-center text-muted">
            No notifications available.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationModal;
