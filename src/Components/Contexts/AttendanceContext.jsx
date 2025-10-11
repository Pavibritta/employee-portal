import { createContext, useContext, useState, useEffect } from "react";

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [absentData, setAbsentData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Timer loop for working time
  console.log("context", attendanceData);
  return (
    <AttendanceContext.Provider
      value={{
        attendanceData,
        setAttendanceData,
        absentData,
        setAbsentData,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
