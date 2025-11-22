const { Router } = require('express');
const { login, hashPassword } = require('../controllers/auth.controller');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y control de acceso
 */

router.post('/login', login);
router.post('/hash', hashPassword);

module.exports = router;
