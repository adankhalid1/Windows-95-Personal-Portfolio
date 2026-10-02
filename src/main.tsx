import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@react95/core/themes/win95.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
