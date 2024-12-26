const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = 3484;

// Define the channels (rooms) structure
const channels = {};

io.on('connection', (client) => {
    console.log(`New client connected: ${client.id}`);

    // Handle user joining a specific channel
    client.on('joinChannel', ({ channelId, userId }) => {
        // Add the user to the channel (room)
        client.join(channelId);
        if (!channels[channelId]) {
            channels[channelId] = [];
        }
        channels[channelId].push(userId);

        console.log(`User ${userId} joined channel ${channelId}`);
        
        // Notify the user of a successful join
        client.emit('joinedChannel', `Joined channel ${channelId}`);
    });

    // Handle message sending within a channel
    client.on('message', ({ channelId, messageContent, userId }) => {
        console.log(`Message from ${userId} in ${channelId}: ${messageContent}`);

        // Broadcast message to all clients in the same channel except the sender
        client.to(channelId).emit('message', {
            channelId,
            messageContent,
            fromUserId: userId
        });
    });

    client.on('disconnect', () => {
        console.log(`Client disconnected: ${client.id}`);
        
        // Remove client from any channels they were part of
        for (const channelId in channels) {
            channels[channelId] = channels[channelId].filter(id => id !== client.id);
            if (channels[channelId].length === 0) {
                delete channels[channelId];
            }
        }
    });
});

httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
