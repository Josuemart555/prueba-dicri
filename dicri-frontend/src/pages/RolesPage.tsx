import {type FormEvent, useEffect, useMemo, useState} from 'react';
import {rolesService} from '../services/rolesService';
import {permisosService} from '../services/permisosService';
import type {Permiso, Rol} from '../types';

export default function RolesPage() {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [nombre, setNombre] = useState('');
    const [editNombre, setEditNombre] = useState('');
    const [selected, setSelected] = useState<Rol | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const selectedPermisos = useMemo(() => new Set((selected as any)?.permisos?.map((p: Permiso) => p.PermisoId) || []), [selected]);

    const load = async () => {
        try {
            const [rs, ps] = await Promise.all([rolesService.list(), permisosService.list()]);
            setRoles(rs);
            setPermisos(ps);
            if (rs.length && !selected) setSelected(rs[0]);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const refreshSelected = async (id: number) => {
        const rol = await rolesService.get(id);
        const perms = await rolesService.listPermisos(id);
        (rol as any).permisos = perms;
        setSelected(rol);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await rolesService.create(nombre);
            setNombre('');
            await load();
            setShowCreate(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const togglePermiso = async (PermisoId: number) => {
        if (!selected) return;
        if (selectedPermisos.has(PermisoId)) {
            await rolesService.removePermiso(selected.RolId, PermisoId);
        } else {
            await rolesService.addPermiso(selected.RolId, PermisoId);
        }
        await refreshSelected(selected.RolId);
    };

    const openEdit = async (rol: Rol) => {
        setSelected(rol);
        setEditNombre((rol as any).Nombre ?? (rol as any).Nombre ?? '');
        try {
            await refreshSelected(rol.RolId);
        } catch (e: any) {
            setError(e.message);
        }
        setShowEdit(true);
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setError(null);
        try {
            await rolesService.update(selected.RolId, editNombre);
            await load();
            await refreshSelected(selected.RolId);
            setShowEdit(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 m-0">Roles</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate((v) => !v)}>
                    {showCreate ? 'Cerrar' : 'Crear rol'}
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {showCreate && (
                <div className="card mb-4">
                    <div className="card-header">Crear nuevo rol</div>
                    <div className="card-body">
                        <form className="row g-3" onSubmit={onSubmit}>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Nombre</label>
                                <input
                                    className="form-control"
                                    placeholder="Nombre del rol"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="submit" className="btn btn-success">Guardar</button>
                                <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => setShowCreate(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEdit && selected && (
                <div className="card mt-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Editar rol</span>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEdit(false)}>Cerrar
                        </button>
                    </div>
                    <div className="card-body">
                        <form className="row g-3" onSubmit={saveEdit}>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Nombre</label>
                                <input
                                    className="form-control"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Permisos</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {permisos.map((p) => (
                                        <div key={p.PermisoId}
                                             className="form-check form-check-inline border rounded px-3 py-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`perm-${p.PermisoId}`}
                                                checked={selectedPermisos.has(p.PermisoId)}
                                                onChange={() => togglePermiso(p.PermisoId)}
                                            />
                                            <label className="form-check-label" htmlFor={`perm-${p.PermisoId}`}>
                                                {p.Nombre}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="submit" className="btn btn-success">Guardar cambios</button>
                                <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => setShowEdit(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">Lista de roles</div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead>
                            <tr>
                                <th style={{width: 100}}>ID</th>
                                <th>Nombre</th>
                                <th style={{width: 140}} className="text-end">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {roles.map((r) => (
                                <tr key={r.RolId} className={selected?.RolId === r.RolId ? 'table-active' : ''}>
                                    <td>{r.RolId}</td>
                                    <td>{r.Nombre}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(r)}>
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {roles.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-muted">
                                        No hay roles registrados.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
