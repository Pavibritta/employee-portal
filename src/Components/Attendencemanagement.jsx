import React, { createContext, useEffect, useState } from "react";
import { Tabs, Tab, Table, Spinner } from "react-bootstrap";
import "./Attendencemanagement.css";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "./Api";
import { useAttendance } from "./Contexts/AttendanceContext";
import { useLocation } from "react-router-dom";

const Attendencemanagement = () => {
  const location = useLocation();
  const [key, setKey] = useState(location.state?.tab || "present");
  const {
    attendanceData,
    setAttendanceData,
    absentData,
    setAbsentData,
    selectedDate,
    setSelectedDate,
  } = useAttendance();
  // const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [absentData, setAbsentData] = useState([]);
  // const [selectedDate, setSelectedDate] = useState(() => {
  //   const today = new Date();
  //   return today.toISOString().split("T")[0];
  // });
  // console.log("date", selectedDate);
  const [filteredPresentData, setFilteredPresentData] = useState([]);

  const fetchAttendanceData = async (selectedDate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Token Missing", "Please log in again.", "warning");
        return;
      }

      const [year, month] = selectedDate.split("-");

      const res = await axios.get(
        `${BASE_URL}/attendance/all?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setAttendanceData(data);
      // setPresentData(data);
    } catch (error) {
      console.error("❌ API Error:", error);
      // Swal.fire({
      //   icon: "error",
      //   title: "Fetch Failed",
      //   text: "Unable to load attendance data.",
      // });
      setAttendanceData([]);
      // setPresentData([])
    } finally {
      setLoading(false);
    }
  };

  // Fetch Attendance
  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  // Fetch Absent Data (Leave Applications)
  // ✅ Fetch Absent Data (Leave Applications)
  useEffect(() => {
    const fetchAbsentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [year, month, day] = selectedDate.split("-"); // 👈 also extract day

        const res = await axios.get(
          `${BASE_URL}/attendances/${selectedDate}/absent`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("absent", res.data.data);
        setAbsentData(res.data?.data || []);
        // setTodayAbsentData(res.data?.absent_employees || []);
      } catch (err) {
        console.error("❌ Error fetching absent data:", err);
        setAbsentData([]);
        // setTodayAbsentData([])
      }
    };

    fetchAbsentData();
  }, [selectedDate]);

  // Filter Present data
  useEffect(() => {
    const filteredByDate = attendanceData.filter(
      (item) => item.date === selectedDate
    );

    const present = filteredByDate.filter((item) =>
      ["present", "half_day", "short_day"].includes(item.status)
    );

    setFilteredPresentData(present);
  }, [attendanceData, selectedDate]);

  return (
    <div className="container-fluid p-3 attendence-container bg-white min-vh-100 mt-5">
      {/* Date Input */}
      <div className="row align-items-center mb-3">
        <div className="col-md-12 d-flex justify-content-md-end align-items-center">
          <label htmlFor="date" className="me-2 fw-medium">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-control"
            style={{ maxWidth: "200px" }}
          />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div>Loading attendance data...</div>
        </div>
      ) : (
        <Tabs
          id="attendance-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3 tab-style"
        >
          {/* ✅ Present Tab */}
          <Tab eventKey="present" title="Present">
            <AttendanceTable
              data={filteredPresentData}
              selectedDate={selectedDate}
            />
          </Tab>

          {/* ✅ Absent Tab (Leave Applications) */}
          <Tab eventKey="absent" title="Absent">
            <AbsentTable data={absentData} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
};
const formatTime = (timeString) => {
  if (!timeString) return "—";
  const [hour, minute, second] = timeString.split(":");
  const date = new Date();
  date.setHours(hour, minute, second);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const AttendanceTable = ({ data, selectedDate }) => (
  <div className="table-responsive">
    <Table striped bordered hover>
      <thead className="table-light">
        <tr>
          <th>S.NO</th>
          <th>Employee ID</th>
          <th>Name</th>
          <th>Login Time</th>
          <th>Logout Time</th>
          <th>Total Hours</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.user?.employee_id || "N/A"}</td>
              <td>{item.user?.full_name || "N/A"}</td>
              <td>{formatTime(item.check_in)}</td>
              <td>{formatTime(item.check_out)}</td>

              <td>{item.working_hours || "—"}</td>
              <td
                className={
                  item.status === "half_day"
                    ? "bg-danger fw-bold text-white"
                    : ""
                }
              >
                {item.status || "—"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center">
              No data found for {new Date(selectedDate).toLocaleDateString()}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);

const AbsentTable = ({ data }) => (
  <div className="table-responsive">
    <Table bordered hover responsive>
      <thead className="table-light text-nowrap">
        <tr>
          <th>S.NO</th>
          <th>Employee Id</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="7" className="text-center">
              No absent records found.
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.employee_id}</td>
              <td>{item.name}</td>

              <td>{item.status}</td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  </div>
);

export default Attendencemanagement;
