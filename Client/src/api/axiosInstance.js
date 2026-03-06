import axios from "axios";

// const baseURL = "https://mentor-language-institute-backend-hbyk.onrender.com/api";
const baseURL = "http://localhost:7000/api";

if (!axios.__mlConfigured) {
  axios.__mlConfigured = true;
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  let isRefreshing = false;
  let refreshPromise = null;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config;
      const status = error?.response?.status;
      const requestUrl = originalRequest?.url || "";

      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        requestUrl.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = axios
            .post("/auth/refresh")
            .then((res) => {
              if (res?.data?.token) {
                localStorage.setItem("token", "session");
              }
              return res?.data?.token;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        await refreshPromise;
        if (originalRequest.headers?.Authorization) {
          delete originalRequest.headers.Authorization;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        return Promise.reject(refreshError);
      }
    }
  );
}

export default axios;
