import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";


//Create Express app and HTTP server
const app = express();
//We are using this http create server beacause the socket io support this http server
const server = http.createServer(app)


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