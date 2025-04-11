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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
            errorMessage = 'Limite de VMs ativas excedido. Por favor, feche VMs existentes ou atualize seu plano Hyperbeam.';
        }
        res.status(500).send({ error: errorMessage });
    }
});

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

app.post('/shutdown', async (req, res) => {
    if (!computer) {
        return res.status(400).send({ error: 'Nenhuma VM ativa para desligar.' });
    }
    const vmId = computer.id;
    console.log(`Tentando desligar VM com ID: ${vmId}`);
    try {
        const response = await axios.post(
            `https://engine.hyperbeam.com/v0/vm/${vmId}/shutdown`, // VERIFICAR API
            {},
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        const data = response.data;
        console.log(`VM com ID ${vmId} solicitada para desligamento com sucesso:`, data);
        res.send({ success: true, message: 'VM solicitada para desligamento.' });
    } catch (err) {
        console.error(`Erro ao solicitar desligamento da VM com ID ${vmId}:`, err.response ? err.response.data : err.message);
        res.status(500).send({ error: 'Erro ao solicitar desligamento da VM.' });
    }
});

app.post('/restart', async (req, res) => {
    if (!computer) {
        return res.status(400).send({ error: 'Nenhuma VM ativa para reiniciar.' });
    }
    const vmId = computer.id;
    console.log(`Tentando reiniciar VM com ID: ${vmId}`);
    try {
        const response = await axios.post(
            `https://engine.hyperbeam.com/v0/vm/${vmId}/restart`, // VERIFICAR API
            {},
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
