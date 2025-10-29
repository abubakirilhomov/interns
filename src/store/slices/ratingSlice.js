import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchRatings = createAsyncThunk("rating/fetchRatings", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/interns/client-rating`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const ratingSlice = createSlice({
  name: "rating",
  initialState: {
    interns: [],
    branches: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.interns = action.payload.interns;
        state.branches = action.payload.branches;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ratingSlice.reducer;
