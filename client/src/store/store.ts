import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import patientsReducer from './patientsSlice';  // Import your new slice

const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientsReducer,  // Add it here
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
