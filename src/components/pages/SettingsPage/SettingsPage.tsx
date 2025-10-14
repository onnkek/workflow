import React, { Component, useState } from "react"
import "./SettingsPage.sass"
import ThemePage from "./ThemePage/ThemePage"
import Sidebar from "./Sidebar/Sidebar"
import { Route, Routes } from "react-router-dom"
import ProfilePage from "./ProfilePage/ProfilePage"
import TimetaskPage from "./TimetaskPage/TimetaskPage"
import NotificationsPage from "./NotificationsPage/NotificationsPage"
import BadgesPage from "./BadgesPage/BadgesPage"
import DatePage from "./DatePage/DatePage"

const SettingsPage = () => {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const loginHandler = () => {
    if (password === "091077") {
      setAuth(true);
    } else {
      setMessage("Incorrect password");
    }
  }
  return (
    <>
      <div className="app-container">
        <div className="settings-page">
          <div className="settings">
            {!auth &&
              <div className="auth">
                <div className="input-label">Password</div>
                <input
                  type="password"
                  name="deadline"
                  className="form-control add-form-date auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="error-massage">{message}</div>
                <button type="submit" className="btn btn-primary auth-btn"
                  onClick={loginHandler}
                >
                  Login
                </button>
              </div>
            }
            {auth && <DatePage />}
          </div>
          {/* <div className="col-4">
            <Sidebar />
          </div>
          <div className="settings-page-body col-8">
            <Routes>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="appearance" element={<ThemePage />} />
              <Route path="time" element={<TimetaskPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="date" element={<DatePage />} />
            </Routes>
          </div> */}

        </div>
      </div>
    </>
  )
}
export default SettingsPage
