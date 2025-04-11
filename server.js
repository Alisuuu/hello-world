const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let computer = null;

const apiKey = process.env.HB_API_KEY;
if (!apiKey) {
  console.error("HB_API_KEY não definida no .env");
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/computer', async (req, res) => {
  try {
    if (!computer) {
      const response = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      computer = response.data;
    }
    res.json(computer);
  } catch (err) {
    console.error('Erro ao criar VM:', err.message);
    res.status(500).json({ error: 'Erro ao criar VM' });
  }
});

app.get('/reset', async (req, res) => {
  try {
    if (computer) {
      await axios.delete(`https://engine.hyperbeam.com/v0/vm/${computer.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      computer = null;
    }
    res.json({ message: 'Sessão encerrada com sucesso.' });
  } catch (err) {
    console.error('Erro ao encerrar VM:', err.message);
    res.status(500).json({ error: 'Erro ao encerrar sessão' });
  }
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
