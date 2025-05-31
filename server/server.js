import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//Create Express app and HTTP server
const app = express();

//We are using this http create server beacause the socket io support this http server
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {};//{userId: socketId}

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User Connected → ID: ${userId}, Socket: ${socket.id}`);
  } else {
    console.log("⚠️ Connection attempted without userId");
  }
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected → ID: ${userId}, Socket: ${socket.id}`);
    if (userId in userSocketMap) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
})

// Middleware setup
app.use(express.json({limit: "4mb"}));

// allow all the URL to connect our backend
app.use(cors());

//Route Setup
app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDN
await connectDB();
const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=> console.log("Server is running on PORT: "+PORT));