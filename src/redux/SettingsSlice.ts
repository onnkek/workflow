import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Status } from "../models/Status"
import { INote } from "../models/Note"
import IFolder from "../models/Folder"
import PlannerAPIService from "../services/PlannerAPIService"
import { RootState } from "./store"
import { IWidget } from "./WidgetsSlice"

export interface IWeekend {
  highlight: boolean
}

export interface IWorking {
  id: number
  day: string
}

export interface IVacation {
  id: number
  start: string
  end: string
  name: string
}

export interface IHoliday {
  id: number
  day: string
  name: string
}
export interface ITransfer {
  id: number
  from: string,
  to: string,
  name: string
}
export interface IException {
  id: number
  date: string
  time: number
  name: string
}

export interface IBirthday {
  id: number
  day: string
  name: string
}

export interface IDate {
  holidays: IHoliday[]
  birthdays: IBirthday[]
  vacations: IVacation[]
  transfers: ITransfer[]
  exceptions: IException[]
}



interface ISettings {
  auth: boolean
  date: IDate
  status: Status
  settingStatus: Status
  position: { x: number, y: number }
  removing: number[]
  addStatus: Status
  statusSavePost: Status
  contextMenu: boolean
  contextMenuPosition: { x: number, y: number }
  iconsMenu: boolean
  iconsMenuPosition: { x: number, y: number }
  selectItem: INote | IFolder | undefined
}

const initialState: ISettings = {
  auth: false,
  date: {
    holidays: [],
    birthdays: [],
    vacations: [],
    transfers: [],
    exceptions: []
  },
  position: { x: 0, y: 0 },
  status: Status.Idle,
  settingStatus: Status.Idle,
  removing: [],
  addStatus: Status.Idle,
  statusSavePost: Status.Idle,
  contextMenu: false,
  contextMenuPosition: { x: 0, y: 0 },
  iconsMenu: false,
  iconsMenuPosition: { x: 0, y: 0 },
  selectItem: undefined
}

const SettingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettingStatusIdle(state) {
      console.log("setIdle")
      state.settingStatus = Status.Idle
    }
  },
  extraReducers(builder) {
    builder

      .addCase(getSettings.pending, (state: ISettings) => {
        state.status = Status.Loading
      })
      .addCase(getSettings.fulfilled, (state: ISettings, action) => {
        state.status = Status.Succeeded
        state.date = action.payload.date

      })
      .addCase(getSettings.rejected, (state: ISettings, action) => {
        state.status = Status.Failed
      })


      .addCase(addHoliday.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(addHoliday.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.holidays.push(action.payload)
      })
      .addCase(addHoliday.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(addTransfer.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(addTransfer.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.transfers.push(action.payload)
      })
      .addCase(addTransfer.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(addException.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(addException.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.exceptions.push(action.payload)
      })
      .addCase(addException.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(addBirthday.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(addBirthday.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.birthdays.push(action.payload)
      })
      .addCase(addBirthday.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(removeHoliday.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(removeHoliday.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.holidays = action.payload
      })
      .addCase(removeHoliday.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(removeTransfer.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(removeTransfer.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.transfers = action.payload
      })
      .addCase(removeTransfer.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      // .addCase(removeException.pending, (state: ISettings) => {
      //   state.settingStatus = Status.Loading
      // })
      // .addCase(removeException.fulfilled, (state: ISettings, action) => {
      //   state.settingStatus = Status.Succeeded
      //   state.date.exceptions = action.payload
      // })
      // .addCase(removeException.rejected, (state: ISettings, action) => {
      //   state.settingStatus = Status.Failed
      // })

      .addCase(removeBirthday.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(removeBirthday.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.birthdays = action.payload
      })
      .addCase(removeBirthday.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })


      .addCase(addVacation.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
        console.log("addVacation.pending")
      })
      .addCase(addVacation.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.vacations.push(action.payload)
        console.log("addVacation.fulfilled")
      })
      .addCase(addVacation.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
        console.log("addVacation.rejected")
      })

      .addCase(removeVacation.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(removeVacation.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.date.vacations = action.payload
      })
      .addCase(removeVacation.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })

      .addCase(tryAuth.pending, (state: ISettings) => {
        state.settingStatus = Status.Loading
      })
      .addCase(tryAuth.fulfilled, (state: ISettings, action) => {
        state.settingStatus = Status.Succeeded
        state.auth = true
      })
      .addCase(tryAuth.rejected, (state: ISettings, action) => {
        state.settingStatus = Status.Failed
      })


  }
})

export const getSettings = createAsyncThunk(
  'settings/getSettings',

  async () => {
    return await new PlannerAPIService().getSettings()
  })


export const tryAuth = createAsyncThunk<boolean, { password: string }, { state: RootState }>(

  'settings/tryAuth',
  async (payload: { password: string }, { rejectWithValue, getState, dispatch }) => {


    const response = await new PlannerAPIService().tryAuth({ password: payload.password })
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return true;
  }
)

export const changeWeekend = createAsyncThunk<IWeekend, IWeekend, { state: RootState }>(

  'settings/changeWeekend',
  async (payload: IWeekend, { rejectWithValue, getState, dispatch }) => {

    const newWeekend: IWeekend = {
      highlight: payload.highlight
    }
    const response = await new PlannerAPIService().updateWeekend(newWeekend)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newWeekend

  }
)

export const addHoliday = createAsyncThunk<IHoliday, { day: string, name: string }, { state: RootState }>(

  'settings/addHoliday',
  async (payload: { day: string, name: string }, { rejectWithValue, getState, dispatch }) => {

    const newHoliday: IHoliday = {
      id: Math.random(),
      day: payload.day,
      name: payload.name
    }
    const response = await new PlannerAPIService().addHoliday(newHoliday)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newHoliday

  }
)

