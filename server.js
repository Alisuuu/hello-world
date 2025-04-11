const path = require('path');
const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const apiKey = process.env.HB_API_KEY;
if (!apiKey) {
  console.error("API Key do Hyperbeam não definida. Verifique a variável HB_API_KEY no Render.");
}

let computer = null;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para criar/retornar uma VM Hyperbeam
app.get('/computer', async (req, res) => {
  if (computer) return res.send(computer);

  try {
    const response = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    computer = response.data;
    res.send(computer);
  } catch (err) {
    console.error('Erro ao criar VM:', err.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

// WebSocket para chat
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// Inicializa o servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
