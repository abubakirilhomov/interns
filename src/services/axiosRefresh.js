import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });

  failedQueue = [];
};

export default function setupAxios(store) {
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

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const res = await axios.post("/interns/refresh-token", {
            refreshToken,
          });

          const newToken = res.data.token;

          localStorage.setItem("token", newToken);
          axios.defaults.headers.common["Authorization"] =
            "Bearer " + newToken;

          processQueue(null, newToken);

          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
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
