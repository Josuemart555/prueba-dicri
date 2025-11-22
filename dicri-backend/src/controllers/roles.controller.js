const { execStoredProcedure, sql } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: CRUD de roles y asignación de permisos
 */

// Listar roles
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar roles
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de roles
 */
async function list(req, res) {
  try {
    const result = await execStoredProcedure('Roles_GetAll');
    res.json(result.recordset || []);
  } catch (e) {
    console.error('roles.list', e);
    res.status(500).json({ message: 'Error al listar roles' });
  }
}

// Obtener rol por id
/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por id
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rol
 */
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await execStoredProcedure('Roles_GetById', [
      { name: 'RolId', type: sql.Int, value: id }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(row);
  } catch (e) {
    console.error('roles.getById', e);
    res.status(500).json({ message: 'Error al obtener rol' });
  }
}

// Crear rol
/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear rol
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 */
async function create(req, res) {
  try {
    const { nombre } = req.body || {};
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const result = await execStoredProcedure('Roles_Create', [
      { name: 'Nombre', type: sql.VarChar(50), value: nombre }
    ]);
    const id = result.recordset?.[0]?.RolId;
    res.status(201).json({ rolId: id, nombre });
  } catch (e) {
    console.error('roles.create', e);
    res.status(500).json({ message: 'Error al crear rol' });
  }
}

// Actualizar rol
/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar rol
 *     tags: [Roles]
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
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 */
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body || {};
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const result = await execStoredProcedure('Roles_Update', [
      { name: 'RolId', type: sql.Int, value: id },
      { name: 'Nombre', type: sql.VarChar(50), value: nombre }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.json({ rolId: id, nombre });
    res.json(row);
  } catch (e) {
    console.error('roles.update', e);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
}

// Eliminar rol
/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar rol
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await execStoredProcedure('Roles_Delete', [
      { name: 'RolId', type: sql.Int, value: id }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('roles.remove', e);
    res.status(500).json({ message: 'Error al eliminar rol' });
  }
}

// Obtener permisos de un rol
/**
 * @swagger
 * /api/roles/{id}/permisos:
 *   get:
 *     summary: Listar permisos asignados a un rol
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
async function getPermisos(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await execStoredProcedure('Roles_GetPermisos', [
      { name: 'RolId', type: sql.Int, value: id }
    ]);
    res.json(result.recordset || []);
  } catch (e) {
    console.error('roles.getPermisos', e);
    res.status(500).json({ message: 'Error al listar permisos del rol' });
  }
}

// Asignar permiso a rol
/**
 * @swagger
 * /api/roles/{id}/permisos:
 *   post:
 *     summary: Asignar permiso a un rol
 *     tags: [Roles]
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
 *             required: [permisoId]
 *             properties:
 *               permisoId: { type: integer }
 */
async function assignPermiso(req, res) {
  try {
    const id = Number(req.params.id);
    const { permisoId } = req.body || {};
    if (!permisoId) return res.status(400).json({ message: 'permisoId es requerido' });
    await execStoredProcedure('Roles_AssignPermiso', [
      { name: 'RolId', type: sql.Int, value: id },
      { name: 'PermisoId', type: sql.Int, value: Number(permisoId) }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('roles.assignPermiso', e);
    res.status(500).json({ message: 'Error al asignar permiso' });
  }
}

// Quitar permiso de rol
/**
 * @swagger
 * /api/roles/{id}/permisos/{permisoId}:
 *   delete:
 *     summary: Quitar permiso de un rol
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: permisoId
 *         required: true
 *         schema: { type: integer }
 */
async function removePermiso(req, res) {
  try {
    const id = Number(req.params.id);
    const permisoId = Number(req.params.permisoId);
    await execStoredProcedure('Roles_RemovePermiso', [
      { name: 'RolId', type: sql.Int, value: id },
      { name: 'PermisoId', type: sql.Int, value: permisoId }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('roles.removePermiso', e);
    res.status(500).json({ message: 'Error al quitar permiso' });
  }
}

module.exports = { list, getById, create, update, remove, getPermisos, assignPermiso, removePermiso };
