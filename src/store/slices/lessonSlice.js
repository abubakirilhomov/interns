import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create lesson
export const createLesson = createAsyncThunk(
  "lessons/createLesson",
  async (lessonData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/lessons`, lessonData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Ошибка при создании урока");
    }
  }
);

// Get lessons
export const fetchLessons = createAsyncThunk(
  "lessons/fetchLessons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/lessons`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Ошибка при загрузке уроков");
    }
  }
);

const lessonsSlice = createSlice({
  name: "lessons",
  initialState: {
    lessons: [],
    isLoading: false,
    error: null,
    success: false, // Added success state
  },
  reducers: {
    resetLessonState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create lesson
      .addCase(createLesson.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.lessons.push(action.payload);
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch lessons
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLessonState } = lessonsSlice.actions;
export default lessonsSlice.reducer;