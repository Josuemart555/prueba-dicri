const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { crearExpediente, listarExpedientes, aprobarExpediente, rechazarExpediente, actualizarEstadoExpediente, listarExpedientesRechazados, obtenerRechazosPorExpediente } = require('../controllers/expedientes.controller');

const router = Router();

// Crear expediente (técnico)
router.post('/', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), crearExpediente);

// Listar expedientes (cualquier autenticado)
router.get('/', authMiddleware, listarExpedientes);

// Listar rechazados (solo lectura)
router.get('/rechazados', authMiddleware, listarExpedientesRechazados);

// Aprobar/Rechazar (coordinador)
router.post('/:id/aprobar', authMiddleware, authorize({ roles: ['COORDINADOR'] }), aprobarExpediente);
router.post('/:id/rechazar', authMiddleware, authorize({ roles: ['COORDINADOR'] }), rechazarExpediente);

// Actualizar estado genérico (técnico o coordinador)
router.post('/:id/estado', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), actualizarEstadoExpediente);

// Historial de rechazos por expediente (solo lectura)
router.get('/:id/rechazos', authMiddleware, obtenerRechazosPorExpediente);

module.exports = router;
