import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";

const activeConnections = new  Set<connectedClients>();
//const lockedObjects = new Set<lockedObjects>();
const lockedObjects: string | any[]  = [[],[]];

const canvas: string[][] = [[],[]];

interface connectedClients extends ws.WebSocket{
  name : string;
  id: string;
}
interface updateMsg{
  msgType : string;
  msg : string;
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
  const loadMsg : updateMsg = {msgType: "Loading", msg: JSON.stringify(canvas[1])};
  socket.send(JSON.stringify(loadMsg));

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
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        console.log(lockedObjects);
        break;
      }
      case "Deselection":{
        console.log("recieved Deselection update ");
        const deselectedIds = JSON.parse(msg.msg);
        deselectedIds.forEach( (id: string) => {
          if(lockedObjects[1].includes(id)){
            const x = lockedObjects[1].indexOf(id);
            lockedObjects[0].splice(x,1);
            lockedObjects[1].splice(x,1);
  
          }
          activeConnections.forEach(function(sockets){
            if(socket.id !== sockets.id){
              sockets.send(JSON.stringify(msg));
            }
          });
          
        });
        console.log(lockedObjects);
        break;
      }
      case "Addition":{
        
        const  parsedMsg : string = JSON.parse(msg.msg);
        canvas[0].push(parsedMsg[0]);
        canvas[1].push(parsedMsg[1]);
        console.log(canvas);
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Modified":{
        const scaledObjects = JSON.parse(msg.msg);
        console.log(scaledObjects[0].length);
        for(let i = 0; i < scaledObjects[0].length; i++){
          if(canvas[0].includes(scaledObjects[0][i])){
            const x = canvas[0].indexOf(scaledObjects[0][i]);
            canvas[1][x] = scaledObjects[1][i];
          }
          else{
            console.log("Object does not exist");
          }
        }
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Deletion":{
        
        const deletionIDs = JSON.parse(msg.msg);
        deletionIDs.forEach( (id: string) => {
          if(canvas[0].includes(id)){
            const x = canvas[0].indexOf(id);
            canvas[0].splice(x,1);
            canvas[1].splice(x,1);
          }
          
        });
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Clearing":{    
           
        canvas[1] = [];
        canvas[0] = [];
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Loading":{
        console.log("got here");
        msg.msg = JSON.stringify(canvas[1]);
        socket.send(JSON.stringify(msg));
        break;
      }
      
      default: {
        console.log("Recieved Unknown update");
      }

    }
    
    
    const incomingMsg = `${socket.name} says "${message.toString()}"`;
    // console.log(incomingMsg);

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
