const express = require('express');
const path = require('path');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const apiKey = process.env.HB_API_KEY;
let computer = null;

if (!apiKey) {
  console.error("Erro: HB_API_KEY não está definida no .env");
}

app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Criar nova VM
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
  } catch (error) {
    console.error('Erro ao criar VM:', error.message);
    res.status(500).send({ error: 'Erro ao criar VM' });
  }
});

// Encerrar VM
app.delete('/computer/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await axios.delete(`https://engine.hyperbeam.com/v0/vm/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    computer = null;
    res.sendStatus(204);
  } catch (error) {
    console.error('Erro ao encerrar VM:', error.message);
    res.status(500).send({ error: 'Erro ao encerrar VM' });
  }
});

// Chat
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
