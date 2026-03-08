import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { useAuthStore } from './stores/auth.store';

// We will create these components soon
const DashboardHome = () => <div className="p-8"><h1 className="text-3xl font-heading text-white mb-4">Inicio</h1><div className="glass p-6 rounded-xl"><p className="text-foreground">Bienvenido al CRM</p></div></div>;
const Clientes = () => <div className="p-8"><h1 className="text-3xl font-heading text-white">Clientes</h1></div>;

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="clientes" element={<Clientes />} />
          {/* Default redirect for unknown dashboard routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
