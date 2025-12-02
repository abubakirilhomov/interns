import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from "virtual:pwa-register";

import setupAxios from "./services/axiosRefresh.js";
import store from "./store/index.js";

registerSW({ immediate: true });

setupAxios(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
