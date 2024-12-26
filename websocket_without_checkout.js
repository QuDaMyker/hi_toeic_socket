import { createClient } from "@supabase/supabase-js";
import AppConstant from "./data/constant/app_constant.js";
import SupabaseServices from "./services/supabase_services.js";
import { WebSocketServer } from "ws";

const { PORT, SUPABSE_URL, PUBLIC_ANON_KEY } = AppConstant;

const supabase = createClient(SUPABSE_URL, PUBLIC_ANON_KEY);

const server = new WebSocketServer({ port: PORT });

const supabaseServices = new SupabaseServices(SUPABSE_URL, PUBLIC_ANON_KEY);

// Store connected sockets
const connectedSockets = new Map();

server.on("connection", (socket) => {
  socket.on("message", async (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "CREATE_ROOM":
        socket.userId = data.userId;
        await createRoom(socket, data);
        break;
      case "JOIN_ROOM":
        await joinRoom(socket, data);
        break;
      case "JOIN_ROOM_RANDOM":
        socket.userId = data.userId;
        await joinRoomRandom(socket, data);
        break;
      case "LEAVE_ROOM":
        await leaveRoom(socket, data);
        break;
      case "SEND_WORD":
        await processWord(socket, data);
        break;
      case "FOUND_WINNER":
        await foundWinner(socket, data);
        break;
      default:
        sendError(socket, "Unknown message type");
    }
  });

  socket.on("close", () => {
    handleDisconnect(socket);
  });
});

// Function to broadcast to room players
async function broadcastToRoom(roomId, message) {
  try {
    // Fetch room players from database
    const roomPlayers = await supabaseServices.getRoomPlayers(roomId);
    console.log(roomPlayers[0]);

    // Find and broadcast to connected sockets of room players
    for (const [key, value] of Object.entries(roomPlayers[0])) {
      const playerSocket = connectedSockets.get(value);
      if (playerSocket) {
        playerSocket.send(JSON.stringify(message));
      }
    }
    // roomPlayers.forEach((player) => {
    //   const playerSocket = connectedSockets.get(player.id);
    //   if (playerSocket) {
    //     playerSocket.send(JSON.stringify(message));
    //   }
    // });
  } catch (error) {
    console.error("Broadcast error:", error);
  }
}

async function createRoom(socket, { userId, roomId, isPrivate, password }) {
  // Store socket for the user
  connectedSockets.delete(userId);
  connectedSockets.set(userId, socket);

  let isExist = await supabaseServices.getGameRoomByPassword(password);
  if (isExist && isExist.length > 0) {
    sendError(socket, "Room already exists in the database");
    return;
  }

  socket.roomId = roomId;
  socket.userId = userId;

  const gameRoom = {
    status: "waiting",
    player1_id: userId,
    player2_id: null,
    winner_id: null,
    israndom: isPrivate,
    created_at: new Date(),
    code: password,
  };

  const insertedRoom = await supabaseServices.insertGameRoom(gameRoom);

  if (insertedRoom) {
    sendSuccess(socket, {
      message: "Room created successfully and saved to database",
      room: insertedRoom,
    });
  } else {
    sendError(socket, "Failed to save room to database");
  }
}

async function joinRoom(socket, { userId, password }) {
  // Store socket for the user
  connectedSockets.set(userId, socket);

  try {
    let isExist = await supabaseServices.getGameRoomByPassword(password);
    if (isExist != null && isExist.length == 0) {
      sendError(socket, "Room not found in the database");
      return;
    }

    let roomId = isExist[0]["id"];
    let isPrivate = isExist[0]["israndom"];
    let roomPassword = isExist[0]["code"];

    if (isPrivate && roomPassword !== password) {
      sendError(socket, "Incorrect password");
      return;
    }

    socket.roomId = roomId;
    socket.userId = userId;

    const insertedRoom = await supabaseServices.updateGameRoom(roomId, {
      status: "playing",
      player2_id: userId,
      updated_at: new Date(),
    });

    if (insertedRoom) {
      sendSuccess(socket, {
        message: "Joined room successfully",
        room: insertedRoom,
      });
      // Broadcast join event to all players in the room
      await delay(2000);
      await broadcastToRoom(roomId, {
        type: "ROOM_UPDATE",
        message: "Player joined the room",
        userId: userId,
        room: insertedRoom,
      });
    } else {
      sendError(socket, "Failed to save room to database");
    }
  } catch (e) {
    sendError(socket, e.message);
  }
}

