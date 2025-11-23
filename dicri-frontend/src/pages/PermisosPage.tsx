import { FormEvent, useEffect, useState } from 'react';
import { permisosService } from '../services/permisosService';
import type { Permiso } from '../types';

export default function PermisosPage() {
  const [items, setItems] = useState<Permiso[]>([]);
  const [nombre, setNombre] = useState('');
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const data = await permisosService.list();
      setItems(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await permisosService.update(editing.PermisoId, nombre);
        setEditing(null);
      } else {
        await permisosService.create(nombre);
      }
      setNombre('');
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const onEdit = (p: Permiso) => {
    setEditing(p);
    setNombre((p as any).Nombre ?? (p as any).Nombre ?? '');
    setShowForm(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar permiso?')) return;
    await permisosService.remove(id);
    await load();
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Permisos</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setNombre('');
            setShowForm((v) => !v);
          }}
          type="button"
        >
          Crear
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>{editing ? 'Editar permiso' : 'Crear permiso'}</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setNombre('');
              }}
            >
              Cerrar
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  id="nombre"
                  className="form-control"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setNombre('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-sm mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 100 }}>ID</th>
                  <th>Nombre</th>
                  <th style={{ width: 180 }} className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      No hay permisos registrados.
                    </td>
                  </tr>
                )}
                {items.map((p) => (
                  <tr key={p.PermisoId}>
                    <td>{p.PermisoId}</td>
                    <td>{p.Nombre}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-secondary" onClick={() => onEdit(p)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" onClick={() => onDelete(p.PermisoId)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
