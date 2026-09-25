import { Routes, Route, Navigate } from "react-router-dom";
import type React from "react";
import { useAuth } from "../context/UserAuthContext.tsx";

import LoginPage from "./login.tsx";
import RegisterPage from "./register.tsx";
import Dashboard from "./dashboard.tsx";
import Layout from "./layout.tsx";
import SettingsPage from "./settings.tsx";
import CoursePlanner from "./courseplanner.tsx";
import ProfilePage from "./profile.tsx";
import PlanExplorer from "./explorer.tsx";
import UserPlanViewer from "./userplanviewer.tsx";

// Routing för alla sidor när man är inloggad, om man försöker nå till exempel loginsidan rotuas man istället till dashboard
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// Routing för alla sidor som kräver att man är inloggad, om man försöker nå en sida som kräver detta routas man till loginsidan
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Routing för alla sidor, routas till layout och login/registerkomponenterna
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="profile/:userID"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="planner/:planID"
          element={
            <PrivateRoute>
              <CoursePlanner />
            </PrivateRoute>
          }
        />
        <Route
          path="explorer"
          element={
            <PrivateRoute>
              <PlanExplorer />
            </PrivateRoute>
          }
        />
        <Route
          path="userplanviewer"
          element={
            <PrivateRoute>
              <UserPlanViewer />
            </PrivateRoute>
          }
        />
      </Route>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
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
