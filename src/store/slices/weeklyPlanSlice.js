import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Weekly plan view of the logged-in intern.
// Backend (int-server) computes status / streak / activationsLeft on-the-fly
// from Intern.weeklyPlan + live lesson count for the current week.
// See vault/10-projects/interns-system/weekly-self-activation-plan.md.
export const fetchWeeklyPlan = createAsyncThunk(
  "weeklyPlan/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/interns/me/weekly-plan");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось загрузить недельный план"
      );
    }
  }
);

const weeklyPlanSlice = createSlice({
  name: "weeklyPlan",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  },
  reducers: {
    clearWeeklyPlan: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklyPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchWeeklyPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWeeklyPlan } = weeklyPlanSlice.actions;
export default weeklyPlanSlice.reducer;
