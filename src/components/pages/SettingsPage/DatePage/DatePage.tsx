import React, { ChangeEvent, useEffect, useState } from "react"
import "./DatePage.sass"
import SettingsHeader from "../SettingsHeader/SettingsHeader"
import { Plus, PlusLg, Trash } from "react-bootstrap-icons"
import { useAppDispatch, useAppSelector } from "../../../../models/Hook"
import { addBirthday, addException, addHoliday, addTransfer, addVacation, addWorking, changeWeekend, getSettings, removeBirthday, removeException, removeHoliday, removeTransfer, removeVacation } from "../../../../redux/SettingsSlice"
import { Status } from "../../../../models/Status"

const DatePage = () => {
  const dispatch = useAppDispatch()
  const status = useAppSelector(state => state.settings.status)
  const holidays = useAppSelector(state => state.settings.date.holidays)
  const transfers = useAppSelector(state => state.settings.date.transfers)
  const exceptions = useAppSelector(state => state.settings.date.exceptions)
  const birthdays = useAppSelector(state => state.settings.date.birthdays)
  const vacations = useAppSelector(state => state.settings.date.vacations)
  const [vacationStart, setVacationStart] = useState("")
  const [vacationEnd, setVacationEnd] = useState("")
  const [vacationName, setVacationName] = useState("")
  const [transferFrom, setTransferFrom] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferName, setTransferName] = useState("")
  const [exceptionDate, setExceptionDate] = useState("")
  const [exceptionTime, setExceptionTime] = useState("")
  const [exceptionName, setExceptionName] = useState("")
  const [holiday, setHoliday] = useState("")
  const [holidayName, setHolidayName] = useState("")
  const [birthday, setBirthday] = useState("")
  const [birthdayName, setBirthdayName] = useState("")
  const [working, setWorking] = useState("")

  // const hlWeekendChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
  //   dispatch(changeWeekend({ highlight: !weekend.highlight }))
  // }

  const addHolidayHandler = () => {
    dispatch(addHoliday({ day: holiday, name: holidayName }))
  }
  const removeHolidayHandler = (id: number) => {
    dispatch(removeHoliday({ day: holiday, id: id, name: holidayName }))
  }

  const holidayChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setHoliday(e.target.value)
  }
  const holidayNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setHolidayName(e.target.value)
  }

  const transferFromChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferFrom(e.target.value)
  }
  const transferToChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferTo(e.target.value)
  }
  const transferNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferName(e.target.value)
  }

  const exceptionDateChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setExceptionDate(e.target.value)
  }
  const exceptionTimeChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setExceptionTime(e.target.value)
  }
  const exceptionNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setExceptionName(e.target.value)
  }

  const addBirthdayHandler = () => {
    dispatch(addBirthday({ day: birthday, name: birthdayName }))
  }
  const removeBirthdayHandler = (id: number) => {
    dispatch(removeBirthday({ day: birthday, id: id, name: birthdayName }))
  }

  const birthdayChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value)
  }
  const birthdayChangeNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthdayName(e.target.value)
  }

  const addWorkingHandler = () => {
    dispatch(addWorking(working))
  }
  // const removeWorkingHandler = (id: number) => {
  //   dispatch(removeWorking({ day: holiday, id: id }))
  // }

  const workingChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setWorking(e.target.value)
  }

  const addVacationHandler = () => {
    dispatch(addVacation({ start: vacationStart, end: vacationEnd, name: vacationName }))
  }
  const removeVacationHandler = (id: number) => {
    dispatch(removeVacation({ id: id, start: vacationStart, end: vacationEnd, name: "" }))
  }

  const addTransferHandler = () => {
    dispatch(addTransfer({ from: transferFrom, to: transferTo, name: transferName }))
  }
  const removeTransferHandler = (id: number) => {
    dispatch(removeTransfer({ id: id, from: transferFrom, to: transferTo, name: "" }))
  }

  const addExceptionHandler = () => {
    dispatch(addException({ date: exceptionDate, time: Number(exceptionTime), name: exceptionName }))
  }
  const removeExceptionHandler = (id: number) => {
    dispatch(removeException({ id: id, date: exceptionDate, time: Number(exceptionTime), name: "" }))
  }

  const vacationStartChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setVacationStart(e.target.value)
  }
  const vacationEndChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setVacationEnd(e.target.value)
  }
  const vacationChangeNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setVacationName(e.target.value)
  }

  const holidayContent = holidays.map(day =>
    <div className="input-group mt-2" key={day.id}>
      <span className="input-group-text" id="basic-addon1">Name</span>
      <input
        type="text"
        name="deadline"
        className="form-control add-form-date"
        value={day.name}
        readOnly
        disabled
      />
      <span className="input-group-text" id="basic-addon1">Date</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={day.day}
        readOnly
        disabled
      />

      <button type="submit" className="btn btn-primary"
        onClick={() => removeHolidayHandler(day.id)}
      >
        <Trash />
      </button>
    </div>
  )
  const transferContent = transfers.map(transfer =>
    <div className="input-group mt-2" key={transfer.id}>
      <span className="input-group-text" id="basic-addon1">Reason</span>
      <input
        type="text"
        name="deadline"
        style={{ width: "40%" }}
        className="form-control add-form-date"
        value={transfer.name}
        readOnly
        disabled
      />
      <span className="input-group-text" id="basic-addon1">From</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={transfer.from}
        readOnly
        disabled
      />
      <span className="input-group-text" id="basic-addon1">To</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={transfer.to}
        readOnly
        disabled
      />

      <button type="submit" className="btn btn-primary"
        onClick={() => removeTransferHandler(transfer.id)}
      >
        <Trash />
      </button>

    </div>
  )

  const exceptionContent = exceptions.map(exception =>
    <div className="input-group mt-2" key={exception.id}>
      <span className="input-group-text" id="basic-addon1">Reason</span>
      <input
        type="text"
        name="deadline"
        style={{ width: "40%" }}
        className="form-control add-form-date"
        value={exception.name}
        readOnly
        disabled
      />
      <span className="input-group-text" id="basic-addon1">Date</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        readOnly
        disabled
        value={exception.date}
      />
      <span className="input-group-text" id="basic-addon1">Time</span>
      <input
        type="text"
        name="deadline"
        className="form-control add-form-date"
        readOnly
        disabled
        value={exception.time}
      />

      <button type="submit" className="btn btn-primary"
        onClick={() => removeExceptionHandler(exception.id)}
      >
        <Trash />
      </button>


    </div>
  )

  const birthdayContent = birthdays.map(day =>
    <div className="input-group mt-2" key={day.id}>
      <span className="input-group-text" id="basic-addon1">Name</span>
      <input
        type="text"
        className="form-control add-form-date"
        value={day.name}
        readOnly
        disabled
      />
      <span className="input-group-text" id="basic-addon1">Date</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={day.day}
        readOnly
        disabled
      />
      <button type="submit" className="btn btn-primary"
        onClick={() => removeBirthdayHandler(day.id)}
      >
        <Trash />
      </button>
    </div>
  )

  // const workingContent = workings.map(day =>
  //   <div className="input-group mt-2" key={day.id}>
  //     <input
  //       type="date"
  //       name="deadline"
  //       className="add-form-date"
  //       value={day.day}
  //       readOnly
  //       disabled
  //     />
  //     <button type="submit" className="btn btn-primary"
  //       onClick={() => removeWorkingHandler(day.id)}
  //     >
  //       <Trash />
  //     </button>
  //   </div>
  // )

  const vacationContent = vacations.map(vacation =>
    <div className="input-group mt-2" key={vacation.id}>
      <span className="input-group-text" id="basic-addon1">Name</span>
      <input
        type="text"
        className="form-control add-form-date"
        value={vacation.name}
        readOnly
        disabled
      />
      <span className="noti-options-label input-group-text">From</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={vacation.start}
        readOnly
        disabled
      />
      <span className="noti-options-label input-group-text">To</span>
      <input
        type="date"
        name="deadline"
        className="form-control add-form-date"
        value={vacation.end}
        readOnly
        disabled
      />
      <button type="submit" className="btn btn-primary"
        onClick={() => removeVacationHandler(vacation.id)}
      >
        <Trash />
      </button>
    </div>
  )

  useEffect(() => {
    if (status === Status.Idle) {
      dispatch(getSettings())
    }
  }, [status, dispatch])

  return (
    <div className="settings-item">
      <SettingsHeader title='Date preferences' />
      <div style={{ display: "flex" }}>
        <div className="noti-wrapper">

          <div className="settings-data-item">
            <h3 className="settings-date-header">Transfered days</h3>
            <div className="settings-date-body">
              <div className="noti-options">
                <label className="profile-form-group-label form-label">
                  Create new transfered day
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">Reason</span>
                  <input
                    type="text"
                    name="deadline"
                    style={{ width: "40%" }}
                    className="form-control add-form-date"
                    value={transferName}
                    onChange={transferNameChangeHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">From</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={transferFrom}
                    onChange={transferFromChangeHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">To</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={transferTo}
                    onChange={transferToChangeHandler}
                  />

                  <button type="submit" className="btn btn-primary"
                    onClick={addTransferHandler}
                  >
                    <PlusLg />
                  </button>
                </div>
              </div>
              <div className="noti-options">
                <label className="profile-form-group-label form-label m-0 mt-3">
                  Available transfered days
                </label>
                {transferContent.length ? transferContent : <div className="profile-from-group-descr">There are no transfered days</div>}
              </div>
            </div>
          </div>

          <div className="settings-data-item">
            <h3 className="settings-date-header">Exceptional days</h3>
            <div className="settings-date-body">
              <div className="noti-options">
                <label className="profile-form-group-label form-label">
                  Create new exceptional day
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">Reason</span>
                  <input
                    type="text"
                    name="deadline"
                    style={{ width: "40%" }}
                    className="form-control add-form-date"
                    value={exceptionName}
                    onChange={exceptionNameChangeHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">Date</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={exceptionDate}
                    onChange={exceptionDateChangeHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">Time</span>
                  <input
                    type="text"
                    name="deadline"
                    className="form-control add-form-date"
                    value={exceptionTime}
                    onChange={exceptionTimeChangeHandler}
                  />

                  <button type="submit" className="btn btn-primary"
                    onClick={addExceptionHandler}
                  >
                    <PlusLg />
                  </button>
                </div>
              </div>
              <div className="noti-options">
                <label className="profile-form-group-label form-label m-0 mt-3">
                  Available exceptional days
                </label>
                {exceptionContent.length ? exceptionContent : <div className="profile-from-group-descr">There are no exceptional days</div>}
              </div>
            </div>
          </div>

          <div className="settings-data-item">
            <h3 className="settings-date-header">Holidays</h3>
            <div className="settings-date-body">
              <div className="noti-options">
                <label className="profile-form-group-label form-label">
                  Create new holiday day
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">Name</span>
                  <input
                    type="text"
                    name="deadline"
                    className="form-control add-form-date"
                    value={holidayName}
                    onChange={holidayNameChangeHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">Date</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={holiday}
                    onChange={holidayChangeHandler}
                  />

                  <button type="submit" className="btn btn-primary"
                    onClick={addHolidayHandler}
                  >
                    <PlusLg />
                  </button>
                </div>
              </div>
              <div className="noti-options">
                <label className="profile-form-group-label form-label m-0 mt-3">
                  Available holiday days
                </label>
                {holidayContent.length ? holidayContent : <div className="profile-from-group-descr">There are no holidays</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="noti-wrapper">

          <div className="settings-data-item">
            <h3 className="settings-date-header">Vacation periods</h3>
            <div className="settings-date-body">
              <div className="noti-options">
                <label className="profile-form-group-label form-label">
                  Create new vacation period
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">Name</span>
                  <input
                    type="text"
                    className="form-control add-form-date"
                    value={vacationName}
                    onChange={vacationChangeNameHandler}
                  />
                  <span className="noti-options-label input-group-text">From</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={vacationStart}
                    onChange={vacationStartChangeHandler}
                  />
                  <span className="noti-options-label input-group-text">To</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={vacationEnd}
                    onChange={vacationEndChangeHandler}
                  />
                  <button type="submit" className="btn btn-primary"
                    onClick={addVacationHandler}
                  >
                    <PlusLg />
                  </button>
                </div>
              </div>
              <div className="noti-options">
                <label className="profile-form-group-label mt-3">
                  Available vacation periods
                </label>
                {vacationContent.length ? vacationContent : <div className="profile-from-group-descr">There are no vacation periods</div>}
              </div>
            </div>

          </div>

          <div className="settings-data-item">
            <h3 className="settings-date-header">Birthdays</h3>
            <div className="settings-date-body">
              <div className="noti-options">
                <label className="profile-form-group-label form-label">
                  Create new birthday
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="basic-addon1">Name</span>
                  <input
                    type="text"
                    className="form-control add-form-date"
                    value={birthdayName}
                    onChange={birthdayChangeNameHandler}
                  />
                  <span className="input-group-text" id="basic-addon1">Date</span>
                  <input
                    type="date"
                    name="deadline"
                    className="form-control add-form-date"
                    value={birthday}
                    onChange={birthdayChangeHandler}
                  />
                  <button type="submit" className="btn btn-primary"
                    onClick={addBirthdayHandler}
                  >
                    <PlusLg />
                  </button>
                </div>
              </div>
              <div className="noti-options">
                <label className="profile-form-group-label form-label m-0 mt-3">
                  Available birthdays
                </label>
                {birthdayContent.length ? birthdayContent : <div className="profile-from-group-descr">There are no birthdays</div>}
              </div>
            </div>


          </div>
        </div>
      </div>

    </div>
  )
}

export default DatePage
