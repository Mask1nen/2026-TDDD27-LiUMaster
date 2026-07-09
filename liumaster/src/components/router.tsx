import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./login.tsx";
import RegisterPage from "./register.tsx";
import Dashboard from "./dashboard.tsx";
import MasterPlanner from "./planner.tsx";
import Layout from "./layout.tsx";
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
		<Routes>
			<Route path="/" element={<Layout />}>
				<Route index element={<Navigate to="/Dashboard" replace />} />
				<Route
					path="Dashboard"
					element={
						<PrivateRoute>
							<Dashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="Planner"
					element={
						<PrivateRoute>
							<MasterPlanner programCode="6CDDD" />
						</PrivateRoute>
					}
				/>
			</Route>
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
	);
}

export default RouterComponent;
