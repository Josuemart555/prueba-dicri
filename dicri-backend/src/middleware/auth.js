const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// roles: array de roles permitidos, permissions: array de permisos necesarios (cualquiera o todos?)
function authorize({ roles = [], permissions = [] } = {}) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    const userRoles = req.user.roles || [];
    const userPerms = req.user.permissions || [];

    if (roles.length > 0 && !roles.some(r => userRoles.includes(r))) {
      return res.status(403).json({ message: 'Rol no autorizado' });
    }
    if (permissions.length > 0 && !permissions.every(p => userPerms.includes(p))) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    next();
  };
}

module.exports = { authMiddleware, authorize };
