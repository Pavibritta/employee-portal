import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiCopy } from "react-icons/fi";
import Navbar from "./Navbar";
import PayslipTemplate from "./Paysliptemplate";
import html2pdf from "html2pdf.js";
import { createRoot } from "react-dom/client";
import { useEmployeeData } from "./Contexts/EmployeeDataContext";
// ✅ React 18 import

import axios from "axios";
import "./Payslip.css";
import { BASE_URL } from "./Api";

const Payslip = () => {
  const [slips, setSlips] = useState([]);
  const slipRefs = useRef([]);
  const [visibleSlipIndex, setVisibleSlipIndex] = useState(null);
  const { employeeData } = useEmployeeData();
  console.log("employeeData", employeeData);

  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const fetchPayslip = async (monthYear) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token) return;

    const [year, month] = monthYear.split("-");
    try {
      const res = await axios.get(
        `${BASE_URL}/salary/payslip/generate/${employeeData.id}/${year}/${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSlips(res.data ? [res.data] : []);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch payslips:", err);
      setSlips([]);
    }
  };

  useEffect(() => {
    fetchPayslip(selectedMonthYear);
  }, [selectedMonthYear]);
  const handleDownload = (index, slip) => {
    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);

    // Mount PayslipTemplate into tempDiv
    const root = createRoot(tempDiv);
    root.render(<PayslipTemplate data={slip} />);

    const opt = {
      margin: 0.5,
      filename: `payslip_${index + 1}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(tempDiv)
      .save()
      .then(() => {
        root.unmount();
        document.body.removeChild(tempDiv);
      });
  };

  const handleToggleSlip = (index) => {
    setVisibleSlipIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  const handleMonthChange = (e) => {
    setSelectedMonthYear(e.target.value);
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid payslip-container p-4">
        <div className="container breadcrums mb-3">
          <nav aria-label="breadcrumb">
            <ul className="breadcrumb">
              <li className="breadcrumb-item dash">
                <Link to="/Userdashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active dash">Pay Slip</li>
            </ul>
          </nav>
        </div>

        <div className="container salarycontainer">
          <h5 className="mb-3">Salary Slips</h5>
          <hr className="tab-underline" />

          <div className="mb-3">
            <label>Select Month: </label>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={handleMonthChange}
              className="form-control w-auto d-inline-block ms-2"
            />
          </div>

          {slips.length > 0 ? (
            slips.map((slip, index) => (
              <div key={index} className="mb-5">
                <div className="card shadow-sm p-3 d-flex justify-content-between align-items-center flex-row slip-card mb-3">
                  <div>
                    <h6 className="mb-0">
                      Payslip -{" "}
                      {new Date(slip.period.start_date).toLocaleString(
                        "default",
                        { month: "long", year: "numeric" }
                      )}
                    </h6>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <FiCopy
                      size={18}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleSlip(index)}
                    />
                    <FiDownload
                      size={18}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDownload(index, slip)}
                    />
                    <small className="text-muted">
                      {new Date().toLocaleString()}
                    </small>
                  </div>
                </div>

                {/* Payslip content to render/download */}
                <div
                  ref={(el) => (slipRefs.current[index] = el)}
                  style={{
                    display: visibleSlipIndex === index ? "block" : "none",
                  }}
                >
                  <PayslipTemplate data={slip} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No payslips available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Payslip;
