const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { crearIndicio } = require('../controllers/indicios.controller');

const router = Router();

// Crear indicio (técnico o coordinador)
router.post('/', authMiddleware, authorize({ roles: ['TECNICO', 'COORDINADOR'] }), crearIndicio);

module.exports = router;
