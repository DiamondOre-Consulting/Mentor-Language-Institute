import axios from "axios";

// const baseURL = "https://mentor-language-institute-backend-hbyk.onrender.com/api";
const baseURL = "http://localhost:7000/api";

if (!axios.__mlConfigured) {
  axios.__mlConfigured = true;
  axios.defaults.baseURL = baseURL;

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
}

export default axios;
