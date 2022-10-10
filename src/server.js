import http from "http";
import {Server} from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

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
    return publicRooms;
}

// function countRoom(roomName) {
//     return wsServer.sockets.rooms.get(roomName)?.size;
// }

wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        console.log(event);
        // console.log(socket);
    });
    socket.on("enter_room", (nickname, roomName) => {
        socket["nickname"] = nickname
        socket["roomName"] = roomName
        socket.join(roomName);
        // console.log(socket);
        // socket.to(roomName).emit("welcome", nickname);
        // wsServer.sockets.emit("room_change", getPublicRooms());
    });
    socket.on("disconnect", () => {
        console.log(`${socket.nickname} left`);
        // console.log(socket);
    });
    socket.on("get_out", (roomName) => {
        socket.leave(roomName)
        // console.log(socket);
    })
    socket.on("new_message", (roomName, msg) => {
        // console.log(msg);
        socket.to(roomName).emit("show_message", socket.nickname, msg);
    })
})

httpServer.listen(3000, handleListen);