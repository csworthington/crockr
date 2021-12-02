import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";

const activeConnections = new  Set<connectedClients>();
interface connectedClients extends ws.WebSocket{
  name : string;
  id: string;
}

let  x = 1;
const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket: connectedClients) => {
  socket.send("Hey");//test
  console.log("new connection?");
  console.log(wsServer.clients.size);
  socket.id = uuidv4();
  socket.name = "user " + x;
  x++;
  activeConnections.add(socket);
  socket.on("message", (message: Buffer) => {
    console.log(message);
    activeConnections.forEach(function(sockets){
      if(socket.id !== sockets.id){
        sockets.send(socket.name +" says "+message.toString());
      }
    });

  });
});

export default wsServer;
