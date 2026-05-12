import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface UiState {
  saving: string,
  contextMenu: {
    x: number,
    y: number,
    visible: boolean
  },
  creating: boolean,
  renaming: boolean,
}

const initialState: UiState = {
  saving: '',
  contextMenu: {
    x: 0,
    y: 0,
    visible: false
  },
  creating: false,
  renaming: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaving: (state, action: PayloadAction<string>) => {
      state.saving = action.payload
    },
    setContextMenu: (state, action: PayloadAction<{ x: number, y: number, visible: boolean }>) => {
      state.contextMenu = action.payload
    },
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.creating = action.payload
    },
    setRenaming: (state, action: PayloadAction<boolean>) => {
      state.renaming = action.payload
    }
  }
})

export default uiSlice.reducer;
export const {setSaving, setContextMenu, setCreating, setRenaming} = uiSlice.actions;