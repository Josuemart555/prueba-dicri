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

/**
 * @swagger
 * /api/expedientes/{id}/estado:
 *   post:
 *     summary: Actualizar estado del expediente
 *     description: Permite establecer el estado de un expediente. Si el estado es RECHAZADO, se requiere justificacion.
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
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 example: PARA REVISAR
 *               justificacion:
 *                 type: string
 *                 description: Requerida cuando estado = RECHAZADO
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Petición inválida
 */
async function actualizarEstadoExpediente(req, res) {
  try {
    const expedienteId = Number(req.params.id);
    const usuarioId = req.user?.sub;
    const { estado, justificacion = null } = req.body || {};

    if (!expedienteId) return res.status(400).json({ message: 'id inválido' });
    if (!estado || typeof estado !== 'string' || !estado.trim()) {
      return res.status(400).json({ message: 'estado es requerido' });
    }

    const nuevoEstado = estado.trim().toUpperCase();
    if (nuevoEstado === 'RECHAZADO') {
      const justText = (justificacion ?? '').toString().trim();
      if (!justText) return res.status(400).json({ message: 'justificacion requerida para RECHAZADO' });
    }

    await execStoredProcedure('Expedientes_UpdateEstado', [
      { name: 'ExpedienteId', type: sql.Int, value: expedienteId },
      { name: 'NuevoEstado', type: sql.VarChar(20), value: nuevoEstado },
      { name: 'UsuarioId', type: sql.Int, value: usuarioId },
      { name: 'Justificacion', type: sql.VarChar(sql.MAX), value: justificacion ?? null }
    ]);

    res.json({ message: 'Estado actualizado', estado: nuevoEstado });
  } catch (e) {
    console.error('actualizarEstadoExpediente', e);
    res.status(500).json({ message: 'Error al actualizar estado del expediente' });
  }
}

/**
 * @swagger
 * /api/expedientes/rechazados:
 *   get:
 *     summary: Listar expedientes rechazados
 *     description: Retorna los expedientes cuyo estado es RECHAZADO. Solo lectura.
 *     tags: [Expedientes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fechaFin
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de expedientes rechazados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpedienteRechazado'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function listarExpedientesRechazados(req, res) {
  const { fechaInicio = null, fechaFin = null } = req.query || {};
  try {
    const result = await execStoredProcedure('Expedientes_Rechazados_List', [
      { name: 'FechaInicio', type: sql.Date, value: fechaInicio ? new Date(fechaInicio) : null },
      { name: 'FechaFin', type: sql.Date, value: fechaFin ? new Date(fechaFin) : null }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('listarExpedientesRechazados', e);
    res.status(500).json({ message: 'Error al listar expedientes rechazados' });
  }
}

/**
 * @swagger
 * /api/expedientes/{id}/rechazos:
 *   get:
 *     summary: Obtener historial de rechazos por expediente
 *     description: Lista de rechazos registrados para un expediente específico. Solo lectura.
 *     tags: [Expedientes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de rechazos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rechazo'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function obtenerRechazosPorExpediente(req, res) {
  const expedienteId = Number(req.params.id);
  if (!expedienteId) return res.status(400).json({ message: 'id inválido' });
  try {
    const result = await execStoredProcedure('Rechazos_GetByExpedienteId', [
      { name: 'ExpedienteId', type: sql.Int, value: expedienteId }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('obtenerRechazosPorExpediente', e);
    res.status(500).json({ message: 'Error al obtener rechazos del expediente' });
  }
}

module.exports = {
  crearExpediente,
  listarExpedientes,
  aprobarExpediente,
  rechazarExpediente,
  actualizarEstadoExpediente,
  listarExpedientesRechazados,
  obtenerRechazosPorExpediente
};
