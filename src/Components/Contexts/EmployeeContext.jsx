import React, { createContext, useState, useContext, useEffect } from 'react';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employeeData, setEmployeeData] = useState(() => {
    // Load from localStorage on initial render
    const savedData = localStorage.getItem('employeeData');
    return savedData ? JSON.parse(savedData) : null;
  });

  const updateEmployeeData = (newData) => {
    setEmployeeData(newData);
    // Save to localStorage whenever data changes
    localStorage.setItem('employeeData', JSON.stringify(newData));
  };

  // Optional: Clear data when needed
  const clearEmployeeData = () => {
    setEmployeeData(null);
    localStorage.removeItem('employeeData');
  };

  return (
    <EmployeeContext.Provider
      value={{
        employeeData,
        updateEmployeeData,
        clearEmployeeData // Optional
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};