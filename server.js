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

// Cria ou retorna a VM
app.get('/computer', async (req, res) => {
    if (computer) {
        console.log("VM já existente:", computer);
        return res.send(computer);
    }
    console.log("Criando nova VM...");
    try {
        const resp = await axios.post('https://engine.hyperbeam.com/v0/vm', {}, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        computer = resp.data;
        console.log("VM criada com sucesso:", computer);
        res.send(computer);
    } catch (err) {
        console.error("Erro ao criar VM:", err.response ? err.response.data : err.message);
        let errorMessage = 'Erro ao criar VM';
        if (err.response && err.response.data && err.response.data.message.includes('exceeded the active VM limit')) {
            errorMessage = 'Limite de VMs ativas excedido. Por favor, encerre VMs existentes ou atualize seu plano Hyperbeam.';
        }
        res.status(500).send({ error: errorMessage });
    }
});

// Encerra a VM (desaloca recursos)
app.post('/end', async (req, res) => {
    console.log("Recebida requisição para encerrar VM...");
    if (!computer) {
        console.log("Nenhuma VM ativa para encerrar.");
        return res.status(400).send({ error: 'Nenhuma VM ativa' });
    }
    const vmId = computer.id;
    console.log(`Tentando encerrar VM com ID: ${vmId}`);
    try {
        await axios.delete(`https://engine.hyperbeam.com/v0/vm/${vmId}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        console.log(`VM com ID ${vmId} encerrada com sucesso.`);
        computer = null;
        res.send({ success: true });
    } catch (err) {
        console.error(`Erro ao encerrar VM com ID ${vmId}:`, err.response ? err.response.data : err.message);
        res.status(500).send({ error: 'Erro ao encerrar VM' });
    }
});

// Desliga a VM (pode ser um desligamento gracioso antes da desalocação - VERIFICAR API)
app.post('/shutdown', async (req, res) => {
    if (!computer) {
        return res.status(400).send({ error: 'Nenhuma VM ativa para desligar.' });
    }
    const vmId = computer.id;
    console.log(`Tentando desligar VM com ID: ${vmId}`);
    try {
        // *** VERIFICAR A DOCUMENTAÇÃO DA API HYPERBEAM PARA O ENDPOINT CORRETO DE DESLIGAMENTO ***
        const response = await axios.post(
            `https://engine.hyperbeam.com/v0/vm/${vmId}/shutdown`, // Exemplo de URL - **VERIFICAR!**
            {}, // Pode haver um body específico necessário - **VERIFICAR!**
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        const data = response.data;
        console.log(`VM com ID ${vmId} solicitada para desligamento com sucesso:`, data);
        computer = null; // Ou talvez você queira manter o 'computer' ativo por um tempo após o desligamento
        res.send({ success: true, message: 'VM solicitada para desligamento.' });
    } catch (err) {
        console.error(`Erro ao solicitar desligamento da VM com ID ${vmId}:`, err.response ? err.response.data : err.message);
        res.status(500).send({ error: 'Erro ao solicitar desligamento da VM.' });
    }
});

// Socket.IO para chat em tempo real
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    socket.on('chat message', (msg) => {
        console.log('Mensagem recebida:', msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
