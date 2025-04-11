const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

window.onload = async () => {
  try {
    const res = await fetch('/computer');
    const data = await res.json();
    const iframe = document.getElementById('hyperbeam-frame');
    iframe.src = data.url;
  } catch (err) {
    console.error('Erro ao carregar a VM:', err);
  }
};
