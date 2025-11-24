const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DICRI API',
      version: '1.0.0',
      description: 'API REST para gestión de evidencias DICRI (MP Guatemala)'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Indicio: {
          type: 'object',
          properties: {
            indicioId: { type: 'integer', example: 123 },
            expedienteId: { type: 'integer', example: 45 },
            objeto: { type: 'string', example: 'Teléfono celular' },
            descripcion: { type: 'string', example: 'Dispositivo encontrado en la escena' },
            color: { type: 'string', example: 'Negro' },
            tamano: { type: 'string', example: '6 pulgadas' },
            peso: { type: 'number', example: 0.18 },
            ubicacion: { type: 'string', example: 'Cajón del escritorio' },
            tecnicoId: { type: 'integer', example: 10 },
            fechaRegistro: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' }
          }
        },
        Rechazo: {
          type: 'object',
          properties: {
            rechazoId: { type: 'integer', example: 5 },
            expedienteId: { type: 'integer', example: 45 },
            usuarioId: { type: 'integer', example: 2 },
            usuario: { type: 'string', example: 'Coordinador Demo' },
            justificacion: { type: 'string', example: 'Falta documentación de soporte' },
            fecha: { type: 'string', format: 'date-time', example: '2025-02-10T15:30:00Z' }
          }
        },
        ExpedienteRechazado: {
          type: 'object',
          properties: {
            expedienteId: { type: 'integer', example: 45 },
            numero: { type: 'string', example: 'EXP-2025-0001' },
            descripcion: { type: 'string', example: 'Expediente de prueba' },
            fechaRegistro: { type: 'string', format: 'date-time', example: '2025-02-01T12:00:00Z' },
            estado: { type: 'string', example: 'RECHAZADO' },
            tecnicoId: { type: 'integer', example: 10 },
            tecnico: { type: 'string', example: 'Tecnico Demo' },
            ultimoRechazoJustificacion: { type: 'string', example: 'Información incompleta' },
            ultimoRechazoFecha: { type: 'string', format: 'date-time', example: '2025-02-10T15:30:00Z' },
            ultimoRechazoUsuarioId: { type: 'integer', example: 2 },
            ultimoRechazoUsuario: { type: 'string', example: 'Coordinador Demo' }
          }
        },
        Permiso: {
          type: 'object',
          properties: {
            permisoId: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'EXPEDIENTES_CREAR' }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            rolId: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'COORDINADOR' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            usuarioId: { type: 'integer', example: 10 },
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan.perez@dicri.gob.gt' },
            activo: { type: 'boolean', example: true },
            fechaCreacion: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Mensaje de error' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y control de acceso' },
      { name: 'Expedientes', description: 'Gestión de expedientes DICRI' },
      { name: 'Indicios', description: 'Gestión de indicios dentro de un expediente' },
      { name: 'Reportes', description: 'Reportes y estadísticas' },
      { name: 'Permisos', description: 'CRUD de permisos' },
      { name: 'Roles', description: 'CRUD de roles y asignación de permisos' },
      { name: 'Usuarios', description: 'CRUD de usuarios y asignación de roles' }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
