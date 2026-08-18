import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./config/Database.js";
import seedAdmin from "./seedAdmin.js";

import UserRoute from "./routes/UserRoute.js";
import DokterRoute from "./routes/DokterRoute.js";
import JanjiRoute from "./routes/JanjiRoute.js";
import JadwalRoute from "./routes/JadwalRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import ChatbotRoute from "./routes/ChatbotRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
// Routes dengan prefix /api (CloudFront / Production)
app.use('/api', UserRoute);
app.use('/api', DokterRoute);
app.use('/api', JanjiRoute);
app.use('/api', JadwalRoute);
app.use('/api/auth', AuthRoute);
app.use('/api/images', express.static('public/images'));
app.use('/api', ChatbotRoute);

// Fallback routes tanpa prefix /api (Direct access / Local dev)
app.use(UserRoute);
app.use(DokterRoute);
app.use(JanjiRoute);
app.use(JadwalRoute);
app.use('/auth', AuthRoute);
app.use('/images', express.static('public/images'));
app.use(ChatbotRoute);

db.sync().then(async () => {
    console.log("Database connected...");
    await seedAdmin();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}...`));
