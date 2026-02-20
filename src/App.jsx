import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AllFIRs from './pages/admin/AllFIRs';
import Officers from './pages/admin/Officers';
import Stations from './pages/admin/Stations';

// Officer
import OfficerDashboard from './pages/officer/OfficerDashboard';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitFIR from './pages/citizen/SubmitFIR';
import MyFIRs from './pages/citizen/MyFIRs';

// Shared
import CriminalRecords from './pages/shared/CriminalRecords';
import Analytics from './pages/shared/Analytics';

import ProtectedRoute from './components/ProtectedRoute';

function RoleRouter() {
  const { userRole, currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole === 'admin') return <Navigate to="/admin" replace />;
  if (userRole === 'officer') return <Navigate to="/officer" replace />;
  if (userRole === 'citizen') return <Navigate to="/citizen" replace />;

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
      <h2>Loading account data...</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>If this takes too long, please refresh the page.</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" toastOptions={{ style: { background: '#131929', color: '#edf2ff', border: '1px solid rgba(99,140,255,0.2)' } }} />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root redirect */}
            <Route path="/" element={<RoleRouter />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/firs" element={<ProtectedRoute role="admin"><AllFIRs /></ProtectedRoute>} />
            <Route path="/admin/officers" element={<ProtectedRoute role="admin"><Officers /></ProtectedRoute>} />
            <Route path="/admin/stations" element={<ProtectedRoute role="admin"><Stations /></ProtectedRoute>} />

            {/* Officer routes */}
            <Route path="/officer" element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/officer/cases" element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>} />

            {/* Citizen routes */}
            <Route path="/citizen" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/citizen/submit-fir" element={<ProtectedRoute role="citizen"><SubmitFIR /></ProtectedRoute>} />
            <Route path="/citizen/my-firs" element={<ProtectedRoute role="citizen"><MyFIRs /></ProtectedRoute>} />

            {/* Shared (admin + officer) */}
            <Route path="/criminals" element={<ProtectedRoute><CriminalRecords /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
