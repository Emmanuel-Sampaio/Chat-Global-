const socket = io();
let username = null;

socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    username = prompt("Qual seu nome?") || 'Anon';
    socket.emit('set_username', { name: username });
    loadMessages(); // Carrega mensagens ao conectar
});

function addMessageToDisplay(msg, isSentByMe = false) {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    item.textContent = msg;
    item.classList.add(isSentByMe ? 'sent' : 'received');
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

function saveMessageToLocalStorage(msgText, sentByMe) {
    let savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    savedMessages.push({ text: msgText, sentByMe: sentByMe });
    localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
}

function loadMessages() {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const messages = document.getElementById('messages');
    messages.innerHTML = '';
    savedMessages.forEach((msgObj) => {
        const item = document.createElement('li');
        item.textContent = msgObj.text;
        item.classList.add(msgObj.sentByMe ? 'sent' : 'received');
        messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
}

socket.on('success', (data) => {
    console.log(data.success);
});

socket.on('error', (data) => {
    console.error('Erro do servidor:', data.error);
    alert('Erro: ' + data.error);
});

socket.on('message', (msg) => {
    console.log('Mensagem recebida:', msg);
    if (!msg || !msg.message) {
        console.error('Mensagem vazia ou inválida:', msg);
        return;
    }

    const isSentByMe = msg.name === username;

   
    if (isSentByMe) {
        return;
    }

    const name = msg.name || 'Desconhecido';
    const time = msg.time || '00:00';
    const messageText = msg.message || '[Mensagem vazia]';
    const formatted_msg = `[${time}] ${name}: ${messageText}`;

    addMessageToDisplay(formatted_msg, false);
    saveMessageToLocalStorage(formatted_msg, false);
});


function sendMessage() {
    const input = document.getElementById('message_input');
    const message = input.value.trim();

    if (message) {
        const userAgent = navigator.userAgent;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const messageData = { name: username, device: userAgent, message: message, time: timestamp };

        // Enviar para o servidor
        socket.emit('message', messageData);

        // Exibir e salvar localmente imediatamente
        const formatted_msg = `[${timestamp}] ${username}: ${message}`;
        addMessageToDisplay(formatted_msg, true);
        saveMessageToLocalStorage(formatted_msg, true);

        input.value = '';
        input.focus();
    }
}

document.getElementById('message_input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
