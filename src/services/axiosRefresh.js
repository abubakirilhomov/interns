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

export default function setupAxios(store) {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
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
          // No body: refresh cookie is the credential.
          const res = await axios.post("/interns/refresh-token", {});

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
