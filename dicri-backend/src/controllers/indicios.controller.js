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
    console.log(req.body);
  const tecnicoId = req.user?.sub;
  const { expedienteId, objeto = null, descripcion, color = null, tamano = null, peso = null, ubicacion = null } = req.body || {};
  // if (!expedienteId || !descripcion) return res.status(400).json({ message: 'expedienteId y descripcion son requeridos' });
  try {
    const result = await execStoredProcedure('Indicios_Create', [
      { name: 'ExpedienteId', type: sql.Int, value: Number(req.body.ExpedienteId) },
      { name: 'Objeto', type: sql.VarChar(200), value: req.body.Objeto },
      { name: 'Descripcion', type: sql.VarChar(sql.MAX), value: req.body.Descripcion },
      { name: 'Color', type: sql.VarChar(50), value: req.body.Color },
      { name: 'Tamano', type: sql.VarChar(50), value: req.body.Tamano },
      { name: 'Peso', type: sql.Decimal(18,2), value: req.body.Teso },
      { name: 'Ubicacion', type: sql.VarChar(200), value: req.body.Ubicacion },
      { name: 'TecnicoId', type: sql.Int, value: tecnicoId }
    ]);
    const row = result.recordset?.[0];
    res.status(201).json({ indicioId: row?.IndicioId, expedienteId, objeto, descripcion, color, tamano, peso, ubicacion });
  } catch (e) {
    console.error('crearIndicio', e);
    res.status(500).json({ message: 'Error al crear indicio' });
  }
}

/**
 * @swagger
 * /api/indicios/{id}:
 *   get:
 *     summary: Obtener indicio por id
 *     tags: [Indicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Indicio encontrado
 *       404:
 *         description: Indicio no encontrado
 */
async function obtenerIndicioPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id inválido' });
    const result = await execStoredProcedure('Indicios_GetById', [
      { name: 'IndicioId', type: sql.Int, value: id }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.status(404).json({ message: 'Indicio no encontrado' });
    res.json(row);
  } catch (e) {
    console.error('obtenerIndicioPorId', e);
    res.status(500).json({ message: 'Error al obtener indicio' });
  }
}

/**
 * @swagger
 * /api/indicios/{id}:
 *   put:
 *     summary: Editar indicio
 *     tags: [Indicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objeto: { type: string }
 *               descripcion: { type: string }
 *               color: { type: string }
 *               tamano: { type: string }
 *               peso: { type: number }
 *               ubicacion: { type: string }
 *     responses:
 *       200:
 *         description: Indicio actualizado
 *       404:
 *         description: Indicio no encontrado
 */
async function editarIndicio(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id inválido' });
    const { objeto = null, descripcion = null, color = null, tamano = null, peso = null, ubicacion = null } = req.body || {};

    // Ejecutar actualización
    const result = await execStoredProcedure('Indicios_Update', [
      { name: 'IndicioId', type: sql.Int, value: id },
      { name: 'Objeto', type: sql.VarChar(200), value: objeto },
      { name: 'Descripcion', type: sql.VarChar(sql.MAX), value: descripcion },
      { name: 'Color', type: sql.VarChar(50), value: color },
      { name: 'Tamano', type: sql.VarChar(50), value: tamano },
      { name: 'Peso', type: sql.Decimal(18,2), value: peso },
      { name: 'Ubicacion', type: sql.VarChar(200), value: ubicacion }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.status(404).json({ message: 'Indicio no encontrado' });
    res.json(row);
  } catch (e) {
    console.error('editarIndicio', e);
    res.status(500).json({ message: 'Error al actualizar indicio' });
  }
}

/**
 * @swagger
 * /api/indicios/{id}:
 *   delete:
 *     summary: Eliminar indicio
 *     tags: [Indicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado correctamente
 *       404:
 *         description: Indicio no encontrado
 */
async function eliminarIndicio(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id inválido' });

    // Antes de eliminar, verificar existencia
    const exists = await execStoredProcedure('Indicios_GetById', [
      { name: 'IndicioId', type: sql.Int, value: id }
    ]);
    if (!exists.recordset?.[0]) return res.status(404).json({ message: 'Indicio no encontrado' });

    await execStoredProcedure('Indicios_Delete', [
      { name: 'IndicioId', type: sql.Int, value: id }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('eliminarIndicio', e);
    res.status(500).json({ message: 'Error al eliminar indicio' });
  }
}

/**
 * @swagger
 * /api/indicios:
 *   get:
 *     summary: Listar indicios por expediente
 *     tags: [Indicios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: expedienteId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de indicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Indicio'
 *       400:
 *         description: Parámetro expedienteId inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function obtenerIndiciosPorExpediente(req, res) {
  try {
    const expedienteId = Number(req.query.expedienteId);
    if (!expedienteId) return res.status(400).json({ message: 'expedienteId es requerido y debe ser numérico' });

    const result = await execStoredProcedure('Indicios_GetByExpedienteId', [
      { name: 'ExpedienteId', type: sql.Int, value: expedienteId }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('obtenerIndiciosPorExpediente', e);
    res.status(500).json({ message: 'Error al obtener indicios del expediente' });
  }
}

module.exports = { crearIndicio, obtenerIndicioPorId, editarIndicio, eliminarIndicio, obtenerIndiciosPorExpediente };
