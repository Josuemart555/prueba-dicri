const { execStoredProcedure, sql } = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Permisos
 *   description: CRUD de permisos
 */

/**
 * @swagger
 * /api/permisos:
 *   get:
 *     summary: Listar permisos
 *     tags: [Permisos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de permisos
 */
async function list(req, res) {
  try {
    const result = await execStoredProcedure('Permisos_GetAll');
    res.json(result.recordset || []);
  } catch (e) {
    console.error('permisos.list', e);
    res.status(500).json({ message: 'Error al listar permisos' });
  }
}

/**
 * @swagger
 * /api/permisos/{id}:
 *   get:
 *     summary: Obtener permiso por id
 *     tags: [Permisos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Permiso
 */
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await execStoredProcedure('Permisos_GetById', [
      { name: 'PermisoId', type: sql.Int, value: id }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.status(404).json({ message: 'Permiso no encontrado' });
    res.json(row);
  } catch (e) {
    console.error('permisos.getById', e);
    res.status(500).json({ message: 'Error al obtener permiso' });
  }
}

/**
 * @swagger
 * /api/permisos:
 *   post:
 *     summary: Crear permiso
 *     tags: [Permisos]
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
 *     responses:
 *       201:
 *         description: Creado
 */
async function create(req, res) {
  try {
    const { nombre } = req.body || {};
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const result = await execStoredProcedure('Permisos_Create', [
      { name: 'Nombre', type: sql.VarChar(100), value: nombre }
    ]);
    const id = result.recordset?.[0]?.PermisoId;
    res.status(201).json({ permisoId: id, nombre });
  } catch (e) {
    console.error('permisos.create', e);
    res.status(500).json({ message: 'Error al crear permiso' });
  }
}

/**
 * @swagger
 * /api/permisos/{id}:
 *   put:
 *     summary: Actualizar permiso
 *     tags: [Permisos]
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
 *     responses:
 *       200:
 *         description: Actualizado
 */
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body || {};
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const result = await execStoredProcedure('Permisos_Update', [
      { name: 'PermisoId', type: sql.Int, value: id },
      { name: 'Nombre', type: sql.VarChar(100), value: nombre }
    ]);
    const row = result.recordset?.[0];
    if (!row) return res.json({ permisoId: id, nombre });
    res.json(row);
  } catch (e) {
    console.error('permisos.update', e);
    res.status(500).json({ message: 'Error al actualizar permiso' });
  }
}

/**
 * @swagger
 * /api/permisos/{id}:
 *   delete:
 *     summary: Eliminar permiso
 *     tags: [Permisos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado
 */
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await execStoredProcedure('Permisos_Delete', [
      { name: 'PermisoId', type: sql.Int, value: id }
    ]);
    res.status(204).send();
  } catch (e) {
    console.error('permisos.remove', e);
    res.status(500).json({ message: 'Error al eliminar permiso' });
  }
}

module.exports = { list, getById, create, update, remove };
