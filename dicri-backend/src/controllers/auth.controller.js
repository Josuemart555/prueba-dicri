const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { execStoredProcedure, sql } = require('../config/db');

// Normaliza hashes bcrypt provenientes de otros ecosistemas (p. ej., PHP) que usan prefijo $2y$
// La librería bcrypt para Node soporta $2a/$2b. $2y$ es equivalente a $2b$ para nuestros fines.
function normalizeBcryptHash(hash) {
  if (typeof hash !== 'string') return hash;
  if (hash.startsWith('$2y$')) return '$2b$' + hash.slice(4);
  return hash;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token de acceso y datos del usuario
 *       401:
 *         description: Credenciales inválidas
 */
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  try {
    const result = await execStoredProcedure('Auth_Login', [
      { name: 'Email', type: sql.VarChar(150), value: email }
    ]);
    const rows = result.recordset || [];
    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    let passwordHash = user.PasswordHash;
    if (!passwordHash || typeof passwordHash !== 'string') {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    // Soporte para hashes con prefijo $2y$ (e.g., generados en PHP)
    passwordHash = normalizeBcryptHash(passwordHash);

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    // Obtener roles y permisos de recordsets adicionales si los hay
    const roles = (result.recordsets && result.recordsets[1]) ? result.recordsets[1].map(r => r.Rol) : (user.Roles ? user.Roles.split(',') : []);
    const permissions = (result.recordsets && result.recordsets[2]) ? result.recordsets[2].map(p => p.Permiso) : (user.Permisos ? user.Permisos.split(',') : []);

    const payload = { sub: user.UsuarioId, email: user.Email, nombre: user.Nombre, roles, permissions };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Error en login' });
  }
}

module.exports = { login };

/**
 * @swagger
 * /api/auth/hash:
 *   post:
 *     summary: Generar hash bcrypt a partir de una contraseña
 *     tags: [Auth]
 *     description: |
 *     parameters:
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *           enum: ["2b", "2y"]
 *         description: Prefijo deseado en el hash resultante (por defecto 2b)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *               rounds:
 *                 type: integer
 *                 description: Coste (salt rounds). Si no se envía, usa BCRYPT_ROUNDS o 10.
 *     responses:
 *       200:
 *         description: Hash generado
 *       400:
 *         description: Petición inválida
 */
async function hashPassword(req, res) {
  try {
    const { password, rounds } = req.body || {};
    const desiredPrefix = (req.query && typeof req.query.prefix === 'string') ? req.query.prefix : '2b';
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'La contraseña (password) es requerida' });
    }
    const saltRoundsFromEnv = parseInt(process.env.BCRYPT_ROUNDS, 10);
    const cost = Number.isInteger(rounds) ? rounds : (Number.isInteger(saltRoundsFromEnv) ? saltRoundsFromEnv : 10);
    if (cost < 4 || cost > 15) {
      return res.status(400).json({ message: 'rounds debe estar entre 4 y 15' });
    }
    const hash = await bcrypt.hash(password, cost);
    // hash generado en Node tendrá prefijo $2b$
    let output = hash;
    if (desiredPrefix === '2y' && typeof hash === 'string' && hash.startsWith('$2b$')) {
      output = '$2y$' + hash.slice(4);
    }
    res.json({ hash: output, rounds: cost, prefix: desiredPrefix === '2y' ? '2y' : '2b' });
  } catch (err) {
    console.error('Hash generation error', err);
    res.status(500).json({ message: 'Error generando hash' });
  }
}

module.exports.hashPassword = hashPassword;
