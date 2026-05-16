const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Authorization required' });
  }

  const base64 = header.replace('Basic ', '');
  const credentials = Buffer.from(base64, 'base64').toString('utf-8');
  const [login, password] = credentials.split(':');

  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  res.status(401).json({ error: 'Invalid credentials' });
}

module.exports = auth;
