const socket = io();
let username = null;

// Pede o nome do usuário ao conectar
socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    username = prompt("Qual seu nome?") || 'Anon';
    loadMessages();  // Carrega mensagens salvas localmente
});

// Função para adicionar mensagem à lista e salvar localmente
function addMessage(msg) {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    // Salvar no localStorage
    let savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    savedMessages.push(msg);
    localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
}

// Carrega mensagens do localStorage ao abrir
function loadMessages() {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const messages = document.getElementById('messages');
    savedMessages.forEach((msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
}

// Recebimento de mensagens
socket.on('message', (msg) => {
    addMessage(msg);
});

// Envio de mensagens
function sendMessage() {
    const input = document.getElementById('message_input');
    const message = input.value.trim();
    
    if (message) {
        const userAgent = navigator.userAgent;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timestamp = `${hours}:${minutes}`;

        // Envia objeto JSON com nome, userAgent, mensagem
        socket.send({
            name: username,
            device: userAgent,
            message: message,
            time: timestamp  // caso queira processar no servidor também
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
