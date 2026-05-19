import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import * as authService from "../api/authService.ts";

export interface User {
  id: string;
  username?: string;
  email: string;
}

export interface TableData {
  id: string;
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
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  loginStatus: 'idle' | 'loading';
  error: string | null;
}

const initialState: AuthState = {
  username: '',
  user: null,
  status: 'idle',
  loginStatus: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({email, password}: {email: string; password: string}) => {
    return authService.login(email, password);
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({username, email, password}: {username: string; email: string; password: string}) => {
    return authService.register(username, email, password);
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, {rejectWithValue}) => {
    const accessToken = await authService.refreshAccessToken();

    if (!accessToken) {
      return rejectWithValue('No refresh token');
    }

    return authService.getCurrentUser();
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.username = '';
      state.user = null;
      state.status = 'anonymous';
      state.loginStatus = 'idle';
      state.error = null;
      authService.clearAuthTokens();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.username = action.payload.user.email;
        state.user = action.payload.user;
        state.status = 'authenticated';
        state.loginStatus = 'idle';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'anonymous';
        state.loginStatus = 'idle';
        state.error = action.error.message || 'Ошибка входа';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.username = '';
        state.user = null;
        state.status = 'anonymous';
        state.loginStatus = 'idle';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.error.message || 'Ошибка регистрации';
      })
      .addCase(restoreSession.pending, (state) => {
        if (state.status !== 'authenticated') {
          state.status = 'loading';
        }
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.username = action.payload.email;
        state.user = action.payload;
        state.status = 'authenticated';
        state.loginStatus = 'idle';
      })
      .addCase(restoreSession.rejected, (state) => {
        if (state.user || state.loginStatus === 'loading') {
          return;
        }

        state.username = '';
        state.user = null;
        state.status = 'anonymous';
        state.loginStatus = 'idle';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.username = '';
        state.user = null;
        state.status = 'anonymous';
        state.loginStatus = 'idle';
        state.error = null;
      });
  }
});

export default authSlice.reducer;
export const {clearAuthState} = authSlice.actions;
