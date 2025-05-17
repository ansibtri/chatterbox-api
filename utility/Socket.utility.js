function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`Left room: ${roomId}`);
    });

    socket.on("sendMessage", (data) => {
      console.log("Message sent:", data);
      io.to(data.roomId).emit("getMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = { handleSocketConnection };
