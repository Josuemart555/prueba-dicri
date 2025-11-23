import { FormEvent, useState } from 'react';
import { indiciosService } from '../services/indiciosService';

export default function IndiciosPage() {
  const [expedienteId, setExpedienteId] = useState<number>(0);
  const [descripcion, setDescripcion] = useState('');
  const [objeto, setObjeto] = useState('');
  const [color, setColor] = useState('');
  const [tamano, setTamano] = useState('');
  const [peso, setPeso] = useState<number | ''>('');
  const [ubicacion, setUbicacion] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await indiciosService.create({
        expedienteId,
        descripcion,
        objeto: objeto || undefined,
        color: color || undefined,
        tamano: tamano || undefined,
        peso: peso === '' ? undefined : Number(peso),
        ubicacion: ubicacion || undefined,
      } as any);
      setMessage('Indicio registrado');
      setExpedienteId(0);
      setDescripcion('');
      setObjeto('');
      setColor('');
      setTamano('');
      setPeso('');
      setUbicacion('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h1>Registrar indicio</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
        <label>
          Expediente ID
          <input type="number" value={expedienteId} onChange={(e) => setExpedienteId(Number(e.target.value))} required />
        </label>
        <label>
          Descripción
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </label>
        <label>
          Objeto
          <input value={objeto} onChange={(e) => setObjeto(e.target.value)} />
        </label>
        <label>
          Color
          <input value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          Tamaño
          <input value={tamano} onChange={(e) => setTamano(e.target.value)} />
        </label>
        <label>
          Peso (kg)
          <input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <label>
          Ubicación
          <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        </label>
        <button type="submit">Guardar</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
