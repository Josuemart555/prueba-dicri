import type { FormEvent} from 'react';
import { useMemo, useState } from 'react';
import { reportesService } from '../services/reportesService';
import type { ReporteResponse, ResumenItem, AprobadoItem, RechazadoItem } from '../services/reportesService';

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [tab, setTab] = useState<'aprobados' | 'rechazados'>('aprobados');
  const [data, setData] = useState<ReporteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await reportesService.reporte({ fechaInicio, fechaFin });
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resumen: ResumenItem[] = useMemo(() => data?.resumen ?? [], [data]);
  const aprobados: AprobadoItem[] = useMemo(() => data?.aprobados ?? [], [data]);
  const rechazados: RechazadoItem[] = useMemo(() => data?.rechazados ?? [], [data]);

  const reset = () => {
    setFechaInicio('');
    setFechaFin('');
    setData(null);
    setError(null);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h3 m-0">Reportes</h1>
      </div>

      {/* Filtros */}
      <form onSubmit={onSearch} className="row gy-2 gx-2 align-items-end mb-3">
        <div className="col-sm-6 col-md-3">
          <label className="form-label">Fecha inicio</label>
          <input className="form-control" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div className="col-sm-6 col-md-3">
          <label className="form-label">Fecha fin</label>
          <input className="form-control" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <div className="col-12 col-md-6 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            ) : null}
            Buscar
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={reset} disabled={loading}>Limpiar</button>
        </div>
      </form>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {/* Resumen con tarjetas */}
      {data && (
        <div className="row g-3 mb-3">
          {resumen.map((x) => (
            <div key={x.Estado} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">{x.Estado}</div>
                    <div className="h4 m-0">{x.Total}</div>
                  </div>
                  <span className={
                    'badge text-bg-' + (x.Estado === 'APROBADO' ? 'success' : x.Estado === 'RECHAZADO' ? 'danger' : 'secondary')
                  }>{x.Estado}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs y tabla principal */}
      <div className="card">
        <div className="card-header pb-0 border-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className={`nav-link ${tab === 'aprobados' ? 'active' : ''}`} onClick={() => setTab('aprobados')}>
                Aprobados
                {data ? <span className="badge text-bg-success ms-2">{aprobados.length}</span> : null}
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${tab === 'rechazados' ? 'active' : ''}`} onClick={() => setTab('rechazados')}>
                Rechazados
                {data ? <span className="badge text-bg-danger ms-2">{rechazados.length}</span> : null}
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {loading && (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-border" role="status" aria-hidden="true"></div>
              <span>Cargando...</span>
            </div>
          )}

          {!loading && (!data || (aprobados.length === 0 && rechazados.length === 0)) && (
            <div className="text-muted">No hay resultados. Ajuste los filtros y presione Buscar.</div>
          )}

          {!loading && data && (
            <div className="table-responsive">
              {tab === 'aprobados' ? (
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Expediente</th>
                      <th>Descripción</th>
                      <th>Técnico</th>
                      <th>Fecha registro</th>
                      <th>Aprobado por</th>
                      <th>Fecha aprobación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aprobados.map((r, idx) => (
                      <tr key={r.ExpedienteId}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="fw-semibold">{r.Numero}</div>
                          <div className="small text-muted">ID: {r.ExpedienteId}</div>
                        </td>
                        <td>{r.Descripcion}</td>
                        <td>
                          <div className="fw-semibold">{r.Tecnico}</div>
                          <div className="small text-muted">ID: {r.TecnicoId}</div>
                        </td>
                        <td>{new Date(r.FechaRegistro).toLocaleString()}</td>
                        <td>
                          <div className="fw-semibold">{r.AprobacionUsuario}</div>
                          <div className="small text-muted">ID: {r.AprobacionUsuarioId}</div>
                        </td>
                        <td>{new Date(r.AprobacionFecha).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Expediente</th>
                      <th>Descripción</th>
                      <th>Técnico</th>
                      <th>Fecha registro</th>
                      <th>Último rechazo</th>
                      <th>Justificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rechazados.map((r, idx) => (
                      <tr key={r.ExpedienteId}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="fw-semibold">{r.Numero}</div>
                          <div className="small text-muted">ID: {r.ExpedienteId}</div>
                        </td>
                        <td>{r.Descripcion}</td>
                        <td>
                          <div className="fw-semibold">{r.Tecnico}</div>
                          <div className="small text-muted">ID: {r.TecnicoId}</div>
                        </td>
                        <td>{new Date(r.FechaRegistro).toLocaleString()}</td>
                        <td>
                          <div className="fw-semibold">{r.UltimoRechazoUsuario}</div>
                          <div className="small text-muted">{new Date(r.UltimoRechazoFecha).toLocaleString()}</div>
                        </td>
                        <td style={{maxWidth: 360}}>
                          <span className="text-truncate d-inline-block" style={{maxWidth: '340px'}} title={r.UltimoRechazoJustificacion}>{r.UltimoRechazoJustificacion}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
