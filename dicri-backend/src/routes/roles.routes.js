const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/roles.controller');

const router = Router();

// Lecturas: cualquier autenticado
router.get('/', authMiddleware, ctrl.list);
router.get('/:id', authMiddleware, ctrl.getById);
router.get('/:id/permisos', authMiddleware, ctrl.getPermisos);

// Mutaciones: solo coordinador
router.post('/', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.create);
router.put('/:id', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.update);
router.delete('/:id', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.remove);
router.post('/:id/permisos', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.assignPermiso);
router.delete('/:id/permisos/:permisoId', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.removePermiso);

module.exports = router;
