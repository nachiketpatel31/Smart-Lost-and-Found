import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Search from './pages/Search';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// User Portal Pages
import UserDashboard from './pages/UserDashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import MyReports from './pages/MyReports';
import MyClaims from './pages/MyClaims';
import PotentialMatches from './pages/PotentialMatches';
import SubmitClaim from './pages/SubmitClaim';
import FeedbackForm from './pages/FeedbackForm';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';
import AdminClaims from './pages/admin/AdminClaims';
import AdminHandovers from './pages/admin/AdminHandovers';
import AdminMatches from './pages/admin/AdminMatches';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

const AppLayout = ({ children, showSidebar = false }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <div className="flex-1 max-w-7xl w-full mx-auto flex">
      {showSidebar && <Sidebar />}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
              <Route path="/item/:id" element={<AppLayout><ItemDetails /></AppLayout>} />
              <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
              <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppLayout showSidebar><UserDashboard /></AppLayout>} />
                <Route path="/report-lost" element={<AppLayout showSidebar><ReportLost /></AppLayout>} />
                <Route path="/report-found" element={<AppLayout showSidebar><ReportFound /></AppLayout>} />
                <Route path="/my-reports" element={<AppLayout showSidebar><MyReports /></AppLayout>} />
                <Route path="/my-claims" element={<AppLayout showSidebar><MyClaims /></AppLayout>} />
                <Route path="/potential-matches" element={<AppLayout showSidebar><PotentialMatches /></AppLayout>} />
                <Route path="/submit-claim/:itemId" element={<AppLayout showSidebar><SubmitClaim /></AppLayout>} />
                <Route path="/feedback/:itemId" element={<AppLayout showSidebar><FeedbackForm /></AppLayout>} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin/dashboard" element={<AppLayout showSidebar><AdminDashboard /></AppLayout>} />
                <Route path="/admin/users" element={<AppLayout showSidebar><AdminUsers /></AppLayout>} />
                <Route path="/admin/items" element={<AppLayout showSidebar><AdminItems /></AppLayout>} />
                <Route path="/admin/claims" element={<AppLayout showSidebar><AdminClaims /></AppLayout>} />
                <Route path="/admin/handovers" element={<AppLayout showSidebar><AdminHandovers /></AppLayout>} />
                <Route path="/admin/matches" element={<AppLayout showSidebar><AdminMatches /></AppLayout>} />
                <Route path="/admin/feedback" element={<AppLayout showSidebar><AdminFeedback /></AppLayout>} />
                <Route path="/admin/audit-logs" element={<AppLayout showSidebar><AdminAuditLogs /></AppLayout>} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
