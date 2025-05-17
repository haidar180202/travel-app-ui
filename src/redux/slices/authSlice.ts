import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api';

// Interface user, sesuaikan dengan respons API kamu
interface User {
  id: number;
  username: string;
  email: string;
  // tambahkan field lain jika perlu
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  jwt: string;
  user: User;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
};

// Async thunk untuk login
export const loginUser = createAsyncThunk<
  LoginResponse, // tipe return data thunk
  { identifier: string; password: string }, // tipe argumen thunk
  { rejectValue: string } // tipe rejectWithValue
>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/local`, {
        identifier: payload.identifier,
        password: payload.password,
      });
      return response.data as LoginResponse;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Login failed');
      }
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.jwt;

        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.jwt);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
