const { execStoredProcedure, sql } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: CRUD de usuarios y asignación de roles
 */

// Listar usuarios
/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (sin información sensible)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function list(req, res) {
  try {
    const result = await execStoredProcedure('Usuarios_GetAll');
    res.json(result.recordset || []);
  } catch (e) {
    console.error('usuarios.list', e);
    res.status(500).json({ message: 'Error al listar usuarios' });
  }
}

// Obtener usuario por id
/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await execStoredProcedure('Usuarios_GetById', [
      { name: 'UsuarioId', type: sql.Int, value: id }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(row);
  } catch (e) {
    console.error('usuarios.getById', e);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
}

// Crear usuario
/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function create(req, res) {
  try {
    const { nombre, email, password, activo = true } = req.body || {};
    if (!nombre || !email || !password) return res.status(400).json({ message: 'nombre, email y password son requeridos' });
    const rounds = Number.isInteger(parseInt(process.env.BCRYPT_ROUNDS, 10)) ? parseInt(process.env.BCRYPT_ROUNDS, 10) : 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    const result = await execStoredProcedure('Usuarios_Create', [
      { name: 'Nombre', type: sql.NVarChar(150), value: nombre },
      { name: 'Email', type: sql.VarChar(150), value: email },
      { name: 'PasswordHash', type: sql.VarChar(200), value: passwordHash },
      { name: 'Activo', type: sql.Bit, value: activo ? 1 : 0 }
    ]);
    const id = result.recordset?.[0]?.UsuarioId;
    res.status(201).json({ usuarioId: id, nombre, email, activo: !!activo });
  } catch (e) {
    console.error('usuarios.create', e);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
}

// Actualizar usuario (datos básicos)
/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario (nombre, email, activo)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, activo]
 *             properties:
 *               nombre: { type: string }
 *               email: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, email, activo } = req.body || {};
    if (typeof nombre !== 'string' || typeof email !== 'string' || typeof activo === 'undefined') {
      return res.status(400).json({ message: 'nombre, email y activo son requeridos' });
    }
    const result = await execStoredProcedure('Usuarios_Update', [
      { name: 'UsuarioId', type: sql.Int, value: id },
      { name: 'Nombre', type: sql.NVarChar(150), value: nombre },
      { name: 'Email', type: sql.VarChar(150), value: email },
      { name: 'Activo', type: sql.Bit, value: activo ? 1 : 0 }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.json({ usuarioId: id, nombre, email, activo: !!activo });
    res.json(row);
  } catch (e) {
    console.error('usuarios.update', e);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}

// Actualizar contraseña
/**
 * @swagger
 * /api/usuarios/{id}/password:
 *   put:
 *     summary: Actualizar contraseña del usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       204:
 *         description: Contraseña actualizada (sin contenido)
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function updatePassword(req, res) {
  try {
    const id = Number(req.params.id);
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ message: 'password es requerido' });
    const rounds = Number.isInteger(parseInt(process.env.BCRYPT_ROUNDS, 10)) ? parseInt(process.env.BCRYPT_ROUNDS, 10) : 10;
    const passwordHash = await bcrypt.hash(password, rounds);
    await execStoredProcedure('Usuarios_UpdatePassword', [
      { name: 'UsuarioId', type: sql.Int, value: id },
      { name: 'PasswordHash', type: sql.VarChar(200), value: passwordHash }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('usuarios.updatePassword', e);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
}

// Eliminar usuario
/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Usuario eliminado (sin contenido)
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await execStoredProcedure('Usuarios_Delete', [
      { name: 'UsuarioId', type: sql.Int, value: id }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('usuarios.remove', e);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}

// Listar roles de un usuario
/**
 * @swagger
 * /api/usuarios/{id}/roles:
 *   get:
 *     summary: Listar roles asignados a un usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de roles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rol'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function getRoles(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await execStoredProcedure('Usuarios_GetRoles', [
      { name: 'UsuarioId', type: sql.Int, value: id }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('usuarios.getRoles', e);
    res.status(500).json({ message: 'Error al listar roles del usuario' });
  }
}

// Asignar rol a un usuario
/**
 * @swagger
 * /api/usuarios/{id}/roles:
 *   post:
 *     summary: Asignar rol a usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rolId]
 *             properties:
 *               rolId: { type: integer }
 *     responses:
 *       204:
 *         description: Rol asignado (sin contenido)
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function assignRol(req, res) {
  try {
    const id = Number(req.params.id);
    const { rolId } = req.body || {};
    if (!rolId) return res.status(400).json({ message: 'rolId es requerido' });
    await execStoredProcedure('Usuarios_AssignRol', [
      { name: 'UsuarioId', type: sql.Int, value: id },
      { name: 'RolId', type: sql.Int, value: Number(rolId) }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('usuarios.assignRol', e);
    res.status(500).json({ message: 'Error al asignar rol' });
  }
}

// Quitar rol
/**
 * @swagger
 * /api/usuarios/{id}/roles/{rolId}:
 *   delete:
 *     summary: Quitar rol de usuario
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: rolId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Rol removido (sin contenido)
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function removeRol(req, res) {
  try {
    const id = Number(req.params.id);
    const rolId = Number(req.params.rolId);
    await execStoredProcedure('Usuarios_RemoveRol', [
      { name: 'UsuarioId', type: sql.Int, value: id },
      { name: 'RolId', type: sql.Int, value: rolId }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('usuarios.removeRol', e);
    res.status(500).json({ message: 'Error al quitar rol' });
  }
}

module.exports = { list, getById, create, update, updatePassword, remove, getRoles, assignRol, removeRol };
