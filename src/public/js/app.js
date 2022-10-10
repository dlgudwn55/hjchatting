const socket = io();

const welcomeDiv = document.getElementById("welcome");
const loginForm = document.getElementById("login");
const roomDiv = document.getElementById("room");
const messageForm = document.getElementById("send-message");
const exitBtn = document.getElementById("exit-button");

let nickname;
let roomName;

if (localStorage.length === 0) {
    document.querySelector("header h1").innerText = "H chatting";
    welcomeDiv.hidden = false;
    roomDiv.hidden = true;
} else {
    nickname = localStorage.getItem("nickname");
    roomName = localStorage.getItem("roomName");
    document.querySelector("header h1").innerText = `Room: ${roomName}`;
    welcomeDiv.hidden = true;
    roomDiv.hidden = false;
    socket.emit("enter_room", nickname, roomName);
    messageForm.addEventListener("submit", handleMessageSubmit);
    exitBtn.addEventListener("click", handleExit)
}


function handleLoginSubmit(event) {
    event.preventDefault();
    const submittedNickname = loginForm.querySelector("#nickname");
    const submittedRoomName = loginForm.querySelector("#room-name");
    nickname = submittedNickname.value;
    roomName = submittedRoomName.value;
    socket.emit("enter_room", nickname, roomName);
    welcomeDiv.hidden = true;
    roomDiv.hidden = false;
    document.querySelector("header h1").innerText = `Room: ${roomName}`;
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("roomName", roomName);

    messageForm.addEventListener("submit", handleMessageSubmit);
    exitBtn.addEventListener("click", handleExit)
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const msgInput = messageForm.querySelector("input");
    const msgList = roomDiv.querySelector("div ul");
    const li = document.createElement("li");
    li.innerText = `<You>: ${msgInput.value}`;
    msgList.appendChild(li);
    socket.emit("new_message", roomName, msgInput.value);
    msgInput.value = "";
}

function handleExit() {
    if (confirm("채팅방에서 나가시면 대화내용이 모두 지워집니다. 정말로 나가시겠습니까?")) {
        socket.emit("get_out", roomName);
        welcomeDiv.hidden = false;
        roomDiv.hidden = true;
        document.querySelector("header h1").innerText = "H chatting";
        localStorage.clear();
        nickname = null;
        roomName = null;
        // socket.disconnect();
    }
}

loginForm.addEventListener("submit", handleLoginSubmit);

socket.on("show_message", (user, msg) => {
    const msgInput = messageForm.querySelector("input");
    const msgList = roomDiv.querySelector("div ul");
    const li = document.createElement("li");
    console.log(msg);
    li.innerText = `${user}: ${msg}`;
    msgList.appendChild(li);
})