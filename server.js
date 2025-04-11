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
let computer = null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve a página inicial do frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cria ou retorna a VM (já existente)
app.get('/computer', async (req, res) => {
    // ... (seu código existente) ...
});

// Encerra (fecha/deleta) a VM (já existente)
app.post('/end', async (req, res) => {
    // ... (seu código existente) ...
});

// Desliga a VM (já existente - ajuste conforme a API)
app.post('/shutdown', async (req, res) => {
    // ... (seu código existente) ...
});

// Reinicia a VM (você precisará verificar o endpoint correto na API do Hyperbeam)
app.post('/restart', async (req, res) => {
    if (!computer) {
        return res.status(400).send({ error: 'Nenhuma VM ativa para reiniciar.' });
    }
    const vmId = computer.id;
    console.log(`Tentando reiniciar VM com ID: ${vmId}`);
    try {
        // *** VERIFICAR A DOCUMENTAÇÃO DA API HYPERBEAM PARA O ENDPOINT DE REINICIALIZAÇÃO ***
        const response = await axios.post(
            `https://engine.hyperbeam.com/v0/vm/${vmId}/restart`, // Exemplo de URL - **VERIFICAR!**
            {}, // Pode haver um body específico necessário - **VERIFICAR!**
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        const data = response.data;
        console.log(`VM com ID ${vmId} solicitada para reinicialização com sucesso:`, data);
        res.send({ success: true, message: 'VM solicitada para reinicialização.' });
    } catch (err) {
        console.error(`Erro ao solicitar reinicialização da VM com ID ${vmId}:`, err.response ? err.response.data : err.message);
        res.status(500).send({ error: 'Erro ao solicitar reinicialização da VM.' });
    }
});

// Socket.IO para chat em tempo real (já existente)
io.on('connection', (socket) => {
    // ... (seu código existente) ...
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
