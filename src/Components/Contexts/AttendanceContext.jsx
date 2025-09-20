import { createContext, useContext, useState, useEffect } from "react";

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [checkStatus, setCheckStatus] = useState("Check In"); // default
  const [checkInTime, setCheckInTime] = useState(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  // Timer loop for working time
  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setWorkingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  return (
    <AttendanceContext.Provider
      value={{
        checkStatus,
        setCheckStatus,
        checkInTime,
        setCheckInTime,
        workingTime,
        setWorkingTime,
        isTracking,
        setIsTracking,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
