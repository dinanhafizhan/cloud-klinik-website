import express from "express";
import { handleChat } from "../controllers/ChatbotController.js";

const router = express.Router();

router.post("/chat", handleChat);

export default router;
