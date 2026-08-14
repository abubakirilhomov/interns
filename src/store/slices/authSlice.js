import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

axios.defaults.baseURL = API_URL;
// Refresh cookie is on the API origin; we're cross-origin, so credentials
// must be opt-in on every request (login, refresh, logout, normal API calls).
axios.defaults.withCredentials = true;

// Access token now lives only in axios.defaults.headers + Redux state.
// Refresh token rides the httpOnly cookie set by the backend.
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

axios.interceptors.request.use((config) => {
  const activeBranch = localStorage.getItem("activeBranchId");
  if (activeBranch) {
    config.headers["X-Active-Branch"] = activeBranch;
  }
  return config;
});

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

// Cold-boot rehydration: POST /interns/refresh-token with the httpOnly
// cookie. On 200 we hydrate the in-memory access token; on 401 the user
// has to log in again.
//
// Migration shim: a session from before the cookie cutover still has its
// refresh token in localStorage. We pass it as body fallback exactly once;
// on success the backend rotates and sets the cookie, after which we
// clean up the legacy keys so the next refresh is cookie-only.
export const silentRefresh = createAsyncThunk(
  "auth/silentRefresh",
  async (_, { rejectWithValue }) => {
    const legacy = localStorage.getItem("refreshToken");
    try {
      const response = await axios.post(
        "/interns/refresh-token",
        legacy ? { refreshToken: legacy } : {}
      );
      if (legacy) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
      }
      return response.data?.token || null;
    } catch (error) {
      // If even the legacy fallback failed there's nothing to recover.
      if (legacy) {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
      }
      return rejectWithValue(error.response?.status || "network");
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
      const { token, user } = response.data;

      setAuthToken(token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Ошибка при входе");
    }
  }
);

export const logoutIntern = createAsyncThunk(
  "auth/logoutIntern",
  async () => {
    try {
      await axios.post("/interns/logout", {});
    } catch {
      // Server may be unreachable; we still tear down local state.
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

// One-time participant survey. Submitted from the dashboard modal. After
// success the user blob gets surveyCompleted=true so the modal won't show
// again on subsequent loads.
export const submitInternshipSurvey = createAsyncThunk(
  "auth/submitInternshipSurvey",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/interns/me/survey", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Не удалось сохранить ответы"
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

const clearLocalSession = (state) => {
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  state.needsBranchSelect = false;
  state.pendingLoginData = null;
  state.error = null;
  setAuthToken(null);
  localStorage.removeItem("activeBranchId");
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    authInitialized: false,
    needsBranchSelect: false,
    pendingLoginData: null,
  },
  reducers: {
    // Forced local logout: used by axiosRefresh when refresh fails. Does
    // NOT call the server (we're already unauthorized).
    logout: (state) => {
      clearLocalSession(state);
      state.authInitialized = true;
    },
    markAuthInitialized: (state) => {
      state.authInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    selectBranch: (state, action) => {
      const branchId = action.payload;
      localStorage.setItem("activeBranchId", String(branchId));
      const data = state.pendingLoginData;
      setAuthToken(data.token);
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.needsBranchSelect = false;
      state.token = data.token;
      state.user = data.user;
      state.pendingLoginData = null;
    },
    // Runtime branch switch (post-login). Caller is expected to reload the
    // page after dispatch so all slices refetch with the new X-Active-Branch
    // header. Rejected silently if the id is not in the user's allowed list.
    switchActiveBranch: (state, action) => {
      const branchId = String(action.payload);
      const allowed = (state.user?.branchIds || []).map(String);
      if (!allowed.includes(branchId)) return;
      localStorage.setItem("activeBranchId", branchId);
      state.user = { ...state.user, activeBranchId: branchId };
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
      setAuthToken(data.token);
      state.token = data.token;
      state.user = data.user;
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Belt-and-suspenders against legacy persisted blobs that contain a
      // stale `token` field. With the new whitelist redux-persist already
      // skips it, but this clears any in-flight contamination.
      .addCase("persist/REHYDRATE", (state) => {
        state.token = null;
        state.isAuthenticated = Boolean(state.user);
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authInitialized = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.authInitialized = true;
      })
      .addCase(silentRefresh.fulfilled, (state, action) => {
        if (action.payload) {
          setAuthToken(action.payload);
          state.token = action.payload;
          state.isAuthenticated = Boolean(state.user);
        }
        state.authInitialized = true;
      })
      .addCase(silentRefresh.rejected, (state) => {
        clearLocalSession(state);
        state.authInitialized = true;
      })
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
          setAuthToken(data.token);
          state.token = data.token;
          state.user = data.user;
          state.isAuthenticated = true;
          state.authInitialized = true;
        }
      })
      .addCase(loginIntern.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(logoutIntern.fulfilled, (state) => {
        clearLocalSession(state);
        state.authInitialized = true;
      })
      .addCase(logoutIntern.rejected, (state) => {
        clearLocalSession(state);
        state.authInitialized = true;
      })
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
      })
      .addCase(submitInternshipSurvey.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.user = {
          ...state.user,
          surveyCompleted: true,
          internshipSurvey: payload.internshipSurvey || { submittedAt: new Date().toISOString() },
        };
      });
  },
});

export const { logout, clearError, selectBranch, switchActiveBranch, setSession, markAuthInitialized } = authSlice.actions;
export default authSlice.reducer;
