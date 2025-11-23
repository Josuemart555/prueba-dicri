import { FormEvent, useState } from 'react';
import { reportesService } from '../services/reportesService';
import type { ResumenEstado } from '../services/reportesService';

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [data, setData] = useState<ResumenEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await reportesService.resumen({ fechaInicio, fechaFin });
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reportes</h1>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        <button type="submit" disabled={loading}>Buscar</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <ul>
          {data.map((x) => (
            <li key={x.estado}>
              {x.estado}: {x.total}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
