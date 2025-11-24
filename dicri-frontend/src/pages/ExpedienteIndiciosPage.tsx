import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {createPortal} from 'react-dom';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {indiciosService} from '../services/indiciosService';
import {expedientesService} from '../services/expedientesService';
import type {Indicio} from '../types';

type LocationState = {
    id?: number;
    numero?: string;
    descripcion?: string;
    estado?: string;
};

export default function ExpedienteIndiciosPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {state} = useLocation();
    const expId = useMemo(() => Number(id), [id]);

    const expNumero = (state as LocationState)?.numero;
    const expDescripcion = (state as LocationState)?.descripcion;
    const estadoFromState = (state as any)?.Estado ?? (state as any)?.estado ?? null;

    const [items, setItems] = useState<Indicio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const expEstado: string | null = estadoFromState;
    const [expJustificacion, setExpJustificacion] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Indicio | null>(null);

    const [objeto, setObjeto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [color, setColor] = useState('');
    const [tamano, setTamano] = useState('');
    const [peso, setPeso] = useState<string>('');
    const [ubicacion, setUbicacion] = useState('');

    const resetForm = () => {
        setObjeto('');
        setDescripcion('');
        setColor('');
        setTamano('');
        setPeso('');
        setUbicacion('');
    };

    const openCreate = () => {
        setEditing(null);
        resetForm();
        setShowModal(true);
    };

    const openEdit = (row: any) => {
        setEditing({
            id: row.IndicioId ?? row.id,
            ExpedienteId: row.ExpedienteId ?? row.expedienteId ?? expId,
            Objeto: row.Objeto ?? row.objeto ?? '',
            Descripcion: row.Descripcion ?? row.descripcion ?? '',
            Color: row.Color ?? row.color ?? '',
            Tamano: row.Tamano ?? row.tamano ?? '',
            Peso: row.Peso ?? row.peso ?? undefined,
            Ubicacion: row.Ubicacion ?? row.ubicacion ?? '',
        });
        setObjeto(row.Objeto ?? row.objeto ?? '');
        setDescripcion(row.Descripcion ?? row.descripcion ?? '');
        setColor(row.Color ?? row.color ?? '');
        setTamano(row.Tamano ?? row.tamano ?? '');
        setPeso(String(row.Peso ?? row.peso ?? ''));
        setUbicacion(row.Ubicacion ?? row.ubicacion ?? '');
        setShowModal(true);
    };

    const load = async () => {
        if (!expId || Number.isNaN(expId)) return;
        setLoading(true);
        setError(null);
        try {

            const data = await indiciosService.listByExpediente(expId);
            setItems(Array.isArray(data) ? data : []);

            try {
                const rechazos = await expedientesService.getRechazos(expId);
                if (Array.isArray(rechazos) && rechazos.length > 0) {
                    const latest = rechazos
                        .slice()
                        .sort((a: any, b: any) => new Date((b.Fecha ?? b.fecha) as string).getTime() - new Date((a.Fecha ?? a.fecha) as string).getTime())[0];
                    const just = (latest as any)?.Justificacion ?? (latest as any)?.justificacion ?? null;
                    setExpJustificacion(just);
                } else {
                    setExpJustificacion(null);
                }
            } catch (e) {

                setExpJustificacion(null);
            }
        } catch (e: any) {
            setError(e.message || 'Error al cargar los indicios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [expId]);

    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showModal]);

    useEffect(() => {
        if (!showModal) return;
        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                setShowModal(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showModal]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!expId) return;
        setError(null);
        try {
            const payload: Indicio = {
                ExpedienteId: expId,
                Objeto: objeto || undefined,
                Descripcion: descripcion,
                Color: color || undefined,
                Tamano: tamano || undefined,
                Peso: peso ? Number(peso) : undefined,
                Ubicacion: ubicacion || undefined,
            };
            if (editing?.id) {
                await indiciosService.update(editing.id, payload);
            } else {
                await indiciosService.create(payload);
            }
            setShowModal(false);
            resetForm();
            await load();
        } catch (e: any) {
            setError(e.message || 'Error al guardar el indicio');
        }
    };

    const eliminar = async (row: any) => {
        const id = row.IndicioId ?? row.id;
        if (!id) return;
        if (!confirm('¿Eliminar indicio?')) return;
        try {
            await indiciosService.remove(id);
            await load();
        } catch (e: any) {
            setError(e.message || 'Error al eliminar');
        }
    };

    const enviarRevision = async () => {
        if (!expId) return;
        try {
            await expedientesService.cambiarEstado(expId, 'PARA REVISAR');
            navigate('/expedientes');
        } catch (e: any) {
            setError(e.message || 'No se pudo cambiar el estado');
        }
    };

    const marcarCorregido = async () => {
        if (!expId) return;
        try {
            await expedientesService.cambiarEstado(expId, 'CORREGIDO');
            navigate('/expedientes');
        } catch (e: any) {
            setError(e.message || 'No se pudo cambiar el estado a CORREGIDO');
        }
    };

    return (
        <div className="container py-3">
            <div className="d-flex align-items-center mb-3">
                <div>
                    <h1 className="h4 mb-0">Indicios del expediente {expNumero ? `#${expNumero}` : `ID ${expId}`}</h1>
                    {expDescripcion && <div className="text-muted">{expDescripcion}</div>}
                </div>
                <button className="btn btn-outline-secondary ms-auto me-2"
                        onClick={() => navigate('/expedientes')}>Volver
                </button>
                {expEstado === 'REGISTRADO' && (
                    <button className="btn btn-warning" onClick={enviarRevision}>
                        <i className="bi bi-send me-1"/> Enviar a revisión
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
            )}

            {expEstado === 'RECHAZADO' && (
                <div className="alert alert-warning d-flex align-items-start" role="alert">
                    <i className="bi bi-exclamation-triangle me-2 fs-5" aria-hidden/>
                    <div className="flex-grow-1">
                        <div className="fw-bold">Expediente rechazado</div>
                        <div className="small">Razón del rechazo:</div>
                        <div>{expJustificacion || 'Sin justificación proporcionada.'}</div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary ms-3" onClick={marcarCorregido}>
                        <i className="bi bi-check2 me-1"/> Corregido
                    </button>
                </div>
            )}

            <div className="card">
                <div className="card-header d-flex align-items-center">
                    <strong>Indicios</strong>
                    <button className="btn btn-sm btn-primary ms-auto" onClick={openCreate}>
                        <i className="bi bi-plus-lg me-1"/> Crear indicio
                    </button>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-3">Cargando…</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th style={{width: 180}}>Objeto</th>
                                    <th>Descripción</th>
                                    <th style={{width: 120}}>Color</th>
                                    <th style={{width: 120}}>Tamaño</th>
                                    <th style={{width: 100}}>Peso</th>
                                    <th style={{width: 200}}>Ubicación</th>
                                    <th style={{width: 200}} className="text-end">Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((r: any) => (
                                    <tr key={r.IndicioId ?? r.id}>
                                        <td>{r.Objeto ?? r.objeto}</td>
                                        <td>{r.Descripcion ?? r.descripcion}</td>
                                        <td>{r.Color ?? r.color}</td>
                                        <td>{r.Tamano ?? r.tamano}</td>
                                        <td>{r.Peso ?? r.peso}</td>
                                        <td>{r.Ubicacion ?? r.ubicacion}</td>
                                        <td className="text-end">
                                            <div className="btn-group" role="group">
                                                <button className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => openEdit(r)}>Editar
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger"
                                                        onClick={() => eliminar(r)}>Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td className="text-center text-muted py-4" colSpan={7}>Sin indicios</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && createPortal(
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        style={{zIndex: 1055}}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className="modal-dialog modal-lg" role="document" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? 'Editar indicio' : 'Crear indicio'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}/>
                                </div>
                                <form onSubmit={onSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Objeto</label>
                                                <input className="form-control" value={objeto}
                                                       onChange={(e) => setObjeto(e.target.value)}/>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Descripción</label>
                                                <textarea className="form-control" value={descripcion}
                                                          onChange={(e) => setDescripcion(e.target.value)} required/>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label">Color</label>
                                                <input className="form-control" value={color}
                                                       onChange={(e) => setColor(e.target.value)}/>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label">Tamaño</label>
                                                <input className="form-control" value={tamano}
                                                       onChange={(e) => setTamano(e.target.value)}/>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label">Peso</label>
                                                <input className="form-control" type="number" step="0.01" value={peso}
                                                       onChange={(e) => setPeso(e.target.value)}/>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Ubicación</label>
                                                <input className="form-control" value={ubicacion}
                                                       onChange={(e) => setUbicacion(e.target.value)}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary"
                                                onClick={() => setShowModal(false)}>Cancelar
                                        </button>
                                        <button type="submit"
                                                className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop fade show"
                        style={{zIndex: 1050}}
                        onMouseDown={() => setShowModal(false)}
                    />
                </>,
                document.body
            )}
        </div>
    );
}
