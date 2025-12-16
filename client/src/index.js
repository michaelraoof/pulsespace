import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
// import "react-toastify/dist/ReactToastify.css"; //import react toastify in _app.js
import "semantic-ui-css/semantic.min.css"; //semantic ui css package
import CssBaseline from "@mui/material/CssBaseline";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <CssBaseline />
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
