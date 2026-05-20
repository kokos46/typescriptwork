import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit'

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
}

interface SpreadsheetState {
  currentDocumentId: string | null;
  currentTableIndex: number | null;
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
  cellStyles: Record<string, CellStyle>,
  colWidths: Record<string, number>,
  rowHeights: Record<string, number>,
  updates: Record<string, string>[],
  redoStack: Record<string, string>[]
}

const initialState: SpreadsheetState = {
  currentDocumentId: null,
  currentTableIndex: null,
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
  cellStyles: {},
  colWidths: {},
  rowHeights: {},
  updates: [],
  redoStack: []
}


export const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setCurrentDocumentId: (state, action: PayloadAction<string | null>) => {
      state.currentDocumentId = action.payload
    },
    setCurrentTableIndex: (state, action: PayloadAction<number | null>) => {
      state.currentTableIndex = action.payload
    },
    setTableName: (state, action: PayloadAction<string>) => {
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
    setCellStyles: (state, action: PayloadAction<Record<string, CellStyle>>) => {
      state.cellStyles = action.payload
    },
    toggleCellStyle: (state, action: PayloadAction<{ cellIds: string[], style: keyof CellStyle }>) => {
      const { cellIds, style } = action.payload;
      const shouldEnable = cellIds.some((cellId) => !state.cellStyles[cellId]?.[style]);

      cellIds.forEach((cellId) => {
        state.cellStyles[cellId] = {
          ...state.cellStyles[cellId],
          [style]: shouldEnable
        };
      });
    },
    setColWidths: (state, action: PayloadAction<Record<string, number>>) => {
      state.colWidths = action.payload
    },
    setRowHeights: (state, action: PayloadAction<Record<string, number>>) => {
      state.rowHeights = action.payload
    },

    recordUpdate: (state, action: PayloadAction<{cellId: string, oldValue: string}>) => {
      const { cellId, oldValue } = action.payload;
      state.updates.push({ [cellId]: oldValue });
      state.redoStack = [];
    },
    recordCellsUpdate: (state, action: PayloadAction<Record<string, string>>) => {
      state.updates.push(action.payload);
      state.redoStack = [];
    },

    undo: (state) => {
      const lastUpdate = state.updates.pop();
      if (lastUpdate) {
        const redoUpdate: Record<string, string> = {};
        const nextTableData = { ...state.tableData };

        Object.entries(lastUpdate).forEach(([cellId, oldValue]) => {
          redoUpdate[cellId] = state.tableData[cellId] || "";

          if (oldValue === "") {
            delete nextTableData[cellId];
          } else {
            nextTableData[cellId] = oldValue;
          }
        });

        state.redoStack.push(redoUpdate);
        state.tableData = nextTableData;
      }
    },

    redo: (state) => {
      const nextUpdate = state.redoStack.pop();
      if (nextUpdate) {
        const undoUpdate: Record<string, string> = {};
        const nextTableData = { ...state.tableData };

        Object.entries(nextUpdate).forEach(([cellId, newValue]) => {
          undoUpdate[cellId] = state.tableData[cellId] || "";

          if (newValue === "") {
            delete nextTableData[cellId];
          } else {
            nextTableData[cellId] = newValue;
          }
        });

        state.updates.push(undoUpdate);
        state.tableData = nextTableData;
      }
    }
  }
})

interface ThunkApiConfig {
  state: {
    spreadsheet: SpreadsheetState;
  };
  rejectValue: string;
}

export const saveDocumentThunk = createAsyncThunk<void, string, ThunkApiConfig>(
  'document/saveToBackend',
  async (id: string, { getState, rejectWithValue }) => {
    // Используем typeof для получения типа стейта без прямого импорта RootState
    const state = getState();
    const { tableData, cellStyles, size, tableName } = state.spreadsheet;

    try {
      const response = await fetch(`http://127.0.0.1:8000/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tableName || "Без названия",
          data: tableData,
          cellStyles,
          N: size.N,
          M: size.M,
          updated_at: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Server error');
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);



export default spreadsheetSlice.reducer;
export const {
  setCurrentDocumentId,
  setCurrentTableIndex,
  setTableName,
  setSize,
  setEditable,
  setIsEditable,
  setSelectedCells,
  setAnchorCell,
  setSelectedCellData,
  setTableData,
  setCellStyles,
  toggleCellStyle,
  setColWidths,
  setRowHeights,
  undo,
  redo,
  recordUpdate,
  recordCellsUpdate
} = spreadsheetSlice.actions;
