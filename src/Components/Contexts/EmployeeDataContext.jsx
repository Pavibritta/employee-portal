// EmployeeDataContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const EmployeeDataContext = createContext();

export const EmployeeDataProvider = ({ children }) => {
  const savedData = localStorage.getItem("employeeData");
  const initialData = savedData
    ? JSON.parse(savedData)
    : {
        id: "",
        first_name: "",
        last_name: "",
        phone: "",
        gender: "",
        date_of_birth: "",
        present_address: "",
        permanent_address: "",
        blood_group: "",
        marital_status: "",
        emergency_contact: "",
        emergency_contact_name: "",
        father_name: "",
        mother_name: "",
        joining_date: "",
        probation_end_date: "",
        salary: "",
        designation_id: "",
        department_id: "",
        shift_id: "",
        email: "",
        employee_id: "",
      };

  const [employeeData, setEmployeeData] = useState(initialData);

  useEffect(() => {
    console.log("employee-data-selct", employeeData);
  }, [employeeData]);

  // ✅ Add these new states
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    localStorage.setItem("employeeData", JSON.stringify(employeeData));
  }, [employeeData]);

  const updateField = (key, value) => {
    setEmployeeData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <EmployeeDataContext.Provider
      value={{
        employeeData,
        setEmployeeData,
        updateField,
        mode,
        setMode,
        selectedEmployeeId,
        setSelectedEmployeeId,
      }}
    >
      {children}
    </EmployeeDataContext.Provider>
  );
};

export const useEmployeeData = () => {
  const context = useContext(EmployeeDataContext);
  if (!context) {
    throw new Error("useEmployeeData must be used within EmployeeDataProvider");
  }
  return context;
};
