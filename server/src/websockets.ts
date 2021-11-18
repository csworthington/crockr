import * as ws from "ws";

const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket: ws.WebSocket) => {
  console.log("new connection?");
  socket.on("message", (message: Buffer) => {
    console.log(message);
    socket.send(wsServer.clients);
  });
});

export default wsServer;
