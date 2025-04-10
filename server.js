const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let chatHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('chatHistory', chatHistory);

    socket.on('join', (username) => {
        console.log(`${username} joined the chat`);
    });

    socket.on('chatMessage', (data) => {
        chatHistory.push(data);
        io.emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});