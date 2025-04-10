const socket = io();

// DOM Elements
const startContainer = document.getElementById('startContainer');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const startButton = document.getElementById('startButton');
const messageArea = document.getElementById('messageArea');
const messageInput = document.getElementById('messageInput');
const fileInput = document.getElementById('fileInput');
const sendButton = document.getElementById('sendButton');
const darkModeToggle = document.getElementById('darkModeToggle');

let username = localStorage.getItem('username') || '';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Apply dark mode on load
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌙';
}

// Start chat
startButton.addEventListener('click', startChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startChat();
});

function startChat() {
    const inputUsername = usernameInput.value.trim();
    if (inputUsername) {
        username = inputUsername;
        localStorage.setItem('username', username);
        startContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        socket.emit('join', username);
    }
}

// Send message or file
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    const file = fileInput.files[0];

    if ((message || file) && username) {
        const data = { user: username };
        if (message) data.message = message;
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                data.file = {
                    name: file.name,
                    data: reader.result,
                    type: file.type
                };
                socket.emit('chatMessage', data);
            };
            reader.readAsDataURL(file);
        } else {
            socket.emit('chatMessage', data);
        }
        messageInput.value = '';
        fileInput.value = '';
    }
}

// Append message
function appendMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(data.user === username ? 'self' : 'other');

    let content = `<strong>${data.user}:</strong> `;
    if (data.message) content += data.message;
    if (data.file) {
        content += `<br><a href="${data.file.data}" download="${data.file.name}">${data.file.name}</a>`;
    }
    messageElement.innerHTML = content;
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Socket.IO events
socket.on('chatMessage', appendMessage);
socket.on('chatHistory', (history) => {
    history.forEach(appendMessage);
});

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    darkModeToggle.textContent = isDarkMode ? '🌙' : '☀️';
    darkModeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => darkModeToggle.style.transform = 'rotate(0deg)', 300);
    localStorage.setItem('darkMode', isDarkMode);
});

// Auto-join if username exists
if (username) {
    startContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    socket.emit('join', username);
}