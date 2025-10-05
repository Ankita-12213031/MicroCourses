const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ msg: 'no token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, iat, ... }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'invalid token' });
  }
}

function permit(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'unauthenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'forbidden' });
    next();
  };
}

module.exports = { auth, permit };
