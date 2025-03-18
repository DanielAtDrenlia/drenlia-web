import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import './i18n';
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
import AdminSettingsPage from './pages/admin/SettingsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loading component for suspense fallback
const Loader = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Language redirect for root */}
            <Route path="/" element={<Navigate to="/en" replace />} />

            {/* Public routes with language prefix */}
            {['en', 'fr'].map((lang) => (
              <Route key={lang} path={`/${lang}`} element={<Layout><Outlet /></Layout>}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>
            ))}

            {/* Admin routes (no language prefix needed) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            <Route path="/admin" element={<ProtectedRoute requireAdmin={false} />}>
              <Route element={<AdminDashboardPage />}>
                <Route index element={<AdminHomePage />} />
                <Route path="about" element={<AdminAboutPage />} />
                <Route path="team" element={<AdminTeamPage />} />
                <Route path="users" element={<ProtectedRoute requireAdmin={true}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute requireAdmin={false}><AdminSettingsPage /></ProtectedRoute>} />
              </Route>
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ScrollToTopButton />
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
          />
        </Router>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
