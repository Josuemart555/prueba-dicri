const { execStoredProcedure, sql } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión de expedientes DICRI
 */

/**
 * @swagger
 * /api/expedientes:
 *   post:
 *     summary: Crear expediente DICRI
 *     tags: [Expedientes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [numero, fechaRegistro]
 *             properties:
 *               numero:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fechaRegistro:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Expediente creado
 */
async function crearExpediente(req, res) {
  const { numero, descripcion = null, fechaRegistro } = req.body || {};
  const tecnicoId = req.user?.sub;
  if (!numero || !fechaRegistro) return res.status(400).json({ message: 'numero y fechaRegistro son requeridos' });
  try {
    const result = await execStoredProcedure('Expedientes_Create', [
      { name: 'Numero', type: sql.VarChar(50), value: numero },
      { name: 'Descripcion', type: sql.VarChar(sql.MAX), value: descripcion },
      { name: 'FechaRegistro', type: sql.DateTime2, value: new Date(fechaRegistro) },
      { name: 'TecnicoId', type: sql.Int, value: tecnicoId }
    ]);
    const row = result.recordset?.[0];
    res.status(201).json({ expedienteId: row?.ExpedienteId, numero, descripcion, fechaRegistro, estado: 'REGISTRADO' });
  } catch (e) {
    console.error('crearExpediente', e);
    res.status(500).json({ message: 'Error al crear expediente' });
  }
}

/**
 * @swagger
 * /api/expedientes:
 *   get:
 *     summary: Listar expedientes con filtros
 *     tags: [Expedientes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *       - in: query
 *         name: fechaInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fechaFin
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de expedientes
 */
async function listarExpedientes(req, res) {
  const { estado = null, fechaInicio = null, fechaFin = null } = req.query;
  try {
    const result = await execStoredProcedure('Expedientes_List', [
      { name: 'Estado', type: sql.VarChar(20), value: estado },
      { name: 'FechaInicio', type: sql.Date, value: fechaInicio ? new Date(fechaInicio) : null },
      { name: 'FechaFin', type: sql.Date, value: fechaFin ? new Date(fechaFin) : null }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('listarExpedientes', e);
    res.status(500).json({ message: 'Error al listar expedientes' });
  }
}

/**
 * @swagger
 * /api/expedientes/{id}/aprobar:
 *   post:
 *     summary: Aprobar expediente
 *     tags: [Expedientes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Aprobado
 */
async function aprobarExpediente(req, res) {
  const { id } = req.params;
  const coordinadorId = req.user?.sub;
  try {
    await execStoredProcedure('Expedientes_UpdateEstado', [
      { name: 'ExpedienteId', type: sql.Int, value: Number(id) },
      { name: 'NuevoEstado', type: sql.VarChar(20), value: 'APROBADO' },
      { name: 'UsuarioId', type: sql.Int, value: coordinadorId },
      { name: 'Justificacion', type: sql.VarChar(sql.MAX), value: null }
    ]);
    res.json({ message: 'Expediente aprobado' });
  } catch (e) {
    console.error('aprobarExpediente', e);
    res.status(500).json({ message: 'Error al aprobar expediente' });
  }
}

/**
 * @swagger
 * /api/expedientes/{id}/rechazar:
 *   post:
 *     summary: Rechazar expediente
 *     tags: [Expedientes]
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
 *             required: [justificacion]
 *             properties:
 *               justificacion: { type: string }
 *     responses:
 *       200:
 *         description: Rechazado
 */
async function rechazarExpediente(req, res) {
  const { id } = req.params;
  const { justificacion } = req.body || {};
  const coordinadorId = req.user?.sub;
  if (!justificacion) return res.status(400).json({ message: 'justificacion requerida' });
  try {
    await execStoredProcedure('Expedientes_UpdateEstado', [
      { name: 'ExpedienteId', type: sql.Int, value: Number(id) },
      { name: 'NuevoEstado', type: sql.VarChar(20), value: 'RECHAZADO' },
      { name: 'UsuarioId', type: sql.Int, value: coordinadorId },
      { name: 'Justificacion', type: sql.VarChar(sql.MAX), value: justificacion }
    ]);
    res.json({ message: 'Expediente rechazado' });
  } catch (e) {
    console.error('rechazarExpediente', e);
    res.status(500).json({ message: 'Error al rechazar expediente' });
  }
}

module.exports = {
  crearExpediente,
  listarExpedientes,
  aprobarExpediente,
  rechazarExpediente
};
