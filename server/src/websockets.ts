import * as ws from "ws";

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket: ws.WebSocket) => {
  console.log("new connection?");
  console.log(wsServer.clients.size);

  socket.on("message", (message: Buffer) => {
    console.log(message);
    console.log(message.toString());

    if (message.toString() === "browserPing") {
      console.log("received ping from browser");
    } else {
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
