const socket = io();

const welcomeDiv = document.getElementById("welcome");
const loginForm = document.getElementById("login");
const roomDiv = document.getElementById("room");
const messageForm = document.getElementById("send-message");
const exitBtn = document.getElementById("exit-button")

let nickname;
let roomName;

roomDiv.hidden = true;

function handleLoginSubmit(event) {
    event.preventDefault();
    const submittedNickname = loginForm.querySelector("#nickname");
    const submittedRoomName = loginForm.querySelector("#room-name");
    nickname = submittedNickname.value;
    roomName = submittedRoomName.value;
    socket.emit("enter_room", nickname, roomName);
    welcomeDiv.hidden = true;
    roomDiv.hidden = false;

    messageForm.addEventListener("submit", handleMessageSubmit);
    exitBtn.addEventListener("click", handleExit)
}

function handleMessageSubmit(event) {
    event.preventDefault();
}

loginForm.addEventListener("submit", handleLoginSubmit);