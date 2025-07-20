import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // ✅ from .env
    credentials: true,
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Helper to get socketId from userId
export const getUserSocketId = (userId) => userSocketMap[userId] || null;

// Handle socket.io connections
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
  }

  // Send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing event
  socket.on("typing", ({ toUserId, isTyping }) => {
    const receiverSocketId = getUserSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        fromUserId: socket.userId,
        isTyping,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (userId in userSocketMap) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to DB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Export for testing or Vercel compatibility
export default server;
