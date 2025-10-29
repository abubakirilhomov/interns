import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage по умолчанию
import authReducer from "./slices/authSlice";
import lessonsReducer from "./slices/lessonSlice";
import uiReducer from "./slices/uiSlice";
import ratingReducer from "./slices/ratingSlice"

// Конфиг для persist
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["auth"], // сохраняем только auth (например токены, юзер)
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    lessons: lessonsReducer,
    ui: uiReducer,
    rating: ratingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
