import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 🔹 Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser
      ? JSON.parse(savedUser)
      : { id: null, email: null, role: null, token: null };
  });

  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  console.log("userId", userId);

  const loginUser = (userData) => {
    console.log("userdata", userData);
    setUser(userData);
    // 🔹 Save user details to localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.id) localStorage.setItem("userId", userData.id);
    if (userData.token) localStorage.setItem("authToken", userData.token);
  };

  const logoutUser = () => {
    setUser({ id: null, email: null, role: null, token: null });
    // 🔹 Clear all user-related localStorage keys
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
  };

  // 🧩 Sync localStorage when user state changes
  useEffect(() => {
    if (user?.role) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
