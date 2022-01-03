import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";

const activeConnections = new  Set<connectedClients>();
//const lockedObjects = new Set<lockedObjects>();
const lockedObjects: string | any[]  = [[],[]];

const canvas : any [] = [];

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
  //socket.send("Server says: Welcome new user!");

  // add new socket to the socket set
  activeConnections.add(socket);

  // Handle incoming messages
  socket.on("message", (message: Buffer) => {
    // Create a message showing who sent what information
    
    const msg = JSON.parse(message.toString());
    switch(msg.msgType){

      case "Selection":{
        const selectedIds = JSON.parse(msg.msg);
        console.log("recieved Selection update ");
        selectedIds.forEach( (id: string) => {
          if(lockedObjects[1].includes(id) === false){
            lockedObjects[0].push(socket.id);
            lockedObjects[1].push(id);
  
          }
        });
        console.log(lockedObjects);
        break;
      }
      case "Deselection":{
        console.log("recieved Deselection update ");
        const deselectedIds = JSON.parse(msg.msg);
        console.log("recieved Selection update ");
        deselectedIds.forEach( (id: string) => {
          if(lockedObjects[1].includes(id)){
            lockedObjects[0].splice(socket.id);
            lockedObjects[1].splice(id);
  
          }
          
        });
        console.log(lockedObjects);
        break;
      }
      case "Addition":{
        canvas.push(JSON.parse(msg.msg));
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });

        break;
      }
      default: {
        console.log("Recieved Unknown update");
      }

    }
    
    
    const incomingMsg = `${socket.name} says "${message.toString()}"`;
    console.log(incomingMsg);

    // Send that message to all other active connections
    activeConnections.forEach(function(sockets){
      if(socket.id !== sockets.id){
        //sockets.send(incomingMsg);
      }
    });

  });
  socket.on("close", () =>{
      console.log(socket.name  + " disconnected");
      activeConnections.forEach(function(sockets){
        if(socket.id === sockets.id){
          activeConnections.delete(sockets);
        }
        else{
          //sockets.send(socket.name  + " disconnected");
        }
      });
      
  });
});

export default wsServer;
