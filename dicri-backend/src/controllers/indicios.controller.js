const { execStoredProcedure, sql } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Indicios
 *   description: Gestión de indicios dentro de un expediente
 */

/**
 * @swagger
 * /api/indicios:
 *   post:
 *     summary: Registrar indicio dentro de un expediente
 *     tags: [Indicios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expedienteId, descripcion]
 *             properties:
 *               expedienteId: { type: integer }
 *               objeto: { type: string }
 *               descripcion: { type: string }
 *               color: { type: string }
 *               tamano: { type: string }
 *               peso: { type: number }
 *               ubicacion: { type: string }
 *     responses:
 *       201:
 *         description: Indicio registrado
 */
async function crearIndicio(req, res) {
  const tecnicoId = req.user?.sub;
  const { expedienteId, objeto = null, descripcion, color = null, tamano = null, peso = null, ubicacion = null } = req.body || {};
  if (!expedienteId || !descripcion) return res.status(400).json({ message: 'expedienteId y descripcion son requeridos' });
  try {
    const result = await execStoredProcedure('Indicios_Create', [
      { name: 'ExpedienteId', type: sql.Int, value: Number(expedienteId) },
      { name: 'Objeto', type: sql.VarChar(200), value: objeto },
      { name: 'Descripcion', type: sql.VarChar(sql.MAX), value: descripcion },
      { name: 'Color', type: sql.VarChar(50), value: color },
      { name: 'Tamano', type: sql.VarChar(50), value: tamano },
      { name: 'Peso', type: sql.Decimal(18,2), value: peso },
      { name: 'Ubicacion', type: sql.VarChar(200), value: ubicacion },
      { name: 'TecnicoId', type: sql.Int, value: tecnicoId }
    ]);
    const row = result.recordset?.[0];
    res.status(201).json({ indicioId: row?.IndicioId, expedienteId, objeto, descripcion, color, tamano, peso, ubicacion });
  } catch (e) {
    console.error('crearIndicio', e);
    res.status(500).json({ message: 'Error al crear indicio' });
  }
}

module.exports = { crearIndicio };
