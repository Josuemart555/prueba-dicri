const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { resumen } = require('../controllers/reportes.controller');

const router = Router();

router.get('/resumen', authMiddleware, resumen);

module.exports = router;
