
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { FamilyZone } from './pages/FamilyZone';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';

interface RouteProps {
  children: React.ReactNode;
}

// Helper to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
    const userString = localStorage.getItem('lumen_user');
    if (!userString) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Admin/Staff Route Component
const AdminRoute: React.FC<RouteProps> = ({ children }) => {
    const userString = localStorage.getItem('lumen_user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Permite ADMIN e EDITOR
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/family-zone" element={<ProtectedRoute><FamilyZone /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Admin/Staff Route */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        {/* Redirects */}
        <Route path="/series" element={<Navigate to="/" />} />
        <Route path="/movies" element={<Navigate to="/" />} />
        <Route path="/my-list" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
