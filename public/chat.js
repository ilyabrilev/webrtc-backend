const setupChat = (socket, username) => {
    const chatMessage = document.querySelector("#chat_message");
    const chatForm = document.getElementById("chat_form");
    
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (chatMessage.value.length !== 0) {
        console.log('message sent');
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
}

export default setupChat;