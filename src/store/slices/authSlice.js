import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL - adjust according to your backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Set token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Inject X-Active-Branch on every request
axios.interceptors.request.use((config) => {
  const activeBranch = localStorage.getItem("activeBranchId");
  if (activeBranch) {
    config.headers["X-Active-Branch"] = activeBranch;
  }
  return config;
});

// Async thunks
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/interns/verify-token");
      return response.data;
    } catch (error) {
      setAuthToken(null);
      return rejectWithValue(error.response?.data?.error || "Invalid token");
    }
  }
);

export const loginIntern = createAsyncThunk(
  "auth/loginIntern",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/interns/login", {
        username,
        password,
      });
      const { token, user, refreshToken } = response.data;

      setAuthToken(token);
      return { token, refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Ошибка при входе");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user?._id) {
        return rejectWithValue("User not authenticated");
      }
      const response = await axios.patch(
        `/interns/me/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Ошибка при обновлении профиля"
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user?._id) {
        return rejectWithValue("User not authenticated");
      }

      const response = await axios.get(`/interns/${auth.user._id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка при загрузке профиля"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    needsBranchSelect: false,
    pendingLoginData: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.needsBranchSelect = false;
      state.pendingLoginData = null;
      state.error = null;
      setAuthToken(null);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("activeBranchId");
    },
    clearError: (state) => {
      state.error = null;
    },
    selectBranch: (state, action) => {
      const branchId = action.payload;
      localStorage.setItem("activeBranchId", String(branchId));
      const data = state.pendingLoginData;
      setAuthToken(data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      state.isAuthenticated = true;
      state.needsBranchSelect = false;
      state.token = data.token;
      state.refreshToken = data.refreshToken;
      state.user = data.user;
      state.pendingLoginData = null;
    },
    setSession: (state, action) => {
      const data = action.payload || {};
      const branchIds = data.user?.branchIds || [];
      if (branchIds.length > 1) {
        state.needsBranchSelect = true;
        state.pendingLoginData = data;
        return;
      }
      const branchId = data.user?.branchId || branchIds[0] || null;
      if (branchId) localStorage.setItem("activeBranchId", String(branchId));
      localStorage.setItem("refreshToken", data.refreshToken);
      setAuthToken(data.token);
      state.token = data.token;
      state.refreshToken = data.refreshToken;
      state.user = data.user;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Token
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(loginIntern.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginIntern.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const data = action.payload;
        const branchIds = data.user?.branchIds || [];

        if (branchIds.length > 1) {
          state.needsBranchSelect = true;
          state.pendingLoginData = data;
        } else {
          const branchId = data.user?.branchId || branchIds[0] || null;
          if (branchId) localStorage.setItem("activeBranchId", String(branchId));
          localStorage.setItem("refreshToken", data.refreshToken);
          setAuthToken(data.token);
          state.token = data.token;
          state.refreshToken = data.refreshToken;
          state.user = data.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginIntern.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Initialize token validation on app load
const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

export const { logout, clearError, selectBranch, setSession } = authSlice.actions;
export default authSlice.reducer;
