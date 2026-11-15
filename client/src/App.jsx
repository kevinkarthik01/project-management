import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import { ProjectModalProvider } from './context/ProjectModalContext.jsx'
import ProjectDetailModal from './components/ProjectDetailModal.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProjectTasks from './pages/ProjectTasks.jsx'
import ProjectInsights from './pages/ProjectInsights.jsx'
import ProjectExpenseTracker from './pages/ProjectExpenseTracker.jsx'
import Projects from './pages/Projects.jsx'
import MyTasks from './pages/MyTasks.jsx';
import Login from './pages/Login.jsx';
import './index.css';

{/*function App() {
  return (
    <ProjectModalProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<MyTasks />} />
            <Route path="/kanban" element={<PlaceholderPage title="Kanban Desk" description="Drag and drop task boards across stages." />} />
            <Route path="/messages" element={<PlaceholderPage title="Messages" description="Team discussions, direct messages, and project comments." />} />
            <Route path="/calendar" element={<PlaceholderPage title="Calendar" description="Team events, milestones, and upcoming sprint schedules." />} />
            <Route path="/notifications" element={<PlaceholderPage title="Notifications" description="Recent alerts, mentions, and updates." />} />
            <Route path="/team" element={<PlaceholderPage title="Team Members" description="Manage team permissions, roles, and profiles." />} />
            <Route path="/settings" element={<PlaceholderPage title="Account Settings" description="Profile information, preferences, and workspace settings." />} />

        
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter >
      <ProjectDetailModal />
    </ProjectModalProvider >
  );
}*/}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      {/* Auth Route: If already logged in, redirect straight to dashboard */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected App Routes: If not logged in, redirect to /login */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
                <Route path="/projects/:projectId/insights" element={<ProjectInsights />} />
                <Route path="/projects/:projectId/expenses" element={<ProjectExpenseTracker />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/kanban" element={<PlaceholderPage title="Kanban Desk" description="Drag and drop task boards across stages." />} />
                <Route path="/messages" element={<PlaceholderPage title="Messages" description="Team discussions, direct messages, and project comments." />} />
                <Route path="/calendar" element={<PlaceholderPage title="Calendar" description="Team events, milestones, and upcoming sprint schedules." />} />
                <Route path="/notifications" element={<PlaceholderPage title="Notifications" description="Recent alerts, mentions, and updates." />} />
                <Route path="/team" element={<PlaceholderPage title="Team Members" description="Manage team permissions, roles, and profiles." />} />
                <Route
                  path="/settings"
                  element={
                    isAdmin ? (
                      <PlaceholderPage title="Account Settings" description="Profile information, preferences, and workspace settings." />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectModalProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ProjectDetailModal />
      </ProjectModalProvider>
    </AuthProvider>
  );
}

export default App;
