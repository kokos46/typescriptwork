import {configureStore, type Middleware} from '@reduxjs/toolkit'
import spreadsheetSlice from './slices/spreadsheet.ts'
import uiSlice from './slices/ui.ts'
import documentSlice from './slices/documents.ts'
import authSlice from './slices/auth.ts'
import { autosaveMiddleware } from './middleware/autosave.ts'

export const store = configureStore({
  reducer: {
    spreadsheet: spreadsheetSlice,
    ui: uiSlice,
    document: documentSlice,
    auth: authSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autosaveMiddleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;