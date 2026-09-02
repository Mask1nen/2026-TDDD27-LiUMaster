import { Routes, Route, Navigate } from "react-router-dom";
import type React from "react";
import { useAuth } from "../context/UserAuthContext.tsx";

import LoginPage from "./login.tsx";
import RegisterPage from "./register.tsx";
import Dashboard from "./dashboard.tsx";
import Layout from "./layout.tsx";
import SettingsPage from "./settings.tsx";
import CoursePlanner from "./courseplanner.tsx";

function PublicRoute({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (user) return <Navigate to="/" replace />;
	return children;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/Login" replace />;
	return children;
}

function RouterComponent() {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<PrivateRoute>
						<Layout />
					</PrivateRoute>
				}
			>
				<Route index element={<Navigate to="/Dashboard" replace />} />
				<Route
					path="Profile"
					element={
						<PrivateRoute>
							<h1>Hello! This is your profile.</h1>
						</PrivateRoute>
					}
				/>
				<Route
					path="Settings"
					element={
						<PrivateRoute>
							<SettingsPage />
						</PrivateRoute>
					}
				/>
				<Route
					path="Dashboard"
					element={
						<PrivateRoute>
							<Dashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="CoursePlanner"
					element={
						<PrivateRoute>
							<CoursePlanner />
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
