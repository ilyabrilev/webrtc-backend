
const { Server: SocketServer } = require("socket.io");

const { addUser, removeUser, getRoom } = require('./utils/rooms');


const setupSocketServer = (expressServer) => {
    console.log('setup socket');
    const io = new SocketServer(expressServer, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket) => {
        socket.on("room:join", (roomId, userId, userName) => {
            console.log('a user ' + userName + ' connected to room ' + roomId + ' id ' + userId);
            socket.join(roomId);
            let room = addUser(roomId, userId, userName)
            socket.broadcast.to(roomId).emit("room:user-connected", userId, userName, room);
            socket.emit("room:connected-me", userId, room);

            socket.on('message:create', (message) => {
                console.log('message to ' + roomId + ': ' + message);
                io.to(roomId).emit("message:new", message, userName, userId);
            });

            socket.on('disconnect', () => {
                removeUser(roomId, userId)
                room = getRoom(roomId)
                //ToDo: emit a message to hide a video representation for user
                socket.broadcast.to(roomId).emit("room:user-disconnected", userId, room);
            });
        });
    });
}

module.exports = setupSocketServer;