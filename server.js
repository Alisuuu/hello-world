const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const apiKey = process.env.HB_API_KEY;
if (!apiKey) {
  console.error("API Key do Hyperbeam não definida.");
}

let computer = null;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criar ou retornar VM do Hyperbeam
app.get('/computer', async (req, res) => {
  if (computer) return res.send(computer);
  try {
    const response = await axios.post(
      'https://engine.hyperbeam.com/v0/vm',
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    computer = response.data;
    res.send(computer);
  } catch (error) {
    console.error("Erro ao criar VM:", error.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

// Encerrar sessão (resetar VM)
app.get('/reset', (req, res) => {
  computer = null;
  res.send({ message: 'Sessão encerrada com sucesso.' });
});

// Chat em tempo real
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// Porta para Render (usa variável de ambiente)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
