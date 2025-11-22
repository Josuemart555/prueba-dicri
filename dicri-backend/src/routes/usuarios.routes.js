const { Router } = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/usuarios.controller');

const router = Router();

// Lecturas: cualquier autenticado
router.get('/', authMiddleware, ctrl.list);
router.get('/:id', authMiddleware, ctrl.getById);
router.get('/:id/roles', authMiddleware, ctrl.getRoles);

// Mutaciones: solo coordinador
router.post('/', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.create);
router.put('/:id', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.update);
router.put('/:id/password', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.updatePassword);
router.delete('/:id', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.remove);
router.post('/:id/roles', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.assignRol);
router.delete('/:id/roles/:rolId', authMiddleware, authorize({ roles: ['COORDINADOR'] }), ctrl.removeRol);

module.exports = router;
