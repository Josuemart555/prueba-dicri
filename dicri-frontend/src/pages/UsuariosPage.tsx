import type {FormEvent} from 'react';
import {useEffect, useState} from 'react';
import {usuariosService} from '../services/usuariosService';
import {rolesService} from '../services/rolesService';
import type {Rol, Usuario} from '../types';

export default function UsuariosPage() {
    const [items, setItems] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [selected, setSelected] = useState<Usuario | null>(null);
    const [form, setForm] = useState<{ nombre: string; email: string; password: string; activo: boolean }>({
        nombre: '',
        email: '',
        password: '',
        activo: true
    });
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<{ nombre: string; email: string; activo: boolean }>({
        nombre: '',
        email: '',
        activo: true
    });

    const getUserId = (u: any | null | undefined): number | undefined => {
        if (!u) return undefined;
        return u.UsuarioId ?? u.usuarioId ?? u.id ?? u.Id;
    };

    const getRoleId = (r: any | null | undefined): number | undefined => {
        if (!r) return undefined;
        return r.rolId ?? r.RolId ?? r.id ?? r.Id;
    };

    const selectedId = getUserId(selected);

    const load = async () => {
        try {
            const [us, rs] = await Promise.all([usuariosService.list(), rolesService.list()]);
            setItems(us);
            setRoles(rs);
            if (us.length && !selected) setSelected(us[0]);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const refreshSelected = async (id: number) => {
        const user = await usuariosService.get(id);
        const urs = await usuariosService.listRoles(id);
        (user as any).roles = urs;
        setSelected(user);
    };

    useEffect(() => {
        load();
    }, []);

    const onCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await usuariosService.create({
                nombre: form.nombre,
                email: form.email,
                password: form.password,
                activo: form.activo
            });
            setForm({nombre: '', email: '', password: '', activo: true});
            await load();
            setShowCreate(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const toggleRole = async (rolId: number) => {
        const id = getUserId(selected);
        if (!selected || !id) return;
        // Usar el helper getRoleId para comparar correctamente independientemente del casing/propiedad
        const has = (selected.roles || []).some((r) => getRoleId(r) === rolId);
        if (has) {
            await usuariosService.removeRole(id, rolId);
        } else {
            await usuariosService.addRole(id, rolId);
        }
        await refreshSelected(id);
    };

    const startEdit = async (u: Usuario) => {
        const id = getUserId(u);
        if (!id) {
            setError('Usuario sin identificador válido');
            return;
        }
        await refreshSelected(id);
        setEditForm({
            nombre: (u as any).nombre ?? (u as any).Nombre ?? '',
            email: (u as any).email ?? (u as any).Email ?? '',
            activo: !!(((u as any).activo ?? (u as any).Activo) ?? false),
        });
        setEditing(true);
    };

    const onSaveEdit = async (e: FormEvent) => {
        e.preventDefault();
        const id = getUserId(selected);
        if (!selected || !id) return;
        setError(null);
        try {
            await usuariosService.update(id, {nombre: editForm.nombre, email: editForm.email, activo: editForm.activo});
            await load();
            await refreshSelected(id);
            setEditing(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    useEffect(() => {
        setEditing(false);
    }, [selectedId]);

    return (
        <div className="container-fluid py-4">
            <h1 className="mb-4">Usuarios</h1>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="d-flex justify-content-end mb-2">
                <button className="btn btn-success" onClick={() => setShowCreate((v) => !v)}>
                    {showCreate ? 'Cerrar' : 'Nuevo usuario'}
                </button>
            </div>
            {showCreate && (
                <section className="mb-4">
                    <div className="card">
                        <div className="card-header">Crear usuario</div>
                        <div className="card-body">
                            <form onSubmit={onCreate}>
                                <div className="row g-3 align-items-end">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Nombre</label>
                                        <input className="form-control" placeholder="Nombre" value={form.nombre}
                                               onChange={(e) => setForm((f) => ({...f, nombre: e.target.value}))}
                                               required/>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" placeholder="Email"
                                               value={form.email}
                                               onChange={(e) => setForm((f) => ({...f, email: e.target.value}))}
                                               required/>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Contraseña</label>
                                        <input className="form-control" type="password" placeholder="Contraseña"
                                               value={form.password}
                                               onChange={(e) => setForm((f) => ({...f, password: e.target.value}))}
                                               required/>
                                    </div>
                                    <div className="col-12 col-md-3">
                                        <div className="form-check mt-2">
                                            <input className="form-check-input" id="activoCheck" type="checkbox"
                                                   checked={form.activo} onChange={(e) => setForm((f) => ({
                                                ...f,
                                                activo: e.target.checked
                                            }))}/>
                                            <label className="form-check-label" htmlFor="activoCheck">Activo</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-3">
                                        <button type="submit" className="btn btn-primary">Crear</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            {editing && selected && (
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Editar usuario</span>
                            <button className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setEditing(false)}>Cerrar
                            </button>
                        </div>
                        <div className="card-body">
                            <form onSubmit={onSaveEdit} className="mb-3">
                                <div className="row g-3 align-items-end">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Nombre</label>
                                        <input className="form-control" value={editForm.nombre}
                                               onChange={(e) => setEditForm((f) => ({...f, nombre: e.target.value}))}
                                               required/>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={editForm.email}
                                               onChange={(e) => setEditForm((f) => ({...f, email: e.target.value}))}
                                               required/>
                                    </div>
                                    <div className="col-12 col-md-2">
                                        <div className="form-check mt-4">
                                            <input id="editActivo" className="form-check-input" type="checkbox"
                                                   checked={editForm.activo} onChange={(e) => setEditForm((f) => ({
                                                ...f,
                                                activo: e.target.checked
                                            }))}/>
                                            <label htmlFor="editActivo" className="form-check-label">Activo</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-2">
                                        <div className="d-flex gap-2 mt-2">
                                            <button type="submit" className="btn btn-primary">Guardar</button>
                                            <button type="button" className="btn btn-secondary"
                                                    onClick={() => setEditing(false)}>Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div>
                                <h6 className="mb-2">Roles</h6>
                                <div className="d-flex flex-wrap gap-3">
                                    {roles.map((r, idx) => {
                                        const roleId = getRoleId(r);
                                        const checked = (selected.roles || []).some((ur) => getRoleId(ur) === roleId);
                                        const htmlId = `rol-${roleId ?? (r as any).Nombre ?? 'no-id'}-${idx}`;
                                        const keyVal = roleId ?? `name-${(r as any).Nombre ?? 'unnamed'}-${idx}`;
                                        return (
                                            <div className="form-check form-check-inline" key={keyVal}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={htmlId}
                                                    checked={checked}
                                                    onChange={() => {
                                                        if (roleId !== undefined) toggleRole(roleId);
                                                    }}
                                                />
                                                <label className="form-check-label"
                                                       htmlFor={htmlId}>{(r as any).Nombre ?? ''}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                                <small className="text-muted d-block mt-2">Los roles se guardan al
                                    marcar/desmarcar.</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <span>Listado de usuarios</span>
                            <small className="text-muted">Click en la fila para seleccionar</small>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table
                                    className="table table-striped table-bordered table-hover table-sm align-middle mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th style={{width: '55%'}}>Email</th>
                                        <th style={{width: '15%'}}>Estado</th>
                                        <th style={{width: '30%'}} className="text-end">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.map((u, idx) => {
                                        const isActive = selectedId !== undefined && selectedId === getUserId(u);
                                        const email = (u as any).email ?? (u as any).Email ?? '';
                                        const activo = !!(((u as any).activo ?? (u as any).Activo) ?? false);
                                        return (
                                            <tr key={`${getUserId(u) ?? 'no-id'}-${idx}`}
                                                className={isActive ? 'table-active' : ''} onClick={() => {
                                                const id = getUserId(u);
                                                if (id) refreshSelected(id);
                                            }} style={{cursor: 'pointer'}}>
                                                <td className="text-muted">{email}</td>
                                                <td>{activo ? <span className="badge text-bg-success">Activo</span> :
                                                    <span className="badge text-bg-secondary">Inactivo</span>}</td>
                                                <td className="text-end">
                                                    <div className="d-inline-flex gap-2">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                await startEdit(u);
                                                            }}
                                                            title="Editar usuario"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const id = getUserId(u);
                                                                if (!id) return;
                                                                if (!confirm('¿Eliminar usuario?')) return;
                                                                try {
                                                                    await usuariosService.remove(id);
                                                                    await load();
                                                                    if (selectedId === id) {
                                                                        setSelected(null);
                                                                        setEditing(false);
                                                                    }
                                                                } catch (err: any) {
                                                                    setError(err?.message ?? 'Error al eliminar usuario');
                                                                }
                                                            }}
                                                            title="Eliminar usuario"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
