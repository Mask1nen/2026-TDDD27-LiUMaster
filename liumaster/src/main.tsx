import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LoginPage from "./components/login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoginPage />
  </StrictMode>
);
