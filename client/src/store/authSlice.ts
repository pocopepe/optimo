// src/redux/authSlice.ts
import { createSlice,  } from '@reduxjs/toolkit';
import type { AuthenticatedRoleData } from '../types';
import type { PayloadAction } from '@reduxjs/toolkit';


interface AuthState {
  authenticatedRoleData: AuthenticatedRoleData | null;
}

const initialState: AuthState = {
  authenticatedRoleData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedRoleData(state, action: PayloadAction<AuthenticatedRoleData>) {
      state.authenticatedRoleData = action.payload;
    },
    clearAuthenticatedRoleData(state) {
      state.authenticatedRoleData = null;
    },
  },
});

export const { setAuthenticatedRoleData, clearAuthenticatedRoleData } = authSlice.actions;

export default authSlice.reducer;
