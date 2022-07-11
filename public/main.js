let socket = io();

//ToDo: switch for prompt later
let user = Math.floor(Math.random() * 100)

// #region chat
let text = document.querySelector("#chat_message");
let chatForm = document.getElementById("chat_form");

chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (text.value.length !== 0) {
        socket.emit('message:create', text.value);
        text.value = '';
    }
});

let messages = document.querySelector(".messages");
socket.on("message:new", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
          <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
          <span>${message}</span>
      </div>`;
});
// #endregion

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3001",
});

// #region video
const myVideo = document.createElement("video");
myVideo.muted = true;
let myVideoStream;
//ToDo: check if this feature is supported by browser by checkin existence of navigator.mediaDevices
navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("room:user-connected", (userId) => {
            console.log('new user connected')
            connectToNewUser(userId, stream);
        });
    });

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};

peer.on("open", (id) => {
    console.log(id, ' ', user)
    socket.emit("room:join", ROOM_ID, id, user);
});
// #endregion



// #region interface?
const videoGrid = document.getElementById("video-grid");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");

backBtn.addEventListener("click", () => {
    document.querySelector(".main__left").style.display = "flex";
    document.querySelector(".main__left").style.flex = "1";
    document.querySelector(".main__right").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "flex";
    document.querySelector(".main__right").style.flex = "1";
    document.querySelector(".main__left").style.display = "none";
    document.querySelector(".header__back").style.display = "block";
});

const muteButton = document.querySelector("#muteButton");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
// #endregion