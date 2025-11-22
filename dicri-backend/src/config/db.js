const sql = require('mssql');
require('dotenv').config();

let poolPromise;

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'false') === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true') === 'true'
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

async function execStoredProcedure(spName, inputParams = []) {
  const pool = await getPool();
  const request = pool.request();
  for (const p of inputParams) {
    // p = { name, type, value }
    if (p.type) request.input(p.name, p.type, p.value);
    else request.input(p.name, p.value);
  }
  const result = await request.execute(spName);
  return result;
}

module.exports = {
  sql,
  getPool,
  execStoredProcedure
};
