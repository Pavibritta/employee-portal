import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import "./Updateprofile.css";
import Navbar from "./Navbar";
import { useUser } from "./Contexts/UserContext";
const Updateprofile = () => {
  const { role } = useUser();
  const id = localStorage.getItem("Id");
  return (
    <div className="fulldiv">
      {role !== "admin" && <Navbar />}
      {/* {role!=="employee" && <Layout/>} */}

      <div className="container-fluid update-container p-4">
        <div className="container mb-3 ">
          {role !== "admin" && (
            <div className="container mb-3  breadcrumb">
              <nav aria-label="breadcrumb" className="breadcrumb text-center">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <NavLink to="/Userdashboard">Dashboard</NavLink>
                  </li>
                  <li className="breadcrumb-item active">Update Profile</li>
                </ul>
              </nav>
            </div>
          )}

          {role === "admin" && <div className="container mb-3  "></div>}

          <div className="container-fluid update-container w-100">
            <div className="row update mt-4">
              {/* Sidebar */}
              <div className="col-lg-3 col-md-3 sidebarcontainer">
                <ul className="list-container">
                  <NavLink
                    to={role === "admin" ? "personal" : `employeedetails/${id}`}
                  >
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Personal Details</span>
                      </li>
                    )}
                  </NavLink>
                  <NavLink to="address">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Address Details</span>
                      </li>
                    )}
                  </NavLink>

                  <NavLink to="education">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Education Details</span>
                      </li>
                    )}
                  </NavLink>

                  <NavLink to="experience">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Experience Details</span>
                      </li>
                    )}
                  </NavLink>

                  <NavLink to="bank">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Bank Details</span>
                      </li>
                    )}
                  </NavLink>

                  <NavLink to="documents">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Documents Details</span>
                      </li>
                    )}
                  </NavLink>

                  <NavLink to="salary">
                    {({ isActive }) => (
                      <li className={isActive ? "active-tab" : ""}>
                        <span className="tab-button">Salary Structure</span>
                      </li>
                    )}
                  </NavLink>
                </ul>
              </div>

              {/* Content Panel */}
              <div className="col-lg-8 col-md-8 mainbar mt-2 w-95">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Updateprofile;
