const socket = io();

let users = [];

//ToDo: switch for prompt later
const username = Math.floor(Math.random() * 100)

// #region chat
const chatMessage = document.querySelector("#chat_message");
const chatForm = document.getElementById("chat_form");

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (chatMessage.value.length !== 0) {
    socket.emit('message:create', chatMessage.value);
    chatMessage.value = '';
  }
});

const messages = document.querySelector(".messages");
socket.on("message:new", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
          <b><i class="far fa-user-circle"></i> <span> ${userName === username ? "me" : userName
    }</span> </b>
          <span>${message}</span>
      </div>`;
});
// #endregion

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3001,
});

// #region video
const myVideo = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
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
    //addVideoStream(myVideo, stream, 'me');

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log('New stream with id ' + call.peer)
        addVideoStream(video, userVideoStream, call.peer);
      });
    });

    socket.on("room:user-connected", (userId, room) => {
      console.log(room)
      console.log('new user connected with id ' + userId)
      connectToNewUser(userId, stream);
    });

    socket.on("room:connected-me", (userId, room) => {
      users = room.users
      console.log('You have been connected with id ' + userId)
      addVideoStream(myVideo, stream, userId);
    });

    socket.on("room:user-disconnected", (userId, room) => {
      users = room.users
      const videoDivId = 'video-user-' + userId
      let videoDiv = document.querySelector('#' + videoDivId)
      if (videoDiv) {
        videoDiv.parentNode.removeChild(videoDiv)
      }
      console.log('user disconnected')
    })
  });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId);
  });
};

const addVideoStream = (video, stream, userId) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    const videoDivId = 'video-user-' + userId
    let videoDiv = document.querySelector('#' + videoDivId)
    if (!videoDiv) {
      videoDiv = document.createElement('div')
      videoDiv.setAttribute('id', videoDivId)
    }

    video.play();
    videoDiv.append(video)
    videoGrid.append(videoDiv);
  });
};

peer.on("open", (id) => {
  console.log(id, ' ', username)
  socket.emit("room:join", ROOM_ID, id, username);
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