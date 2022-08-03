module.exports = io => {
    io.on("connection", socket => {
      console.log("connected to sockets");
      admin(io, socket);
      user(io, socket);
      socket.on("disconnect", function() {
        console.log("Disconnect",socket.id);
      });
    });
}