const { execStoredProcedure, sql } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Reportes y estadísticas
 */

/**
 * @swagger
 * /api/reportes/resumen:
 *   get:
 *     summary: Resumen y detalle de expedientes aprobados y rechazados
 *     tags: [Reportes]
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
 *         description: Objeto con resumen por estado y listas detalladas de aprobados y rechazados
 */
async function resumen(req, res) {
  const { fechaInicio = null, fechaFin = null } = req.query;
  try {
    const result = await execStoredProcedure('Reportes_Resumen', [
      { name: 'FechaInicio', type: sql.Date, value: fechaInicio ? new Date(fechaInicio) : null },
      { name: 'FechaFin', type: sql.Date, value: fechaFin ? new Date(fechaFin) : null }
    ]);
    const recordsets = result.recordsets || [];
    const resumen = recordsets[0] || [];
    const aprobados = recordsets[1] || [];
    const rechazados = recordsets[2] || [];
    res.json({ resumen, aprobados, rechazados });
  } catch (e) {
    console.error('reportes.resumen', e);
    res.status(500).json({ message: 'Error al obtener reporte' });
  }
}

module.exports = { resumen };
