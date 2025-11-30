import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todayAttendance: null,
  history: [],
  summary: null,
  teamData: [],
  loading: false,
  error: null
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTodayAttendance: (state, action) => {
      state.todayAttendance = action.payload;
      state.loading = false;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
      state.loading = false;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
      state.loading = false;
    },
    setTeamData: (state, action) => {
      state.teamData = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setTodayAttendance,
  setHistory,
  setSummary,
  setTeamData,
  clearError
} = attendanceSlice.actions;

export default attendanceSlice.reducer;