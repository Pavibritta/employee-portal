import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

// Login & Dashboard
import Login from "./Components/Login";
import Employeelogin from "./Components/Employeelogin";
import Userdashboard from "./Components/Userdashboard";

// Employee Features
import Applyleave from "./Components/Applyleave";
import Checkout from "./Components/Checkout";
import Chooseleave from "./Components/Chooseleave";
import Attendence from "./Components/Attendence";
import Payslip from "./Components/Payslip";
import Updateprofile from "./Components/Updateprofile";

// Profile Subpages
import Personal from "./Components/pages/Personal";
import Education from "./Components/pages/Education";
import Experience from "./Components/pages/Experience";
import Bank from "./Components/pages/Bank";
import Documents from "./Components/pages/Documents";

// Admin Pages
import Admin from "./Components/Admin";
import Layout from "./Components/Layout";
import Admindashboard from "./Components/Admindashboard";
import Employemanagement from "./Components/Employemanagement";
import Attendencemanagement from "./Components/Attendencemanagement";
import Leavemanagement from "./Components/Leavemanagement";
import Salarymanagement from "./Components/Salarymanagement";
import Announcement from "./Components/Announcement";
import Adminprofile from "./Components/Adminprofile";
import EmployeeDetails from "./Components/pages/EmployeeDetails";
import ProtectedRoute from "./Components/ProtectedRoute";
import Salary from "./Components/pages/Salary";
import Address from "./Components/pages/Address";
import Employeeprofile from "./Components/Employeeprofile";
import Policy from "./Components/Policy";
import Employeepolicy from "./Components/Employeepolicy";
import Holiday from "./Components/Holiday";
import Leavesummary from "./Components/Leavesummary";

function App() {
  return (
    <Router basename="/hrms">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/employeelogin" element={<Employeelogin />} />
        <Route path="/admin" element={<Admin />} />

        {/* Employee Dashboard & Features (Protected) */}
        <Route
          path="/userdashboard"
          element={
            <ProtectedRoute>
              <Userdashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policy"
          element={
            <ProtectedRoute>
              <Employeepolicy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeeprofile"
          element={
            <ProtectedRoute>
              <Employeeprofile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applyleave"
          element={
            <ProtectedRoute>
              <Applyleave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chooseleave"
          element={
            <ProtectedRoute>
              <Chooseleave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendence"
          element={
            <ProtectedRoute>
              <Attendence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslip"
          element={
            <ProtectedRoute>
              <Payslip />
            </ProtectedRoute>
          }
        />

        {/* Employee Profile Update */}
        <Route
          path="/updateprofile"
          element={
            <ProtectedRoute>
              <Updateprofile />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDetails />} />
          <Route path="employeedetails/:id">
            <Route index element={<EmployeeDetails />} />
            <Route path="personal" element={<Personal />} />
          </Route>
          <Route path="address" element={<Address />} />
          <Route path="education" element={<Education />} />
          <Route path="experience" element={<Experience />} />
          <Route path="bank" element={<Bank />} />
          <Route path="documents" element={<Documents />} />
          <Route path="salary" element={<Salary />} />
        </Route>

        {/* Admin Layout and Nested Routes (Protected) */}
        <Route
          path="/layout"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="admindashboard" replace />} />
          <Route path="admindashboard" element={<Admindashboard />} />
          <Route path="employemanagement" element={<Employemanagement />}>
            <Route index element={<Personal />} />
            <Route path="personal" element={<Personal />} />
            <Route path="address" element={<Address />} />
            <Route path="education" element={<Education />} />
            <Route path="experience" element={<Experience />} />
            <Route path="bank" element={<Bank />} />
            <Route path="documents" element={<Documents />} />
            <Route path="salary" element={<Salary />} />
            <Route path="attendence" element={<Attendence />} />
            <Route path="leavesummary" element={<Leavesummary/>}/>
          </Route>
          <Route
            path="attendencemanagement"
            element={<Attendencemanagement />}
          />
          <Route path="leavemanagement" element={<Leavemanagement />} />
          <Route path="salarymanagement" element={<Salarymanagement />} />
          <Route path="announcement" element={<Announcement />} />
          <Route path="Adminprofile" element={<Adminprofile />} />
          <Route path="Policy" element={<Policy />} />
          <Route path="holiday" element={<Holiday />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
