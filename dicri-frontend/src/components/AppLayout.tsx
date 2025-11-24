import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import './layout.css';

export function AppLayout() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleNames = (user?.roles ?? []).map((r: any) => (typeof r === 'string' ? r : r?.nombre)).filter(Boolean);
    const isCoordinador = roleNames.includes('COORDINADOR');
    const isTecnico = roleNames.includes('TECNICO');

    return (
        <div className="layout">
            <aside className="sidebar">
                <h2>DICRI</h2>
                <nav>
                    {isCoordinador && (
                        <>
                            <NavLink to="/">Dashboard</NavLink>
                            <NavLink to="/expedientes">Expedientes</NavLink>
                            <NavLink to="/reportes">Reportes</NavLink>
                            <hr/>
                            <NavLink to="/usuarios">Usuarios</NavLink>
                            <NavLink to="/roles">Roles</NavLink>
                            <NavLink to="/permisos">Permisos</NavLink>
                        </>
                    )}
                    {isTecnico && !isCoordinador && (
                        <>

                            <NavLink to="/expedientes">Expedientes</NavLink>
                        </>
                    )}
                    {/* Fallback: si no es coordinador ni técnico, mostrar solo Expedientes para no exponer más de la cuenta */}
                    {!isCoordinador && !isTecnico && (
                        <>
                            <NavLink to="/">Dashboard</NavLink>
                            <NavLink to="/expedientes">Expedientes</NavLink>
                        </>
                    )}
                </nav>
            </aside>
            <main className="content">
                <header className="topbar">
                    <div className="grow"/>
                    <div>
                        <span style={{marginRight: 12}}>{user?.nombre}</span>
                        <button onClick={handleLogout}>Salir</button>
                    </div>
                </header>
                <section className="page">
                    <Outlet/>
                </section>
            </main>
        </div>
    );
}
