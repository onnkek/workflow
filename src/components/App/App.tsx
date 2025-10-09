import React, { MouseEvent } from "react"
import "./App.sass"
import Header from "../Header/Header"
import { Route, Routes } from "react-router-dom"
import SettingsPage from "../pages/SettingsPage/SettingsPage"
import NotesPage from "../pages/NotesPage/NotesPage"
import CalendarPage from "../pages/CalendarPage/CalendarPage"
import { useAppDispatch } from "../../models/Hook"
import { closeContextMenu, closeIconsMenu } from "../../redux/NotesSlice"
import GeneralPage from "../pages/GeneralPage/GeneralPage"
import ActualTaskPage from "../pages/ActualTaskPage/ActualTaskPage"
import OldTasksPage from "../pages/OldTasksPage/OldTasksPage"

const App = () => {
  const dispatch = useAppDispatch()
  const closeMenusHandler = (e: MouseEvent<HTMLDivElement>) => {
    dispatch(closeContextMenu())
    dispatch(closeIconsMenu())
  }

  return (
    <div onClick={closeMenusHandler} className="app">
      <Header />
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        {/* <Route path="/actual" element={<ActualTaskPage />} /> */}
        {/* <Route path="/old" element={<OldTasksPage />} /> */}
        {/* <Route path="/notes" element={<NotesPage />} /> */}
        {/* <Route path="/calendar" element={<CalendarPage />} /> */}
        <Route path="/settings/*" element={<SettingsPage />} />

      </Routes>
    </div>
  )
}
export default App