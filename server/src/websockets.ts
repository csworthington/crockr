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
  console.log(`new connection created! Number of connected clients = ${wsServer.clients.size}`);

  // Assign name and uuid to the new connection
  socket.id = uuidv4();
  socket.name = "user " + x;
  x++;

  // Send a welcome message to the new user
  socket.send("Server says: Welcome new user!");

  // add new socket to the socket set
  activeConnections.add(socket);

  // Handle incoming messages
  socket.on("message", (message: Buffer) => {
    // Create a message showing who sent what information
    const incomingMsg = `${socket.name} says "${message.toString()}"`;
    console.log(incomingMsg);

    // Send that message to all other active connections
    activeConnections.forEach(function(sockets){
      if(socket.id !== sockets.id){
        sockets.send(incomingMsg);
      }
    });

  });
});

export default wsServer;
