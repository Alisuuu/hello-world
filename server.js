const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const apiKey = process.env.HB_API_KEY;
if (!apiKey) {
  console.error("API Key do Hyperbeam não definida.");
}

let computer = null;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/computer', async (req, res) => {
  if (computer) return res.send(computer);
  try {
    const resp = await axios.post(
      'https://engine.hyperbeam.com/v0/vm',
      {},
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    computer = resp.data;
    res.send(computer);
  } catch (err) {
    console.error('Erro ao criar VM:', err.response?.data || err.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

app.get('/reset', (req, res) => {
  computer = null;
  res.send({ message: 'Computador resetado.' });
});

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
