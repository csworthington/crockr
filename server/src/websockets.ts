import * as ws from "ws";

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket: ws.WebSocket) => {

  socket.on("message", (message: Buffer) => {
    if (message.toString() === "browserPing") {
      console.log("received ping from browser");
    } else {
      console.log(`Received: ${message.toString()}`);
      // Send back the string, but in caps
      socket.send(message.toString().toUpperCase());
    }
  });

  socket.on("ping", (socket: ws.WebSocket) => {
    socket.pong("data?");
  });

  socket.on("close", (socket: ws.WebSocket) => {
    console.log("socket closed");
  });
});

export default wsServer;
