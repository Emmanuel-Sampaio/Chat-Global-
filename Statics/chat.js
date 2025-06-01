const socket = io();

let username = null;

// Pede o nome do usuário ao conectar
socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    username = prompt("Qual seu nome?") || 'Anon';
});

// Recebimento de mensagens
socket.on('message', (msg) => {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; 
});

// Envio de mensagens
function sendMessage() {
    const input = document.getElementById('message_input');
    const message = input.value.trim();
    
    if (message) {
        const userAgent = navigator.userAgent;
        // Envia objeto JSON com nome, userAgent e a mensagem
        socket.send({
            name: username,
            device: userAgent,
            message: message
        });
        input.value = '';
        input.focus();
    }
}

// Enviar ao pressionar Enter
document.getElementById('message_input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
