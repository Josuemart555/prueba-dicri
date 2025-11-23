import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpedientesPage from './pages/ExpedientesPage';
import IndiciosPage from './pages/IndiciosPage';
import ReportesPage from './pages/ReportesPage';
import PermisosPage from './pages/PermisosPage';
import RolesPage from './pages/RolesPage';
import UsuariosPage from './pages/UsuariosPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="expedientes" element={<ExpedientesPage />} />
        <Route path="indicios" element={<IndiciosPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="permisos" element={<PermisosPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
