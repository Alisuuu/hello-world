const socket = io();

fetch('/computer')
  .then(res => res.json())
  .then(data => {
    console.log('VM criada:', data);
    const iframe = document.getElementById('hb-frame');
    iframe.src = data.url;
  })
  .catch(err => console.error('Erro ao buscar VM:', err));

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat message', input.value.trim());
    input.value = '';
  }
});

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
