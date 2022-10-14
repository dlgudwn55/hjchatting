const socket = io();

const welcomeDiv = document.getElementById("welcome");
const loginForm = document.getElementById("login");
const roomDiv = document.getElementById("room");
const messageForm = document.getElementById("send-message");
const exitBtn = document.getElementById("exit-button");

let nickname;
let roomName;
let talk_history = [];

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
    exitBtn.addEventListener("click", handleExit);

    if (localStorage.getItem("talk_history") !== null) {
        talk_history = JSON.parse(localStorage.getItem("talk_history"));
        const msgList = roomDiv.querySelector("div ul");
        talk_history.forEach(talk => {
            const li = document.createElement("li");
            li.innerText = talk;
            msgList.appendChild(li);
        });
    }
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

    talk_history.push(`<You>: ${msgInput.value}`);
    localStorage.setItem("talk_history", JSON.stringify(talk_history));
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

        const msgList = roomDiv.querySelector("div ul");
        msgList.innerHTML = "";
        // socket.disconnect();
    }
}

loginForm.addEventListener("submit", handleLoginSubmit);

socket.on("show_message", (user, msg) => {
    const msgList = roomDiv.querySelector("div ul");
    const li = document.createElement("li");
    li.innerText = `${user}: ${msg}`;
    msgList.appendChild(li);

    talk_history.push(`${user}: ${msg}`);
    localStorage.setItem("talk_history", JSON.stringify(talk_history));
})

socket.on("welcome", (user) => {
    const msgList = roomDiv.querySelector("div ul");
    const li = document.createElement("li");
    li.classList.add("system");
    li.innerText = `${user} 이(가) 들어왔습니다.`;
    msgList.appendChild(li);
})

socket.on("out", (user) => {
    const msgList = roomDiv.querySelector("div ul");
    const li = document.createElement("li");
    li.classList.add("system");
    li.innerText = `${user} 이(가) 나갔습니다.`;
    msgList.appendChild(li);
})

socket.on("room_change", (rooms) => {
    const roomList = welcomeDiv.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
})