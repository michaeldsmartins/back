// api/users.js
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(dbPath, 'utf-8');
      const users = JSON.parse(data);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao ler os usuários.' });
    }
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { name, email } = JSON.parse(body);

        if (!name || !email) {
          res.status(400).json({ error: 'Nome e email são obrigatórios.' });
          return;
        }

        const data = await fs.readFile(dbPath, 'utf-8');
        const users = JSON.parse(data);
        const newUser = { id: Date.now(), name, email };
        users.push(newUser);

        await fs.writeFile(dbPath, JSON.stringify(users, null, 2));

        res.status(201).json(newUser);
      } catch (err) {
        res.status(500).json({ error: 'Erro ao processar a solicitação.' });
      }
    });
  } else {
    res.status(404).json({ error: 'Rota não encontrada.' });
  }
}
