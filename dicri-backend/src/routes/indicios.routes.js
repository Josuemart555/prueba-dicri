const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { crearIndicio, obtenerIndicioPorId, editarIndicio, eliminarIndicio, obtenerIndiciosPorExpediente } = require('../controllers/indicios.controller');

const router = Router();

// Crear indicio (técnico o coordinador)
router.post('/', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), crearIndicio);

// Listar indicios por expediente: /api/indicios?expedienteId=1
router.get('/', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), obtenerIndiciosPorExpediente);

// Obtener indicio por id
router.get('/:id', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), obtenerIndicioPorId);

// Editar indicio
router.put('/:id', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), editarIndicio);

// Eliminar indicio
router.delete('/:id', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), eliminarIndicio);

module.exports = router;
