import http from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function getPublicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    })
    console.log(rooms);
    return publicRooms;
}

wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        console.log(event);
    });
    socket.on("enter_room", (nickname, roomName) => {
        socket["nickname"] = nickname
        socket["roomName"] = roomName
        socket.join(roomName);
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", getPublicRooms());
    });
    
    socket.on("get_out", (roomName) => {
        socket.to(roomName).emit("out", socket.nickname)
        socket.leave(roomName);
        wsServer.sockets.emit("room_change", getPublicRooms());
    })
    socket.on("new_message", (roomName, msg) => {
        socket.to(roomName).emit("show_message", socket.nickname, msg);
    })
})

httpServer.listen(PORT, handleListen);