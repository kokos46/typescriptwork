import {createSlice, type PayloadAction} from '@reduxjs/toolkit'

interface DocumentsSlice{
  tables: {
    name: string;
    active: boolean,
    created_at: string,
    updated_at: string,
    N: number,
    M: number,
    data: Record<string, string>;
  }[],
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

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveTable: (state, action: PayloadAction<{name: string, active: boolean}>) => {
      const {name, active} = action.payload;
      state.tables = state.tables.map(table => {
        if (table.name === name) {
          return {...table, active};
        }
        return table;
      });
    },
    createTable: (state, name: PayloadAction<string>) => {
      const newTable = {
        ...emptyTable,
        name: name.payload,
      }
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
    }
  }
})

export default documentsSlice.reducer;
export const {setActiveTable, createTable, duplicateTable, renameTable, deleteTable} = documentsSlice.actions;