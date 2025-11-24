import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {expedientesService} from '../services/expedientesService';
import type {Expediente} from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ExpedientesPage() {
    const [items, setItems] = useState<Expediente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ estado?: string; fechaInicio?: string; fechaFin?: string }>({});
    const navigate = useNavigate();
    const { user } = useAuth();

    const [numero, setNumero] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaRegistro, setFechaRegistro] = useState<string>(new Date().toISOString());

    const [showCreate, setShowCreate] = useState(false);

    // Estado para modal de rechazo
    const [showReject, setShowReject] = useState(false);
    const [rejectId, setRejectId] = useState<number | undefined>(undefined);
    const [rejectJust, setRejectJust] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);

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

    const aprobar = async (id?: number) => {
        if (!id) return;
        await expedientesService.aprobar(id);
        await load();
    };

    const abrirRechazo = (id?: number) => {
        if (!id) return;
        setRejectId(id);
        setRejectJust('');
        setShowReject(true);
    };

    const cancelarRechazo = () => {
        setShowReject(false);
        setRejectLoading(false);
        setRejectJust('');
        setRejectId(undefined);
    };

    const confirmarRechazo = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!rejectId) return;
        if (!rejectJust.trim()) {
            setError('La justificación es obligatoria para rechazar.');
            return;
        }
        try {
            setRejectLoading(true);
            setError(null);
            await expedientesService.rechazar(rejectId, rejectJust.trim());
            cancelarRechazo();
            await load();
        } catch (e: any) {
            setError(e?.message ?? 'Error al rechazar.');
            setRejectLoading(false);
        }
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

    const permisosSet = useMemo(() => {
        const directos = Array.isArray(user?.permissions) ? (user?.permissions as string[]) : [];
        const porRoles = (user?.roles ?? [])
            .flatMap((r: any) => (typeof r === 'string' ? [] : (r?.permisos ?? [])))
            .map((p: any) => p?.nombre)
            .filter(Boolean) as string[];
        return new Set<string>([...directos, ...porRoles]);
    }, [user]);

    const canAprobar = permisosSet.has('EXPEDIENTES_APROBAR');
    const canRechazar = permisosSet.has('EXPEDIENTES_RECHAZAR');

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
                                    <th style={{width: 340}} className="text-end">Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((x) => (
                                    <tr key={(x as any).ExpedienteId ?? (x as any).Numero ?? x.Numero}>
                                        <td className="fw-semibold">{(x as any).Numero ?? (x as any).numero}</td>
                                        <td>{(x as any).Descripcion ?? (x as any).descripcion}</td>
                                        <td>{(x as any).FechaRegistro ?? (x as any).fechaRegistro}</td>
                                        <td>
                        <span
                            className={`badge bg-${((x as any).Estado ?? (x as any).Estado) === 'APROBADO' ? 'success' : ((x as any).Estado ?? (x as any).Estado) === 'RECHAZADO' ? 'danger' : ((x as any).Estado ?? (x as any).Estado) === 'EN_REVISION' ? 'warning text-dark' : 'secondary'}`}>
                          {(x as any).Estado ?? (x as any).Estado}
                        </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group" role="group">
                                                {canAprobar && (
                                                    <button className="btn btn-sm btn-outline-success"
                                                            onClick={() => aprobar((x as any).ExpedienteId ?? (x as any).id)}>Aprobar
                                                    </button>
                                                )}
                                                {canRechazar && (
                                                    <button className="btn btn-sm btn-outline-danger"
                                                            onClick={() => abrirRechazo((x as any).ExpedienteId ?? (x as any).id)}>Rechazar
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        const id = (x as any).ExpedienteId ?? (x as any).id;
                                                        navigate(`/expedientes/${id}/indicios`, {
                                                            state: {
                                                                id,
                                                                numero: (x as any).Numero ?? (x as any).numero,
                                                                descripcion: (x as any).Descripcion ?? (x as any).descripcion,
                                                                estado: (x as any).Estado ?? (x as any).estado,
                                                            }
                                                        });
                                                    }}
                                                >
                                                    Indicios
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

            {/* Modal de rechazo */}
            {showReject && (
                <div>
                    <div className="modal fade show" style={{display: 'block'}} role="dialog" aria-modal="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Rechazar expediente</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={cancelarRechazo} disabled={rejectLoading}></button>
                                </div>
                                <form onSubmit={confirmarRechazo}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Justificación del rechazo</label>
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                value={rejectJust}
                                                onChange={(e) => setRejectJust(e.target.value)}
                                                placeholder="Ingrese la justificación"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={cancelarRechazo} disabled={rejectLoading}>Cancelar</button>
                                        <button type="submit" className="btn btn-danger" disabled={rejectLoading || !rejectJust.trim()}>
                                            {rejectLoading ? 'Rechazando…' : 'Confirmar rechazo'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => { if (!rejectLoading) cancelarRechazo(); }} />
                </div>
            )}

        </div>
    );
}
