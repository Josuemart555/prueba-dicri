import { FormEvent, useEffect, useState } from 'react';
import { permisosService } from '../services/permisosService';
import type { Permiso } from '../types';

export default function PermisosPage() {
  const [items, setItems] = useState<Permiso[]>([]);
  const [nombre, setNombre] = useState('');
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        await permisosService.update(editing.permisoId, nombre);
        setEditing(null);
      } else {
        await permisosService.create(nombre);
      }
      setNombre('');
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const onEdit = (p: Permiso) => {
    setEditing(p);
    setNombre(p.nombre);
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar permiso?')) return;
    await permisosService.remove(id);
    await load();
  };

  return (
    <div>
      <h1>Permisos</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <button type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
        {editing && <button onClick={() => { setEditing(null); setNombre(''); }} type="button">Cancelar</button>}
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {items.map((p) => (
          <li key={p.permisoId}>
            {p.nombre}
            <button onClick={() => onEdit(p)} style={{ marginLeft: 8 }}>Editar</button>
            <button onClick={() => onDelete(p.permisoId)} style={{ marginLeft: 4 }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
