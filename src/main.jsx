import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Context Providers
import { EmployeeProvider } from "./Components/Contexts/EmployeeContext.jsx";
import { UserProvider } from "./Components/Contexts/UserContext.jsx";
import { EmployeeDataProvider } from "./Components/Contexts/EmployeeDataContext.jsx";
import { AttendanceProvider } from "./Components/Contexts/AttendanceContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EmployeeProvider>
      <UserProvider>
        <EmployeeDataProvider>
          <AttendanceProvider>
          <App />
          </AttendanceProvider>
        </EmployeeDataProvider>
      </UserProvider>
    </EmployeeProvider>
  </StrictMode>
);
