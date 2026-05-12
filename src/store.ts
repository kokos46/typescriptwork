import { configureStore } from '@reduxjs/toolkit'
import spreadsheetSlice from './slices/spreadsheet.ts'
import uiSlice from './slices/ui.ts'

export const store = configureStore({
  reducer: {
    spreadsheet: spreadsheetSlice,
    ui: uiSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;