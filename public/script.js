const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const frame = document.getElementById('hb-frame');

// Chat
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// Load Hyperbeam VM
fetch('/computer')
  .then(res => res.json())
  .then(data => {
    frame.src = data.embed_url;
  })
  .catch(err => {
    console.error('Erro ao carregar VM Hyperbeam:', err);
  });
