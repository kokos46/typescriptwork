import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface UiState {
  saving: string,
  contextMenu: {
    x: number,
    y: number,
    visible: boolean
  }
}

const initialState: UiState = {
  saving: '',
  contextMenu: {
    x: 0,
    y: 0,
    visible: false
  }
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
    }
  }
})

export default uiSlice.reducer;
export const {setSaving, setContextMenu} = uiSlice.actions;