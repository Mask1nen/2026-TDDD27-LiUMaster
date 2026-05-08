import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.ts";
import NavBar from "./navbar.tsx";
import LoginPage from "./login.tsx";
import RegisterPage from "./register.tsx";
import Dashboard from "./dashboard.tsx";

function RouterComponent() {
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is logged in
				console.log("User is active:", user.uid);
			} else {
				// User is logged out, send them to login
				navigate("/login");
			}
		});

		// Cleanup the listener when the component unmounts
		return () => unsubscribe();
	}, [auth, navigate]);

	return (
		<>
			<div className="bg-[#98E5EB]">
				<NavBar />
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/Login" element={<LoginPage />} />
					<Route path="/Register" element={<RegisterPage />} />
				</Routes>
			</div>
		</>
	);
}

export default RouterComponent;
