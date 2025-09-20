import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './FilterModal.css';
import { IoClose } from 'react-icons/io5';

const FilterModal = ({ show, handleClose }) => {
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('From:', fromMonth, 'To:', toMonth);
    
    // Add your filter logic here
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <div className="filter-modal p-4 position-relative">
        <IoClose className="close-icon" onClick={handleClose} />
        <h5 className="mb-4 fw-bold">Filter Month</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>From Month</Form.Label>
            <Form.Select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} required>
              <option value="">Select month</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>To Month</Form.Label>
            <Form.Select value={toMonth} onChange={(e) => setToMonth(e.target.value)} required>
              <option value="">Select month</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="submit-button w-100">
            Submit
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

export default FilterModal;
