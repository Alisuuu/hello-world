const path = require('path');
const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// API KEY do Hyperbeam (definida no Render como variável de ambiente)
const apiKey = process.env.HB_API_KEY;
if (!apiKey) {
  console.error("API Key do Hyperbeam não definida.");
}

let computer = null;

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal (index.html dentro de public/)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para criar ou reutilizar uma VM Hyperbeam
app.get('/computer', async (req, res) => {
  if (computer) return res.send(computer);
  try {
    const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    computer = resp.data;
    res.send(computer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

// Lógica do chat com socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// Porta padrão para Render
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
