import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './i18n'
import './index.css'
import { registerSW } from "virtual:pwa-register";

import setupAxios from "./services/axiosRefresh.js";
import store from "./store/index.js";
import { initErrorReporter } from "./utils/errorReporter.js";

registerSW({ immediate: true });

setupAxios(store);

// Раньше падение фронта не покидало браузер пользователя: единственный
// console.error в ErrorBoundary в прод-сборке вырезается (esbuild.drop).
initErrorReporter({
  app: "interns",
  endpoint: import.meta.env.VITE_API_URL,
  release: import.meta.env.VITE_RELEASE,
  getToken: () => store.getState().auth.token,
  getUser: () => store.getState().auth.user?.username || null,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
