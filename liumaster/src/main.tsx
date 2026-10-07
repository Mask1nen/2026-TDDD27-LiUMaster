import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RouterComponent from "./components/router.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/UserAuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouterComponent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
