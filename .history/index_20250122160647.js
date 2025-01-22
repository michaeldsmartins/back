// Importar módulos necessários
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'database.json');

// Verificar se o arquivo do banco de dados existe, caso contrário, criar um
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Função para obter usuários do banco de dados
const getUsers = () => {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
};

// Função para salvar usuários no banco de dados
const saveUsers = (users) => {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

// Criar o servidor
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Configurar headers padrão
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && pathname === '/users') {
        // Retornar todos os usuários
        const users = getUsers();
        res.writeHead(200);
        res.end(JSON.stringify(users));
    } else if (req.method === 'POST' && pathname === '/users') {
        // Adicionar um novo usuário
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { name, email } = JSON.parse(body);

                if (!name || !email) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Nome e email são obrigatórios.' }));
                    return;
                }

                const users = getUsers();
                const newUser = { id: Date.now(), name, email };
                users.push(newUser);
                saveUsers(users);

                res.writeHead(201);
                res.end(JSON.stringify(newUser));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Erro ao processar a solicitação.' }));
            }
        });
    } else {
        // Rota não encontrada
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
    }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});
