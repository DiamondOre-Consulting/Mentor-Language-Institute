import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "./store";
import "./api/axiosInstance";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Toaster
      richColors
      position="top-center"
      closeButton
      toastOptions={{ closeButton: true }}
    />
    <App />
  </Provider>
);
