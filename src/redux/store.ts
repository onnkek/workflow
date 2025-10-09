import { configureStore } from '@reduxjs/toolkit'
import TasksReducer from './TasksSlice'
import BadgesReducer from './BadgesSlice'
import NotesReducer from './NotesSlice'
import WeatherReducer from './WeatherSlice'
import SettingsReducer from './SettingsSlice'
import WidgetsReducer from './WidgetsSlice'

const store = configureStore({
    reducer: {
        tasks: TasksReducer,
        badges: BadgesReducer,
        notes: NotesReducer,
        weather: WeatherReducer,
        settings: SettingsReducer,
        widgets: WidgetsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store