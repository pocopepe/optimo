// src/store/patientsSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PatientDetail } from '../types';
import type { PayloadAction } from '@reduxjs/toolkit';


interface PatientsState {
  patients: PatientDetail[];
}

const initialState: PatientsState = {
  patients: [],
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setPatients(state, action: PayloadAction<PatientDetail[]>) {
      state.patients = action.payload;
    },
    clearPatients(state) {
      state.patients = [];
    },
  },
});

export const { setPatients, clearPatients } = patientsSlice.actions;

export default patientsSlice.reducer;