export const addTransfer = createAsyncThunk<ITransfer, { from: string, to: string, name: string }, { state: RootState }>(

  'settings/addTransfer',
  async (payload: { from: string, to: string, name: string }, { rejectWithValue, getState, dispatch }) => {

    const newTransfer: ITransfer = {
      id: Math.random(),
      from: payload.from,
      to: payload.to,
      name: payload.name
    }
    const response = await new PlannerAPIService().addTransfer(newTransfer)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newTransfer

  }
)

export const addException = createAsyncThunk<IException, { date: string, time: number, name: string }, { state: RootState }>(

  'settings/addException',
  async (payload: { date: string, time: number, name: string }, { rejectWithValue, getState, dispatch }) => {

    const newException: IException = {
      id: Math.random(),
      date: payload.date,
      time: payload.time,
      name: payload.name
    }
    const response = await new PlannerAPIService().addException(newException)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newException

  }
)

export const addBirthday = createAsyncThunk<IBirthday, { day: string, name: string }, { state: RootState }>(

  'settings/addBirthday',
  async (payload: { day: string, name: string }, { rejectWithValue, getState, dispatch }) => {

    const newBirthday: IBirthday = {
      id: Math.random(),
      day: payload.day,
      name: payload.name
    }
    const response = await new PlannerAPIService().addBirthday(newBirthday)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newBirthday

  }
)

export const removeHoliday = createAsyncThunk<IHoliday[], IHoliday, { state: RootState }>(

  'settings/removeHoliday',
  async (payload: IHoliday, { rejectWithValue, getState, dispatch }) => {

    const state = getState().settings.date.holidays
    const index = state.findIndex((holiday) => holiday.id === payload.id)
    const newHolidays = [...state.slice(0, index), ...state.slice(index + 1)]

    const response = await new PlannerAPIService().removeHoliday(payload.id)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newHolidays
  }
)

export const removeTransfer = createAsyncThunk<ITransfer[], ITransfer, { state: RootState }>(

  'settings/removeTransfer',
  async (payload: ITransfer, { rejectWithValue, getState, dispatch }) => {

    const state = getState().settings.date.transfers
    const index = state.findIndex((transfer) => transfer.id === payload.id)
    const newTransfers = [...state.slice(0, index), ...state.slice(index + 1)]

    const response = await new PlannerAPIService().removeTransfer(payload.id)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newTransfers
  }
)

export const removeException = createAsyncThunk<IException[], IException, { state: RootState }>(

  'settings/removeTransfer',
  async (payload: IException, { rejectWithValue, getState, dispatch }) => {

    const state = getState().settings.date.exceptions
    const index = state.findIndex((exception) => exception.id === payload.id)
    const newExceptions = [...state.slice(0, index), ...state.slice(index + 1)]

    const response = await new PlannerAPIService().removeException(payload.id)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newExceptions
  }
)

export const removeBirthday = createAsyncThunk<IBirthday[], IBirthday, { state: RootState }>(

  'settings/removeBirthday',
  async (payload: IBirthday, { rejectWithValue, getState, dispatch }) => {

    const state = getState().settings.date.birthdays
    const index = state.findIndex((birthday) => birthday.id === payload.id)
    const newBirthdays = [...state.slice(0, index), ...state.slice(index + 1)]

    const response = await new PlannerAPIService().removeBirthday(payload.id)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newBirthdays
  }
)

export const addWorking = createAsyncThunk<IWorking, string, { state: RootState }>(

  'settings/addWorking',
  async (payload: string, { rejectWithValue, getState, dispatch }) => {

    const newWorking: IWorking = {
      id: Math.random(),
      day: payload
    }
    const response = await new PlannerAPIService().addWorking(newWorking)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newWorking

  }
)

// export const removeWorking = createAsyncThunk<IWorking[], IWorking, { state: RootState }>(

//   'settings/removeWorking',
//   async (payload: IWorking, { rejectWithValue, getState, dispatch }) => {

//     const state = getState().settings.date.workings
//     const index = state.findIndex((working) => working.id === payload.id)
//     const newWorkings = [...state.slice(0, index), ...state.slice(index + 1)]

//     const response = await new PlannerAPIService().removeWorking(payload.id)
//     if (!response.ok) {
//       return rejectWithValue('Can\'t delete post! Server error!')
//     }
//     setTimeout(() => {
//       dispatch(setSettingStatusIdle())
//     }, 1000)
//     return newWorkings
//   }
// )

type PayloadType = {
  start: string
  end: string,
  name: string
}

export const addVacation = createAsyncThunk<IVacation, PayloadType, { state: RootState }>(

  'settings/addVacation',
  async (payload: PayloadType, { rejectWithValue, getState, dispatch }) => {

    const newVacation: IVacation = {
      id: Math.random(),
      start: payload.start,
      end: payload.end,
      name: payload.name
    }

    const response = await new PlannerAPIService().addVacation(newVacation)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newVacation

  }
)

export const removeVacation = createAsyncThunk<IVacation[], IVacation, { state: RootState }>(

  'settings/removeVacation',
  async (payload: IVacation, { rejectWithValue, getState, dispatch }) => {

    const state = getState().settings.date.vacations
    const index = state.findIndex((vacation) => vacation.id === payload.id)
    const newVacations = [...state.slice(0, index), ...state.slice(index + 1)]

    const response = await new PlannerAPIService().removeVacation(payload.id)
    if (!response.ok) {
      return rejectWithValue('Can\'t delete post! Server error!')
    }
    setTimeout(() => {
      dispatch(setSettingStatusIdle())
    }, 1000)
    return newVacations
  }
)


export const {
  setSettingStatusIdle
} = SettingsSlice.actions
export default SettingsSlice.reducer