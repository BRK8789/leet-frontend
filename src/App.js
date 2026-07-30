import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import ManageDepartments from "@/pages/ManageDepartments";
import ManageBranches from "@/pages/ManageBranches";
import ManageSections from "@/pages/ManageSections";
import ManageFaculty from "@/pages/ManageFaculty";
import ManageStudents from "@/pages/ManageStudents";
import Leaderboard from "@/pages/Leaderboard";
import Analytics from "@/pages/Analytics";
import SyncModule from "@/pages/SyncModule";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "faculty") return <FacultyDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<DashboardRouter />} />
                      <Route path="/departments" element={<ProtectedRoute roles={["admin"]}><ManageDepartments /></ProtectedRoute>} />
                      <Route path="/branches" element={<ProtectedRoute roles={["admin"]}><ManageBranches /></ProtectedRoute>} />
                      <Route path="/sections" element={<ProtectedRoute roles={["admin"]}><ManageSections /></ProtectedRoute>} />
                      <Route path="/faculty" element={<ProtectedRoute roles={["admin"]}><ManageFaculty /></ProtectedRoute>} />
                      <Route path="/students" element={<ProtectedRoute roles={["admin", "faculty"]}><ManageStudents /></ProtectedRoute>} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/analytics" element={<ProtectedRoute roles={["admin", "faculty"]}><Analytics /></ProtectedRoute>} />
                      <Route path="/sync" element={<ProtectedRoute roles={["admin"]}><SyncModule /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute roles={["admin", "faculty"]}><Reports /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
                      <Route path="/profile" element={<StudentDashboard />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;
