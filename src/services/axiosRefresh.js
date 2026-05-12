import axios from "axios";

// Cross-tab refresh coordination. Without this, two tabs that hit 401 at the
// same moment each fire their own /refresh-token, then race to write
// localStorage.token. With #7 (server-side jti revocation) in place this race
// also opens a window where one tab's new jti is invalidated by the other's
// before requests in-flight complete.
const CHANNEL_NAME = "auth-refresh";
const REFRESH_TIMEOUT_MS = 15000;
const hasBroadcast = typeof BroadcastChannel !== "undefined";
const channel = hasBroadcast ? new BroadcastChannel(CHANNEL_NAME) : null;

let isRefreshing = false;
let remoteRefreshDeadline = 0;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const remoteRefreshActive = () =>
  remoteRefreshDeadline > 0 && Date.now() < remoteRefreshDeadline;

if (channel) {
  channel.onmessage = (event) => {
    const msg = event.data || {};
    if (msg.type === "refresh-start") {
      remoteRefreshDeadline = Date.now() + REFRESH_TIMEOUT_MS;
    } else if (msg.type === "refresh-done") {
      remoteRefreshDeadline = 0;
      if (msg.token) {
        localStorage.setItem("token", msg.token);
        axios.defaults.headers.common["Authorization"] = "Bearer " + msg.token;
        processQueue(null, msg.token);
      }
    } else if (msg.type === "refresh-failed") {
      remoteRefreshDeadline = 0;
      processQueue(new Error("Refresh failed in another tab"), null);
    }
  };
}

const broadcast = (msg) => {
  if (channel) channel.postMessage(msg);
};

export default function setupAxios(store) {
  // Sync logout across tabs: when another tab clears the token, this tab
  // drops its auth state too. Cheap and avoids the "I'm still authenticated
  // in this tab but the server has me logged out" mismatch.
  window.addEventListener("storage", (e) => {
    if (e.key === "token" && e.newValue === null && e.oldValue) {
      store.dispatch({ type: "auth/logout" });
    }
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          store.dispatch({ type: "auth/logout" });
          return Promise.reject(error);
        }

        if (isRefreshing || remoteRefreshActive()) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;
        broadcast({ type: "refresh-start" });

        try {
          const res = await axios.post("/interns/refresh-token", {
            refreshToken,
          });

          const newToken = res.data.token;

          localStorage.setItem("token", newToken);
          axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;

          processQueue(null, newToken);
          broadcast({ type: "refresh-done", token: newToken });

          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
          broadcast({ type: "refresh-failed" });
          store.dispatch({ type: "auth/logout" });
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
