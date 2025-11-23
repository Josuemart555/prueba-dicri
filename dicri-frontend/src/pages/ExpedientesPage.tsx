import { FormEvent, useEffect, useState } from 'react';
import { expedientesService } from '../services/expedientesService';
import type { Expediente } from '../types';

export default function ExpedientesPage() {
  const [items, setItems] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ estado?: string; fechaInicio?: string; fechaFin?: string }>({});

  const [numero, setNumero] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState<string>(new Date().toISOString());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expedientesService.list(filters);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await expedientesService.create({ numero, descripcion, fechaRegistro });
      setNumero('');
      setDescripcion('');
      setFechaRegistro(new Date().toISOString());
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const aprobar = async (id?: number) => {
    if (!id) return;
    await expedientesService.aprobar(id);
    await load();
  };

  const rechazar = async (id?: number) => {
    if (!id) return;
    const just = prompt('Justificación del rechazo:');
    if (!just) return;
    await expedientesService.rechazar(id, just);
    await load();
  };

  return (
    <div>
      <h1>Expedientes</h1>

      <section style={{ marginBottom: 16 }}>
        <h3>Filtros</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={filters.estado || ''} onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value || undefined }))}>
            <option value="">Todos</option>
            <option value="REGISTRADO">Registrado</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <input type="date" value={filters.fechaInicio || ''} onChange={(e) => setFilters((f) => ({ ...f, fechaInicio: e.target.value || undefined }))} />
          <input type="date" value={filters.fechaFin || ''} onChange={(e) => setFilters((f) => ({ ...f, fechaFin: e.target.value || undefined }))} />
          <button onClick={load} disabled={loading}>Buscar</button>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Crear expediente</h3>
        <form onSubmit={onCreate} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} required />
          <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <input type="datetime-local" value={new Date(fechaRegistro).toISOString().slice(0,16)} onChange={(e) => setFechaRegistro(new Date(e.target.value).toISOString())} />
          <button type="submit">Crear</button>
        </form>
      </section>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>#</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id || x.numero}>
                <td>{x.numero}</td>
                <td>{x.descripcion}</td>
                <td>{x.fechaRegistro}</td>
                <td>{x.estado}</td>
                <td>
                  <button onClick={() => aprobar(x.id)}>Aprobar</button>{' '}
                  <button onClick={() => rechazar(x.id)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
