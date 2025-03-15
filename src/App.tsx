import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminHomePage from './pages/admin/HomePage';
import AdminAboutPage from './pages/admin/AboutPage';
import AdminTeamPage from './pages/admin/TeamPage';
import AdminUsersPage from './pages/admin/UsersPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Admin login route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected admin routes - using nested routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<AdminDashboardPage />}>
              <Route index element={<AdminHomePage />} />
              <Route path="about" element={<AdminAboutPage />} />
              <Route path="team" element={<AdminTeamPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ScrollToTopButton />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </AuthProvider>
  );
}

export default App;
