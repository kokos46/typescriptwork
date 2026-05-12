import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Выносим интерфейс таблицы, чтобы экспортировать его
export interface TableData {
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  N: number;
  M: number;
  data: Record<string, string>;
}

interface AuthState {
  username: string;
  tables: TableData[];
}

const initialState: AuthState = {
  username: '',
  tables: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setUserData: (state, action: PayloadAction<TableData[]>) => {
      state.tables = action.payload;
    }
  }
});

export default authSlice.reducer;
export const { setUsername, setUserData } = authSlice.actions;