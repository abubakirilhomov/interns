import axios from "axios";

// Cross-tab refresh coordination. Without this, two tabs that hit 401 at the
// same moment each fire their own /refresh-token request and race. With
// server-side jti revocation in place (Report.md #7), the loser's old jti
// can also get invalidated by the winner's rotation before in-flight
// requests complete.
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
        axios.defaults.headers.common["Authorization"] = "Bearer " + msg.token;
        processQueue(null, msg.token);
      }
    } else if (msg.type === "refresh-failed") {
      remoteRefreshDeadline = 0;
      processQueue(new Error("Refresh failed in another tab"), null);
    } else if (msg.type === "logout") {
      // Another tab logged out — bring this one along.
      // The store is not directly imported here to avoid a circular dep;
      // the storage-key listener still fires through the redux-persist
      // write when the other tab clears state.
    }
  };
}

const broadcast = (msg) => {
  if (channel) channel.postMessage(msg);
};

// Endpoints that must NEVER be retried via refresh. Trying to refresh a
// failing /refresh-token call recurses into this interceptor, queues the
// retry against itself, and deadlocks — silentRefresh never resolves and
// authInitialized stays false forever (the "бесконечная загрузка" symptom
// some users see when their refresh cookie is missing/expired or blocked
// by browser cross-site cookie rules like Safari ITP).
const isAuthEndpoint = (config) => {
  const url = config?.url || "";
  return (
    url.includes("/refresh-token") ||
    url.endsWith("/login") ||
    url.endsWith("/logout")
  );
};

export default function setupAxios(store) {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthEndpoint(originalRequest)
      ) {
        originalRequest._retry = true;

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
          // Cookie is the credential. Migration shim: if a pre-cutover
          // refreshToken is still in localStorage, pass it as body so an
          // active session doesn't get force-logged-out on first 401.
          const legacy = localStorage.getItem("refreshToken");
          const res = await axios.post(
            "/interns/refresh-token",
            legacy ? { refreshToken: legacy } : {}
          );
          if (legacy) {
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("token");
          }

          const newToken = res.data.token;

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
