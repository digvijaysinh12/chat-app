import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markMessageSeen } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute,getUsersForSidebar);

messageRouter.get("/:id",protectRoute, getMessages);

messageRouter.put("/mark/:id",protectRoute,markMessageSeen);

export default messageRouter;