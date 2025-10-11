import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { BASE_URL } from "./Api";
import { IoIosMenu, IoIosClose, IoIosDocument, IoIosPerson } from "react-icons/io";

const Employeepolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Fetch policies
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/policies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setPolicies(res.data.data.data);
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy) => {
    setSelectedPolicy(policy);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      {/* Mobile Sidebar Toggle */}
      <div className="d-md-none bg-white border-bottom py-2">
        <div className="container-fluid">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <IoIosClose size={20} /> : <IoIosMenu size={20} />}
            <span>Policies</span>
          </button>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Overlay for Mobile */}
          {isSidebarOpen && (
            <div 
              className="d-md-none position-fixed w-100 h-100 bg-dark opacity-50"
              style={{ zIndex: 1040, top: 0, left: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <div 
            className={`col-md-3 col-lg-2 ${isSidebarOpen ? 'd-block' : 'd-none d-md-block'} position-md-static`}
            style={{
              zIndex: 1050,
              position: isSidebarOpen ? 'fixed' : 'static',
              top: 0,
              left: 0,
              height: '100vh',
              overflowY: 'auto',
              background: "linear-gradient(180deg, #003973, #005aa7)",
            }}
          >
            <div className="d-flex flex-column h-100">
              {/* Sidebar Header */}
              <div className="p-3 border-bottom border-white border-opacity-25">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-white mb-0 d-flex align-items-center gap-2">
                    <IoIosDocument size={20} />
                    Policies
                  </h5>
                  <button 
                    className="btn btn-sm btn-outline-light d-md-none"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <IoIosClose size={20} />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                {loading ? (
                  <div className="text-center text-white py-4">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading policies...
                  </div>
                ) : policies.length === 0 ? (
                  <div className="text-center text-white-50 py-4">
                    <IoIosDocument size={40} className="mb-2 opacity-50" />
                    <p className="mb-0">No policies found</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {policies.map((policy) => (
                      <button
                        key={policy.id}
                        className={`list-group-item list-group-item-action border-0 rounded mb-2 p-3 ${
                          selectedPolicy?.id === policy.id 
                            ? 'bg-white text-dark' 
                            : 'bg-transparent text-white border-white border-opacity-25'
                        }`}
                        onClick={() => handlePolicySelect(policy)}
                        style={{
                          backdropFilter: selectedPolicy?.id === policy.id ? 'none' : 'blur(10px)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <IoIosDocument 
                            size={18} 
                            className={`mt-1 me-2 ${selectedPolicy?.id === policy.id ? 'text-primary' : 'text-white'}`}
                          />
                          <div className="text-start">
                            <h6 className="mb-1 fw-bold">{policy.policy_name}</h6>
                            {policy.title && (
                              <small className="opacity-75">{policy.title}</small>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 p-3 p-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                {selectedPolicy ? (
                  <div className="h-100 d-flex flex-column">
                    {/* Policy Header */}
                    <div className="border-bottom pb-3 mb-4">
                      <h1 className="h3 text-primary mb-2">{selectedPolicy.policy_name}</h1>
                      {selectedPolicy.title && (
                        <h3 className="h5 text-muted mb-3">{selectedPolicy.title}</h3>
                      )}
                      
                      <div className="d-flex flex-wrap gap-3">
                        <div className="d-flex align-items-center text-muted">
                          <IoIosPerson size={18} className="me-2" />
                          <small>
                            Created by: <strong>
                              {selectedPolicy.creator?.first_name}{" "}
                              {selectedPolicy.creator?.last_name}
                            </strong>
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Policy Description */}
                    <div className="mb-4">
                      <h4 className="h5 text-primary mb-3">Description</h4>
                      <p className="text-muted lead">{selectedPolicy.description}</p>
                    </div>

                    {/* PDF Preview */}
                    {selectedPolicy.pdf_path ? (
                      <div className="flex-grow-1 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h4 className="h5 text-primary mb-0 d-flex align-items-center gap-2">
                            <IoIosDocument size={20} />
                            PDF Preview
                          </h4>
                          <a 
                            href={`${BASE_URL}/policies/${selectedPolicy.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            Open in New Tab
                          </a>
                        </div>
                        
                        <div className="border rounded flex-grow-1">
                          <iframe
                            src={`${BASE_URL}/policies/${selectedPolicy.id}/view`}
                            title="Policy PDF"
                            width="100%"
                            height="100%"
                            style={{ 
                              border: "none",
                              minHeight: "500px"
                            }}
                            className="rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-warning d-flex align-items-center" role="alert">
                        <IoIosDocument size={20} className="me-2" />
                        <div>No PDF document available for this policy</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <IoIosDocument size={60} className="mb-3 opacity-25" />
                    <h3 className="h4">Select a Policy</h3>
                    <p className="mb-0">Choose a policy from the sidebar to view its details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employeepolicy;