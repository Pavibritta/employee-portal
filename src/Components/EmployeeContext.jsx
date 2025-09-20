import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "./Api";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    // 1️⃣ Load from localStorage if available
    const savedData = localStorage.getItem("employeeData");
    if (savedData) {
      try {
        setEmployeeData(JSON.parse(savedData));
      } catch (err) {
        console.error("Invalid employeeData in localStorage");
      }
    }

    // 2️⃣ Fetch from API only if needed
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!authToken || !userId) return; // No login, no fetch

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/employees/${userId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (response.status === 200) {
          setEmployeeData(response.data);
          console.log(employeeData)
          localStorage.setItem("employeeData", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      }
    };

    if (!savedData) {
      fetchEmployee();
    }
  }, []);

  return (
    <EmployeeContext.Provider value={{ employeeData, setEmployeeData }}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook
export const useEmployee = () => useContext(EmployeeContext);
