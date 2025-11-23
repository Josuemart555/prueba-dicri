import { FormEvent, useEffect, useMemo, useState } from 'react';
import { rolesService } from '../services/rolesService';
import { permisosService } from '../services/permisosService';
import type { Permiso, Rol } from '../types';

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [nombre, setNombre] = useState('');
  const [selected, setSelected] = useState<Rol | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPermisos = useMemo(() => new Set((selected as any)?.permisos?.map((p: Permiso) => p.permisoId) || []), [selected]);

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
    } catch (e: any) {
      setError(e.message);
    }
  };

  const togglePermiso = async (permisoId: number) => {
    if (!selected) return;
    if (selectedPermisos.has(permisoId)) {
      await rolesService.removePermiso(selected.rolId, permisoId);
    } else {
      await rolesService.addPermiso(selected.rolId, permisoId);
    }
    await refreshSelected(selected.rolId);
  };

  return (
    <div>
      <h1>Roles</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Nombre del rol" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <button type="submit">Crear</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div>
          <h3>Lista de roles</h3>
          <ul>
            {roles.map((r) => (
              <li key={r.rolId}>
                <button onClick={() => refreshSelected(r.rolId)} style={{ marginRight: 8 }}>Ver</button>
                <span
                  onClick={() => setSelected(r)}
                  style={{ cursor: 'pointer', fontWeight: selected?.rolId === r.rolId ? 'bold' : 'normal' }}
                >
                  {r.nombre}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Permisos del rol</h3>
          {selected ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {permisos.map((p) => (
                <label key={p.permisoId} style={{ border: '1px solid #ddd', padding: '6px 10px', borderRadius: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedPermisos.has(p.permisoId)}
                    onChange={() => togglePermiso(p.permisoId)}
                  />{' '}
                  {p.nombre}
                </label>
              ))}
            </div>
          ) : (
            <div>Selecciona un rol</div>
          )}
        </div>
      </div>
    </div>
  );
}
