const createVMButton = document.getElementById('create-vm');
const endVMButton = document.getElementById('end-vm');
const vmInfoDiv = document.getElementById('vm-info');
const vmIdSpan = document.getElementById('vm-id');
const hyperbeamIframe = document.getElementById('hyperbeam-iframe');
const vmErrorParagraph = document.getElementById('vm-error');

const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

const socket = io();

// Função para exibir mensagens no chat
function appendMessage(message) {
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    chatMessagesDiv.appendChild(newMessage);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll para a última mensagem
}

// Conectar ao servidor Socket.IO
socket.on('connect', () => {
    console.log('Conectado ao servidor de chat');
    appendMessage('Você se conectou ao chat.');
});

// Receber mensagens do chat
socket.on('chat message', (msg) => {
    appendMessage(msg);
});

// Enviar mensagem de chat
sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chat message', message);
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

// Função para criar ou conectar à VM
createVMButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/computer');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comunicar com o servidor');
        }
        const data = await response.json();
        computer = data;
        vmIdSpan.textContent = computer.id;
        hyperbeamIframe.src = computer.url;
        vmInfoDiv.style.display = 'block';
        vmErrorParagraph.style.display = 'none';
        createVMButton.style.display = 'none';
    } catch (error) {
        console.error('Erro ao criar/conectar VM:', error);
        vmErrorParagraph.textContent = error.message;
        vmErrorParagraph.style.display = 'block';
    }
});

// Função para encerrar a VM
endVMButton.addEventListener('click', async () => {
    if (!computer) {
        vmErrorParagraph.textContent = 'Nenhuma VM ativa para encerrar.';
        vmErrorParagraph.style.display = 'block';
        return;
    }
    try {
        const response = await fetch('/end', {
            method: 'POST'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comunicar com o servidor');
        }
        const data = await response.json();
        if (data.success) {
            computer = null;
            vmInfoDiv.style.display = 'none';
            createVMButton.style.display = 'block';
            appendMessage('VM encerrada.');
        } else {
            vmErrorParagraph.textContent = 'Erro ao encerrar a VM.';
            vmErrorParagraph.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao encerrar VM:', error);
        vmErrorParagraph.textContent = error.message;
        vmErrorParagraph.style.display = 'block';
    }
});
