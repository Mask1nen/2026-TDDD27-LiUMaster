import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RouterComponent from "./components/router.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<RouterComponent />
		</BrowserRouter>
	</StrictMode>
);
