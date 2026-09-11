import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  isLoading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.token = action.payload;
      state.isLoading = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    }
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