async function leaveRoom(socket, { userId, roomId, winner_id }) {
  const room = await supabaseServices.getGameRoomById(roomId);
  console.log(room);
  
  if (room == null || room.length == 0) return;
  let updatedRoom;
  console.log(`room[0]['player1_id'] == userId ${room[0]['player1_id']} ${userId}`);
  
  if(room[0]['player1_id'] == userId) {
     updatedRoom = await supabaseServices.updateGameRoom(roomId, {
      status: "finished",
      updated_at: new Date(),
      code: null,
      winner_id: winner_id,
    });
  }else {
    updatedRoom = await supabaseServices.updateGameRoom(roomId, {
      status: "finished",
      updated_at: new Date(),
      code: null,
    });
  }
  

  if (updatedRoom) {
    // Broadcast leave event to all players in the room
    await broadcastToRoom(roomId, {
      type: "ROOM_UPDATE",
      message: "Player left the room",
      userId: userId,
      room: updatedRoom,
    });

    // supabaseServices.deleteGameRoom(roomId);

    // Remove the user's socket
    connectedSockets.delete(userId);

    sendSuccess(socket, "Left room successfully");
    socket.close();
  } else {
    sendError(socket, "Failed to save room to database");
  }
}

// Rest of the existing code remains the same...

async function processWord(socket, { userId, roomId, word }) {
  const isValidWord = await supabaseServices.checkValidWord(word.trim().toLowerCase());
  console.log(`isValidWord: ${isValidWord} ${word.trim().toLowerCase()}`);
  
  if (isValidWord == null) return;

  const lastWordInRoom = await supabaseServices.getLastWordInRoom(roomId);
  if (lastWordInRoom == null) return;

  if (lastWordInRoom.length == 0) {
    let insertWord = await supabaseServices.insertGameWords({
      room_id: roomId,
      user_id: userId,
      word: word,
      created_at: new Date(),
      valid: true,
    });
    
    const message = {
      type: "WORD_SUBMITTED",
      message: "Word inserted successfully",
      word: insertWord[0]
    };
    
    await broadcastToRoom(roomId, message);
    return;
  }

  const lastWord = lastWordInRoom[0]["word"];
  const lastUser = lastWordInRoom[0]["user_id"];
  if (lastWordInRoom[0]["valid"]) {
    if (lastUser === userId) {
      sendError(socket, "It's not your turn");
      return;
    }
  }

  let canInsert = false;
  if (lastWord && lastWord.slice(-1) === word[0]) {
    canInsert = true;
  }

  let insertWord = await supabaseServices.insertGameWords({
    room_id: roomId,
    user_id: userId,
    word: word,
    created_at: new Date(),
    valid: canInsert,
  });

  if (insertWord) {
    if (!canInsert) {
      sendError(socket, {
        'user_id': userId,
        'message':'wrong word, try again',
      });
      return;
    }
    
    const message = {
      type: "WORD_SUBMITTED",
      message: "Word inserted successfully",
      word: insertWord[0]
    };
    
    await broadcastToRoom(roomId, message);
  } else {
    sendError(socket, "Failed to save word to database");
  }
}

async function joinRoomRandom(socket, { userId }) {
  // Store socket for the user
  connectedSockets.set(userId, socket);
  let isExist = await supabaseServices.getGameRoomFree(userId);
  try {
    if (isExist.length == 0) {
      let code = supabaseServices.generateRandomSixDigitNumber();
      let isExistRoom = await supabaseServices.getGameRoomByPassword(code);
      if(isExistRoom != null && isExistRoom.length == 0) {
        await createRoom(socket, {
          userId,
          isPrivate: true,
          password: code,
        });
        return;
      }
    }
    await joinRoom(socket, { userId :userId, password: isExist[0]["code"] });
  } catch (e) {
    sendError(socket, e.message);
  }
}

async function foundWinner(socket, { userId, roomId, score, winnerId }) {
 let updatedRoom = await supabaseServices.updateGameRoom(roomId, {
    status: "finished",
    updated_at: new Date(),
    code: null,
    winner_id: winnerId,
  });

  await broadcastToRoom(roomId,  {
    type: "WINNER_FOUND",
    message: "Winner found successfully",
    score: score,
    room: updatedRoom,
  });
}

function handleDisconnect(socket) {
  const roomId = socket.roomId;
  if (!roomId) return;

  leaveRoom(socket, { roomId });
}

function sendError(socket, message) {
  socket.send(JSON.stringify({ type: "ERROR", message }));
}

function sendSuccess(socket, message) {
  socket.send(JSON.stringify({ type: "SUCCESS", message }));
}

function broadcast(room, message) {
  room.players.forEach((player) => {
    player.socket.send(JSON.stringify(message));
  });
}

function sentLeaveRoom(socket) {
  socket.send(JSON.stringify({ type: "LEAVE_ROOM" }));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
