const http = require('http');

const PORT = process.env.PORT || 3000;

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Patryk' }
];
let nextId = 4;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const match = pathname.match(/^\/users(?:\/(\d+))?$/);

  if (pathname === '/health' && req.method === 'GET') {
    return send(res, 200, { status: 'ok' });
  }

  if (!match) return send(res, 404, { error: 'Not found' });

  const id = match[1] ? Number(match[1]) : null;

  try {
    if (!id && req.method === 'GET') return send(res, 200, users);

    if (!id && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.name) return send(res, 400, { error: 'name is required' });
      const user = { id: nextId++, name: body.name };
      users.push(user);
      return send(res, 201, user);
    }

    const user = users.find(u => u.id === id);
    if (id && !user) return send(res, 404, { error: 'User not found' });

    if (id && req.method === 'GET') return send(res, 200, user);

    if (id && req.method === 'PUT') {
      const body = await readBody(req);
      if (!body.name) return send(res, 400, { error: 'name is required' });
      user.name = body.name;
      return send(res, 200, user);
    }

    if (id && req.method === 'DELETE') {
      users = users.filter(u => u.id !== id);
      return send(res, 204);
    }

    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return send(res, 400, { error: 'Invalid JSON' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Mock server running at http://localhost:${PORT}`));
}

module.exports = server;
