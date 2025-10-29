import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage по умолчанию
import authReducer from "./slices/authSlice";
import lessonsReducer from "./slices/lessonSlice";
import uiReducer from "./slices/uiSlice";
import ratingReducer from "./slices/ratingSlice"

// Конфиг для persist auth
const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["isLoading", "error"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Конфиг для persist ui (только theme)
const uiPersistConfig = {
  key: "ui",
  storage,
  whitelist: ["theme"], // Сохраняем только theme, sidebarOpen и notifications не persists (они transient)
};

const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    lessons: lessonsReducer,
    ui: persistedUiReducer,
    rating: ratingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/PAUSE", "persist/PURGE", "persist/REGISTER"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;