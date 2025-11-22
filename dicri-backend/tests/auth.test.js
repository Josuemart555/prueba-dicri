jest.mock('../src/config/db', () => ({
  execStoredProcedure: jest.fn(async () => ({
    recordset: [{ UsuarioId: 1, Email: 'user@test.com', Nombre: 'User', PasswordHash: 'ignored-hash' }],
    recordsets: [
      [{ UsuarioId: 1 }],
      [{ Rol: 'TECNICO' }],
      [{ Permiso: 'INDICIOS_CREAR' }]
    ]
  })),
  sql: { VarChar: () => {}, Int: () => {} }
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(async () => true)
}));

const request = require('supertest');
const app = require('../src/server');

describe('Auth login', () => {
  it('debe devolver token con credenciales válidas', async () => {
    // La contraseña en el mock es el hash de 'password' generado con bcrypt 10 rondas
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('roles');
  });
});
