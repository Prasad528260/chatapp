import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // frontend port
  },
});

// Store mapping: userId -> socketId
const userSocketMap = {}; // e.g., { "123": "socket_ABC" }

export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("🔌 A user connected: ", socket.id);

  // Handle user joining with userId
  socket.on("join", (userId) => {
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    userSocketMap[userId] = socket.id;

    // Broadcast updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected: ", socket.id);

    // Remove the userId that had this socket.id
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }

    // Broadcast updated list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
