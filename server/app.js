require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/auth.routes");
const meetingRoutes = require("./routes/meeting.routes");
const setupSocket = require("./socket/socket");

const app = express();

dbConnect();

app.use( cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MeetSphere API is running",
    });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

setupSocket(io);
server.listen(process.env.PORT, () => {
    console.log(
        `Server is running http://localhost:${process.env.PORT}`
    );
});