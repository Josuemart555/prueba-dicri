import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {expedientesService} from '../services/expedientesService';
import type {Expediente} from '../types';

export default function ExpedientesPage() {
    const [items, setItems] = useState<Expediente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ estado?: string; fechaInicio?: string; fechaFin?: string }>({});

    const [numero, setNumero] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaRegistro, setFechaRegistro] = useState<string>(new Date().toISOString());

    const [showCreate, setShowCreate] = useState(false);

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
    }, []);

    const onCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await expedientesService.create({numero, descripcion, fechaRegistro});
            setNumero('');
            setDescripcion('');
            setFechaRegistro(new Date().toISOString());
            setShowCreate(false);
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    // Edición deshabilitada por requerimiento

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

    const fechaToInput = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const estados = useMemo(() => [
        {value: '', label: 'Todos'},
        {value: 'REGISTRADO', label: 'Registrado'},
        {value: 'EN_REVISION', label: 'En revisión'},
        {value: 'APROBADO', label: 'Aprobado'},
        {value: 'RECHAZADO', label: 'Rechazado'},
    ], []);

    return (
        <div className="container py-3">
            <div className="d-flex align-items-center mb-3">
                <h1 className="h3 mb-0">Expedientes</h1>
                <button className="btn btn-primary ms-auto" onClick={() => setShowCreate((v) => !v)}>
                    <i className="bi bi-plus-lg me-1"/> Crear
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {showCreate && (
                <div className="card mb-3">
                    <div className="card-header d-flex align-items-center">
                        <strong>Crear expediente</strong>
                        <button className="btn btn-sm btn-outline-secondary ms-auto"
                                onClick={() => setShowCreate(false)} type="button">Cerrar
                        </button>
                    </div>
                    <div className="card-body">
                        <form className="row g-3" onSubmit={onCreate}>
                            <div className="col-12 col-md-4">
                                <label className="form-label">Número</label>
                                <input className="form-control" placeholder="Número" value={numero}
                                       onChange={(e) => setNumero(e.target.value)} required/>
                            </div>
                            <div className="col-12 col-md-5">
                                <label className="form-label">Descripción</label>
                                <input className="form-control" placeholder="Descripción" value={descripcion}
                                       onChange={(e) => setDescripcion(e.target.value)}/>
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label">Fecha registro</label>
                                <input
                                    className="form-control"
                                    type="datetime-local"
                                    value={fechaToInput(fechaRegistro)}
                                    onChange={(e) => setFechaRegistro(new Date(e.target.value).toISOString())}
                                />
                            </div>
                            <div className="col-12 d-flex justify-content-end">
                                <button className="btn btn-primary" type="submit" disabled={loading}>
                                    {loading ? 'Creando…' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card mb-3">
                <div className="card-header"><strong>Filtros</strong></div>
                <div className="card-body">
                    <div className="row g-2 align-items-end">
                        <div className="col-12 col-md-3">
                            <label className="form-label">Estado</label>
                            <select className="form-select" value={filters.estado || ''}
                                    onChange={(e) => setFilters((f) => ({...f, estado: e.target.value || undefined}))}>
                                {estados.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <label className="form-label">Fecha inicio</label>
                            <input className="form-control" type="date" value={filters.fechaInicio || ''}
                                   onChange={(e) => setFilters((f) => ({
                                       ...f,
                                       fechaInicio: e.target.value || undefined
                                   }))}/>
                        </div>
                        <div className="col-12 col-md-3">
                            <label className="form-label">Fecha fin</label>
                            <input className="form-control" type="date" value={filters.fechaFin || ''}
                                   onChange={(e) => setFilters((f) => ({
                                       ...f,
                                       fechaFin: e.target.value || undefined
                                   }))}/>
                        </div>
                        <div className="col-12 col-md-3 d-grid">
                            <button className="btn btn-outline-primary" onClick={load}
                                    disabled={loading}>{loading ? 'Buscando…' : 'Buscar'}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-3">Cargando…</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th style={{width: 120}}>Número</th>
                                    <th>Descripción</th>
                                    <th style={{width: 180}}>Fecha</th>
                                    <th style={{width: 140}}>Estado</th>
                                    <th style={{width: 240}} className="text-end">Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((x) => (
                                    <tr key={x.ExpedienteId ?? x.Numero}>
                                        <td className="fw-semibold">{x.Numero}</td>
                                        <td>{x.Descripcion}</td>
                                        <td>{x.FechaRegistro}</td>
                                        <td>
                        <span
                            className={`badge bg-${x.Estado === 'APROBADO' ? 'success' : x.Estado === 'RECHAZADO' ? 'danger' : x.Estado === 'EN_REVISION' ? 'warning text-dark' : 'secondary'}`}>
                          {x.Estado}
                        </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group" role="group">
                                                <button className="btn btn-sm btn-outline-success"
                                                        onClick={() => aprobar(x.ExpedienteId)}>Aprobar
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger"
                                                        onClick={() => rechazar(x.ExpedienteId)}>Rechazar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">Sin resultados</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
