import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>DICRI</h2>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/expedientes">Expedientes</NavLink>
          <NavLink to="/indicios">Indicios</NavLink>
          <NavLink to="/reportes">Reportes</NavLink>
          <hr />
          <NavLink to="/usuarios">Usuarios</NavLink>
          <NavLink to="/roles">Roles</NavLink>
          <NavLink to="/permisos">Permisos</NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="grow" />
          <div>
            <span style={{ marginRight: 12 }}>{user?.nombre}</span>
            <button onClick={handleLogout}>Salir</button>
          </div>
        </header>
        <section className="page">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
