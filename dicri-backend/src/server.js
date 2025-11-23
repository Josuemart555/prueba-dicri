const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

const authRoutes = require('./routes/auth.routes');
const expedienteRoutes = require('./routes/expedientes.routes');
const indicioRoutes = require('./routes/indicios.routes');
const reportesRoutes = require('./routes/reportes.routes');
const permisosRoutes = require('./routes/permisos.routes');
const rolesRoutes = require('./routes/roles.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'dicri-backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/indicios', indicioRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`DICRI backend escuchando en puerto ${PORT}`);
  });
}

module.exports = app;
