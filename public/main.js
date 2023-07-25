const socket = io();
import setupChat from './chat.js';

let users = [];

//ToDo: switch for prompt later
const username = Math.floor(Math.random() * 100)

setupChat(socket, username);

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3001,
});

peer.on("open", (id) => {
  console.log('peer on open:', id, ' ', username)
  socket.emit("room:join", ROOM_ID, id, username);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const videoElement = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(videoElement, userVideoStream, userId);
  });
};

const addVideoStream = (videoElement, stream, userId) => {
  videoElement.srcObject = stream;
  videoElement.addEventListener("loadedmetadata", () => {
    const videoDivId = 'video-user-' + userId
    let videoDiv = document.querySelector('#' + videoDivId)
    if (!videoDiv) {
      videoDiv = document.createElement('div')
      videoDiv.setAttribute('id', videoDivId)
    }

    videoElement.play();
    videoDiv.append(videoElement)
    videoGrid.append(videoDiv);
  });
};

// #region video
const myVideoElement = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
//ToDo: check if this feature is supported by browser by checkin existence of navigator.mediaDevices
const myVideoStream = await navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  });

addVideoStream(myVideoElement, myVideoStream, 'me');

peer.on("call", (call) => {
  call.answer(myVideoStream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log('New stream with id ' + call.peer)
    addVideoStream(video, userVideoStream, call.peer);
  });
});

socket.on("room:user-connected", (userId, room) => {
  console.log(room)
  console.log('new user connected with id ' + userId)
  connectToNewUser(userId, myVideoStream);
});

socket.on("room:connected-me", (userId, room) => {
  users = room.users
  console.log('You have been connected with id ' + userId)
  addVideoStream(myVideoElement, myVideoStream, userId);
});

socket.on("room:user-disconnected", (userId, room) => {
  users = room.users
  const videoDivId = 'video-user-' + userId
  let videoDiv = document.querySelector('#' + videoDivId)
  if (videoDiv) {
    videoDiv.parentNode.removeChild(videoDiv)
  }
  console.log('user disconnected');
});
// #endregion

// #region interface?
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
    const html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    const html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    const html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    const html = `<i class="fas fa-video"></i>`;
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