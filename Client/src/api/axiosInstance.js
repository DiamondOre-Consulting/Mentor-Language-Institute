import axios from "axios";

// const baseURL = "https://mentor-language-institute-backend-hbyk.onrender.com/api";
const baseURL = "http://localhost:7000/api";

if (!axios.__mlConfigured) {
  axios.__mlConfigured = true;
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token && !config.headers?.Authorization) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

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
              const newToken = res?.data?.token;
              if (newToken) {
                localStorage.setItem("token", newToken);
              }
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
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
