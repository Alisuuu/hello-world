const createVMButton = document.getElementById('create-vm');
const endVMButton = document.getElementById('end-vm'); // Ainda referenciado para a lógica de fechamento
const shutdownVMButton = document.getElementById('shutdown-vm');
const restartVMButton = document.getElementById('restart-vm');
const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');
const vmInfoDiv = document.getElementById('vm-info');
const vmIdSpan = document.getElementById('vm-id');
const hyperbeamIframe = document.getElementById('hyperbeam-iframe');
const vmErrorParagraph = document.getElementById('vm-error');

const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

const socket = io();
let computer = null; // Mantenha a variável computer

// Função para exibir mensagens no chat (já existente)
function appendMessage(message) {
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    chatMessagesDiv.appendChild(newMessage);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

// Conectar ao servidor Socket.IO (já existente)
socket.on('connect', () => {
    console.log('Conectado ao servidor de chat');
    appendMessage('Você se conectou ao chat.');
});

// Receber mensagens do chat (já existente)
socket.on('chat message', (msg) => {
    appendMessage(msg);
});

// Enviar mensagem de chat (já existente)
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

// Função para criar ou conectar à VM (já existente)
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

// Alternar a visibilidade do menu de configurações
settingsButton.addEventListener('click', () => {
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
});

// Fechar o menu de configurações ao clicar fora
window.addEventListener('click', (event) => {
    if (!event.target.matches('#settings-button')) {
        if (settingsMenu.style.display === 'block') {
            settingsMenu.style.display = 'none';
        }
    }
});

// Função para desligar a VM
shutdownVMButton.addEventListener('click', async () => {
    if (!computer) {
        vmErrorParagraph.textContent = 'Nenhuma VM ativa para desligar.';
        vmErrorParagraph.style.display = 'block';
        return;
    }
    try {
        const response = await fetch('/shutdown', { // Assumindo que você tem essa rota no servidor
            method: 'POST'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comunicar com o servidor para desligar a VM');
        }
        const data = await response.json();
        if (data.success) {
            computer = null;
            vmInfoDiv.style.display = 'none';
            createVMButton.style.display = 'block';
            appendMessage('VM desligada.');
        } else {
            vmErrorParagraph.textContent = 'Erro ao desligar a VM.';
            vmErrorParagraph.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao desligar VM:', error);
        vmErrorParagraph.textContent = error.message;
        vmErrorParagraph.style.display = 'block';
    } finally {
        settingsMenu.style.display = 'none'; // Fechar o menu após a ação
    }
});

// Função para reiniciar a VM (você precisará implementar a rota '/restart' no servidor)
restartVMButton.addEventListener('click', async () => {
    if (!computer) {
        vmErrorParagraph.textContent = 'Nenhuma VM ativa para reiniciar.';
        vmErrorParagraph.style.display = 'block';
        return;
    }
    try {
        const response = await fetch('/restart', { // Rota a ser implementada no servidor
            method: 'POST'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comunicar com o servidor para reiniciar a VM');
        }
        const data = await response.json();
        if (data.success) {
            // Lógica após a reinicialização (opcional)
            appendMessage('Solicitação de reinicialização da VM enviada.');
        } else {
            vmErrorParagraph.textContent = 'Erro ao reiniciar a VM.';
            vmErrorParagraph.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao reiniciar VM:', error);
        vmErrorParagraph.textContent = error.message;
        vmErrorParagraph.style.display = 'block';
    } finally {
        settingsMenu.style.display = 'none'; // Fechar o menu após a ação
    }
});

// Função para encerrar (fechar/deletar) a VM (já existente, mantido para consistência ou uso alternativo)
endVMButton.addEventListener('click', async () => {
    if (!computer) {
        vmErrorParagraph.textContent = 'Nenhuma VM ativa para fechar.';
        vmErrorParagraph.style.display = 'block';
        return;
    }
    try {
        const response = await fetch('/end', {
            method: 'POST'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comunicar com o servidor para fechar a VM');
        }
        const data = await response.json();
        if (data.success) {
            computer = null;
            vmInfoDiv.style.display = 'none';
            createVMButton.style.display = 'block';
            appendMessage('VM fechada.');
        } else {
            vmErrorParagraph.textContent = 'Erro ao fechar a VM.';
            vmErrorParagraph.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao fechar VM:', error);
        vmErrorParagraph.textContent = error.message;
        vmErrorParagraph.style.display = 'block';
    } finally {
        settingsMenu.style.display = 'none'; // Fechar o menu após a ação (por consistência)
    }
});
