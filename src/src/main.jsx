import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SeasonsProvider } from "./context/SeasonsContext.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <SeasonsProvider>
          <App />
        </SeasonsProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
