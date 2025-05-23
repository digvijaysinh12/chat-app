import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";


//Create Express app and HTTP server
const app = express();
//We are using this http create server beacause the socket io support this http server
const server = http.createServer(app)