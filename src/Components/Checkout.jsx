import { useState,useEffect } from "react";
import "./Userdashboard.css";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import profile from "../images/profileimg1.jpg";
import { FaClock } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";

const Checkout = () => {
  const [time,setTime]=useState(new Date())
  const navigate=useNavigate()
  useEffect(()=>{
    const timer=setInterval(()=>{
      setTime(new Date())
    },1000)
    return ()=>clearInterval(timer)
  },[])
  const formatedTime=time.toLocaleTimeString()
  return (
    <div>
      <Navbar />
      <div className="container-fluid dashboard-container">
        <h4 className="head">Dashboard</h4>
        <div className="top-card-container">
          <div className="profile-section">
            <img
              src={profile}
              alt="profile"
              height={"60px"}
              width={"60px"}
              className="profileimg"
            />
            <div>
              <h4 className="profilename">Nithya Sundar</h4>
              <p className="designation">Human Resources (HR)</p>
            </div>
          </div>
          <div className="attendance-section">
            <h4 className="attendence">Attendence</h4>
            <div className="checkin-section">
              <div className="clock-box">
                <FaClock className="clock-icon" />
                <span className="clock-time">{formatedTime}</span>
              </div>
              <button className="checkin-btn">Check Out</button>
            </div>
          </div>
        </div>
        <p className="actionhead">Quick Actions</p>
        <div className="quick-actions">
          <button className="quick-actions-button" onClick={()=>navigate('/Applyleave')}>Apply for Leave</button>
          <button className="quick-actions-button">Attendance</button>
          <button className="quick-actions-button">Pay Slip</button>
          <button className="quick-actions-button">Update Profile</button>
        </div>

        <div className="attendance-summary">
          <div className="summary-box">
            <h5>Today Attendance</h5>
            <div className="summary-cards">
              <div className="card present">
                Present <strong>22</strong>
              </div>
              <div className="card absent">
                Absent <strong>03</strong>
              </div>
              <div className="card leave">
                Leaves <strong>02</strong>
              </div>
            </div>
          </div>

          <div className="holiday-box">
            <div className="holiday-head">
              <h5>Coming Holiday's</h5>
            <SlCalender />
            </div>
            <div className="holiday-body">
               <p className="monthyear">Nov 2023</p>
               <div className="holidaycard">
                <p className="cardcontent">Tuesday 12th Nov’ 2023</p>
                <p className="content">Diwali</p>
               </div>
               <div className="holidaycard"><p className="cardcontent">Wednesday 13th Nov’ 2023</p>
               <p className="content">Diwali</p>
               </div>
               <div className="holiday-footer">
                <button className="view-all-btn">View All</button>

               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
