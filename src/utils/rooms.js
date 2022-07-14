const rooms = []

const addUser = (roomId, userId, username) => {
    let existingRoom = rooms.find((room) => room.id === roomId)
    if (!existingRoom) {
        existingRoom = { id: roomId, users: [] }
        rooms.push(existingRoom)
    }
    let existingUser = existingRoom.users.find((user) => user.id === userId)
    if (!existingUser) {
        const user = {
            id: userId,
            username: username
        }
        existingRoom.users.push(user)
    }
    return existingRoom;
}

const removeUser = (roomId, userId) => {
    const existingRoom = rooms.find((room) => room.id === roomId)

    if (!existingRoom) {
        return 
    }

    const index = existingRoom.users.findIndex((user) => user.id === userId )
    if (index !== -1) {
        return existingRoom.users.splice(index, 1)[0]
    }
}

const getRoom = (roomId) => {
    return existingRoom = rooms.find((room) => room.id === roomId)
}

module.exports = {
    addUser,
    removeUser,
    getRoom
}