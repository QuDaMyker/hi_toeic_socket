const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const rooms = {}; // Store rooms and players info

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'CREATE_ROOM':
                createRoom(socket, data);
                break;
            case 'JOIN_ROOM':
                joinRoom(socket, data);
                break;
            case 'LEAVE_ROOM':
                leaveRoom(socket, data);
                break;
            case 'SEND_WORD':
                processWord(socket, data);
                break;
            default:
                sendError(socket, 'Unknown message type');
        }
    });

    socket.on('close', () => {
        handleDisconnect(socket);
    });
});

async function validateWord(word) {
    // Replace this function with your custom validation logic
    // For example, make a request to a third-party service
    return new Promise((resolve) => {
        // Simulate asynchronous validation
        setTimeout(() => {
            resolve(true); // Change to false to simulate invalid word
        }, 100);
    });
}

function createRoom(socket, { roomId, isPrivate, password }) {
    if (rooms[roomId]) {
        sendError(socket, 'Room already exists');
        return;
    }

    rooms[roomId] = {
        players: [{ socket, isOwner: true }],
        isPrivate: !!isPrivate,
        password: isPrivate ? password : null
    };
    
    socket.roomId = roomId;
    socket.isOwner = true;
    sendSuccess(socket, 'Room created successfully');
}

function joinRoom(socket, { roomId, password }) {
    const room = rooms[roomId];

    if (!room) {
        sendError(socket, 'Room does not exist');
        return;
    }

    if (room.isPrivate && room.password !== password) {
        sendError(socket, 'Incorrect password');
        return;
    }

    room.players.push({ socket, isOwner: false });
    socket.roomId = roomId;
    sendSuccess(socket, 'Joined room successfully');
}

function leaveRoom(socket, { roomId }) {
    const room = rooms[roomId];

    if (!room) {
        sendError(socket, 'Room does not exist');
        return;
    }

    room.players = room.players.filter((player) => player.socket !== socket);

    if (room.players.length === 0) {
        delete rooms[roomId];
        return;
    }

    if (socket.isOwner) {
        room.players[0].isOwner = true;
        room.players[0].socket.isOwner = true;
    }

    sendSuccess(socket, 'Left room successfully');
}

async function processWord(socket, { roomId, word }) {
    const room = rooms[roomId];

    if (!room) {
        sendError(socket, 'Room does not exist');
        return;
    }

    const lastWord = room.lastWord || null;
    if (lastWord && lastWord.slice(-1) !== word[0]) {
        sendError(socket, 'Word does not match');
        return;
    }

    const isValid = await validateWord(word);
    if (!isValid) {
        sendError(socket, 'Invalid word');
        return;
    }

    room.lastWord = word;
    broadcast(room, { type: 'WORD_ACCEPTED', word });
}

function handleDisconnect(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    leaveRoom(socket, { roomId });
}

function sendError(socket, message) {
    socket.send(JSON.stringify({ type: 'ERROR', message }));
}

function sendSuccess(socket, message) {
    socket.send(JSON.stringify({ type: 'SUCCESS', message }));
}

function broadcast(room, message) {
    room.players.forEach((player) => {
        player.socket.send(JSON.stringify(message));
    });
}

console.log('WebSocket server is running on ws://localhost:8080');
