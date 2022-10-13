import http from "http";
import {Server} from "socket.io";
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

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});



wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        console.log(event);
        // console.log(socket);
    });
    socket.on("enter_room", (nickname, roomName) => {
        socket["nickname"] = nickname
        socket["roomName"] = roomName
        socket.join(roomName);
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    // socket.on("disconnect", () => {
    //     socket.rooms.forEach(room =>  socket.to(room).emit("bye", socket.nickname));
    // });
    socket.on("get_out", (roomName) => {
        socket.to(roomName).emit("out", socket.nickname)
        socket.leave(roomName);
    })
    socket.on("new_message", (roomName, msg) => {
        socket.to(roomName).emit("show_message", socket.nickname, msg);
    })
})

httpServer.listen(PORT, handleListen);