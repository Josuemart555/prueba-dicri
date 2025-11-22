const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { crearExpediente, listarExpedientes, aprobarExpediente, rechazarExpediente } = require('../controllers/expedientes.controller');

const router = Router();

// Crear expediente (técnico)
router.post('/', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), crearExpediente);

// Listar expedientes (cualquier autenticado)
router.get('/', authMiddleware, listarExpedientes);

// Aprobar/Rechazar (coordinador)
router.post('/:id/aprobar', authMiddleware, authorize({ roles: ['COORDINADOR'] }), aprobarExpediente);
router.post('/:id/rechazar', authMiddleware, authorize({ roles: ['COORDINADOR'] }), rechazarExpediente);

module.exports = router;
