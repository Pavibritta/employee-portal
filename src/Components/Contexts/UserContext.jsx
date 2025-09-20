// src/contexts/UserContext.js
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    // Retrieve saved role from localStorage on initial load
    return localStorage.getItem("role") || null;
  });

  const loginAsAdmin = () => {
    setRole("admin");
    localStorage.setItem("role", "admin");
  };

  const loginAsEmployee = () => {
    setRole("employee");
    localStorage.setItem("role", "employee");
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("role");
  };

  return (
    <UserContext.Provider
      value={{ role, setRole, loginAsAdmin, loginAsEmployee, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
