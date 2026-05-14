import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./navbar.tsx";
import LoginPage from "./login.tsx";
import RegisterPage from "./register.tsx";
import Dashboard from "./dashboard.tsx";
import { useAuth } from "../context/UserAuthContext.tsx";

function PublicRoute({ children }) {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (user) return <Navigate to="/" replace />;
	return children;
}

function PrivateRoute({ children }) {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/Login" replace />;
	return children;
}

function RouterComponent() {
	return (
		<>
			<div className="bg-[#98E5EB]">
				<NavBar />
				<Routes>
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/Login"
						element={
							<PublicRoute>
								<LoginPage />
							</PublicRoute>
						}
					/>
					<Route
						path="/Register"
						element={
							<PublicRoute>
								<RegisterPage />
							</PublicRoute>
						}
					/>
				</Routes>
			</div>
		</>
	);
}

export default RouterComponent;
