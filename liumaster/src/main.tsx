import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RouterComponent from "./components/router.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/UserAuthContext.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<RouterComponent />
			</BrowserRouter>
		</AuthProvider>
	</StrictMode>
);
