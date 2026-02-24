import axios from "./axiosInstance";

export const logout = async (redirectTo = "/login") => {
  try {
    await axios.post("/auth/logout");
  } catch (error) {
    // Ignore logout errors to ensure client clears session
  }
  localStorage.removeItem("token");
  if (redirectTo) {
    window.location.href = redirectTo;
  }
};
