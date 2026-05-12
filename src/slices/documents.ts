import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit'
import {type TableData, setUserData} from "./auth.ts";

interface DocumentsSlice{
  tables: TableData[]
}

const initialState: DocumentsSlice = {
  tables: []
}

const emptyTable = {
  name: '',
  active: false,
  created_at: '',
  updated_at: '',
  N: 26,
  M: 100,
  data: {}
}

export const updateDocumentsAndSync = createAsyncThunk(
  'documents/syncWithAuth',
  async (newTables: TableData[], { dispatch }) => {
    dispatch(setLocalTables(newTables));
    dispatch(setUserData(newTables));
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setLocalTables: (state, action: PayloadAction<TableData[]>) => {
      state.tables = action.payload;
    },
    setActiveTable: (state, action: PayloadAction<{name: string, active: boolean}>) => {
      const {name, active} = action.payload;
      state.tables = state.tables.map(table => {
        if (table.name === name) {
          return {...table, active};
        }
        return table;
      });
    },
    createTable: (state, action: PayloadAction<string>) => {
      const newTable = {
        ...emptyTable,
        name: action.payload,
        created_at: new Date().toISOString(), // Добавляем дату создания
        updated_at: new Date().toISOString()
      };
      state.tables.push(newTable);
    },
    duplicateTable: (state, table: PayloadAction<{
      name: string;
      active: boolean,
      created_at: string,
      updated_at: string,
      N: number,
      M: number,
      data: Record<string, string>;
    }>) => {
      state.tables.push(table.payload);
    },
    renameTable: (state, action: PayloadAction<{name: string, newName: string}>) => {
      const {name, newName} = action.payload;
      state.tables = state.tables.map(table => {
        if (table.name === name) {
          return {...table, name: newName};
        }
        return table;
      });
    },
    deleteTable: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.tables = state.tables.filter(table => table.name !== name);
    },
    setTableData: (state, action: PayloadAction<{name: string, data: Record<string, string>}>) => {
      const {name, data} = action.payload;
      state.tables = state.tables.map(table => {
        if (table.name === name) {
          return {...table, data};
        }
        return table;
      });
    },
  }
})



export default documentsSlice.reducer;
export const {setActiveTable, createTable, duplicateTable, renameTable, deleteTable, setTableData, setLocalTables} = documentsSlice.actions;