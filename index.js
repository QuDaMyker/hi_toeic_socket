// const express = require('express')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
//     res.send('Hello world node')
// })

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
    
// })

const { log } = require("console");
const express = require("express");
const { createServer } = require("http");
const { Server, Socket } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const port = 3484

io.on("connection", (client) => {
  console.log(`New client connected ${client.id}`);

  client.on(`fromClient`, data => {
    console.log(data);
    let onUppper = String(data).toUpperCase();
    console.log(onUppper)
    client.emit('fromServer', onUppper)
    
  })

  client.on('disconnect', client => {
    console.log(`Client disconnected ${client.id}`);    
  })
});

httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});