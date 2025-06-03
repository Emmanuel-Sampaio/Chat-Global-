let username = null;
const ws = new WebSocket('ws://192.168.1.2:5001');

ws.onopen = () => {
    console.log("Conectado ao servidor WebSocket");
    askForUsername();
    loadMessages();
};

function askForUsername() {
    username = prompt("Digite seu nome:");
    if (!username || username.trim() === "") {
        // Se vazio, chama o prompt novamente
        askForUsername();
        return;
    }
    username = username.trim();

    ws.send(JSON.stringify({
        type: "set_username",
        name: username
    }));
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "success") {
        console.log(data.success);
        // Nome aceito, segue normal
    } else if (data.type === "error") {
        console.error("Erro do servidor:", data.error);
        if (data.error.toLowerCase().includes("esse nome já foi cadastrado") || data.error.toLowerCase().includes("nome já existe") || data.error.toLowerCase().includes("nome ja existe")) {
            alert(data.error);
            askForUsername();  // chama o prompt de novo aqui
        } else {
            alert("Erro: " + data.error);
            ws.close();
        }
    } else if (data.type === "message") {
        if (!data.message) return;

        const isSentByMe = data.name === username;

        if (isSentByMe) {
            return;
        }

        const formatted_msg = `[${data.time}] ${data.name}: ${data.message}`;
        addMessageToDisplay(formatted_msg, false);
        saveMessageToLocalStorage(formatted_msg, false);
    }
};


ws.onclose = () => {
    console.log("Conexão WebSocket fechada");
    if (usernamePromiseReject) {
        usernamePromiseReject(new Error("Conexão WebSocket fechada durante o registro do nome."));
        usernamePromiseResolve = null;
        usernamePromiseReject = null;
    }
};

function addMessageToDisplay(msg, isSentByMe = false) {
    const messages = document.getElementById("messages");
    const item = document.createElement("li");
    item.textContent = msg;
    item.classList.add(isSentByMe ? "sent" : "received");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

function saveMessageToLocalStorage(msgText, sentByMe) {
    let savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    savedMessages.push({ text: msgText, sentByMe: sentByMe });
    localStorage.setItem("chatMessages", JSON.stringify(savedMessages));
}

function loadMessages() {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    savedMessages.forEach((msgObj) => {
        const item = document.createElement("li");
        item.textContent = msgObj.text;
        item.classList.add(msgObj.sentByMe ? "sent" : "received");
        messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("message_input");
    const message = input.value.trim();

    if (message && ws.readyState === WebSocket.OPEN) {
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

        const messageData = {
            type: "message",
            name: username,
            message: message,
            time: timestamp
        };

        ws.send(JSON.stringify(messageData));

        const formatted_msg = `[${timestamp}] ${username}: ${message}`;
        addMessageToDisplay(formatted_msg, true);
        saveMessageToLocalStorage(formatted_msg, true);

        input.value = "";
        input.focus();
    }
}

document.getElementById("message_input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});