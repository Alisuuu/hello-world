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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criar ou retornar a VM
app.get('/computer', async (req, res) => {
  if (computer) return res.send(computer);
  try {
    const response = await axios.post(
      'https://engine.hyperbeam.com/v0/vm',
      {},
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    computer = response.data;
    res.send(computer);
  } catch (error) {
    console.error("Erro ao criar VM:", error.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

// Encerrar VM de verdade
app.get('/reset', async (req, res) => {
  if (!computer || !computer.session_id) {
    return res.status(400).send({ error: 'Nenhuma VM ativa para encerrar.' });
  }

  try {
    await axios.delete(
      `https://engine.hyperbeam.com/v0/vm/${computer.session_id}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    console.log(`VM ${computer.session_id} encerrada.`);
    computer = null;
    res.send({ message: 'VM encerrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao encerrar VM:', error.message);
    res.status(500).send({ error: 'Erro ao encerrar VM' });
  }
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
