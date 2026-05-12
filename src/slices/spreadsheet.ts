import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SpreadsheetState {
  tableName: string;
  created_at: string,
  updated_at: string,
  size: {
    N: number,
    M: number
  }
  tableData: Record<string, string>,
  editable: string,
  isEditable: boolean,
  selectedCells: string[],
  anchorCell?: { r: number, c: number } | null,
  selectedCellData: string,
  colWidths: Record<string, number>,
  rowHeights: Record<string, number>,
}

const initialState: SpreadsheetState = {
  tableName: '',
  created_at: '',
  updated_at: '',
  size:{
    N: 26,
    M: 100
  },
  tableData: {},
  editable: '',
  isEditable: false,
  selectedCells: [],
  anchorCell: null,
  selectedCellData: '',
  colWidths: {},
  rowHeights: {},
}

export const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.tableName = action.payload
    },
    setSize: (state, action: PayloadAction<{ N: number, M: number }>) => {
      state.size = action.payload
    },
    setEditable: (state, action: PayloadAction<string>) => {
      state.editable = action.payload
    },
    setIsEditable: (state, action: PayloadAction<boolean>) => {
      state.isEditable = action.payload
    },
    setSelectedCells: (state, action: PayloadAction<string[]>) => {
      state.selectedCells = action.payload
    },
    setAnchorCell: (state, action: PayloadAction<{ r: number, c: number }>) => {
      state.anchorCell = action.payload
    },
    setSelectedCellData: (state, action: PayloadAction<string>) => {
      state.selectedCellData = action.payload
    },
    setTableData: (state, action: PayloadAction<Record<string, string>>) => {
      state.tableData = action.payload
    },
    setColWidths: (state, action: PayloadAction<Record<string, number>>) => {
      state.colWidths = action.payload
    },
    setRowHeights: (state, action: PayloadAction<Record<string, number>>) => {
      state.rowHeights = action.payload
    }
  }
})

export default spreadsheetSlice.reducer;
export const { setName,
  setSize,
  setEditable,
  setIsEditable,
  setSelectedCells,
  setAnchorCell,
  setSelectedCellData,
  setTableData,
  setColWidths,
  setRowHeights} = spreadsheetSlice.actions;