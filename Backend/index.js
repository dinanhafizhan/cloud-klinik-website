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
app.use('/images', express.static('public/images'));

app.use(UserRoute);
app.use(DokterRoute);
app.use(JanjiRoute);
app.use(JadwalRoute);
app.use("/auth", AuthRoute);
app.use("/api", ChatbotRoute);

db.sync().then(async () => {
    console.log("Database connected...");
    await seedAdmin();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}...`));
