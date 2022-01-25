import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";
import e from "express";

const activeConnections = new  Set<connectedClients>();
const rooms: Room[] = [];
interface Room{
  name:string;
  canvas: string[][];
  users: Set<connectedClients>;
  lockedObjects:string[][];
  id : string;
  pass : string;
}
interface connectedClients extends ws.WebSocket{
  name : string;
  id: string;
}
interface updateMsg{
  msgType : string;
  msg : string;
}
const mainRoom = <Room>{name: "Test1", canvas:[[],[]], users: new Set([]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: "tempPass"  };
const secondaryRoom = <Room>{name: "Test2", canvas:[[],[]], users: new Set([]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: "tempPass"  };
rooms.push(mainRoom);
rooms.push(secondaryRoom);
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
  const roomData : string[][]  = [[],[]];
  rooms.forEach((element : Room) => {
    roomData[0].push(element.name);
    roomData[1].push(element.id);
    });
  const loadMsg : updateMsg = {msgType: "Loading", msg: JSON.stringify(mainRoom.canvas[1])};
  const roomUpdate : updateMsg = {msgType: "roomUpdate", msg: JSON.stringify(roomData)};
  socket.send(JSON.stringify(loadMsg));
  loadMsg.msgType = "Selection";
  loadMsg.msg = JSON.stringify(mainRoom.lockedObjects[1]);
  socket.send(JSON.stringify(loadMsg));
  socket.send(JSON.stringify(roomUpdate));

  // Handle incoming messages
  socket.on("message", (message: Buffer) => {
    // Create a message showing who sent what information
    
    const msg = JSON.parse(message.toString());
    switch(msg.msgType){

      case "Selection":{
        const selectedIds = JSON.parse(msg.msg);
        console.log("recieved Selection update ");
        selectedIds.forEach( (id: string) => {
          if(mainRoom.lockedObjects[1].includes(id) === false){
            mainRoom.lockedObjects[0].push(socket.id);
            mainRoom.lockedObjects[1].push(id);
  
          }
          
        });
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        console.log(mainRoom.lockedObjects);
        break;
      }
      case "Deselection":{
        console.log("recieved Deselection update ");
        const deselectedIds = JSON.parse(msg.msg);
        deselectedIds.forEach( (id: string) => {
          if(mainRoom.lockedObjects[1].includes(id)){
            const x = mainRoom.lockedObjects[1].indexOf(id);
            mainRoom.lockedObjects[0].splice(x,1);
            mainRoom.lockedObjects[1].splice(x,1);
  
          }
          activeConnections.forEach(function(sockets){
            if(socket.id !== sockets.id){
              sockets.send(JSON.stringify(msg));
            }
          });
          
        });
        console.log(mainRoom.lockedObjects);
        break;
      }
      case "Addition":{
        
        const  parsedMsg : string = JSON.parse(msg.msg);
        mainRoom.canvas[0].push(parsedMsg[0]);
        mainRoom.canvas[1].push(parsedMsg[1]);
        console.log(mainRoom.canvas);
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
          if(mainRoom.canvas[0].includes(scaledObjects[0][i])){
            const x = mainRoom.canvas[0].indexOf(scaledObjects[0][i]);
            mainRoom.canvas[1][x] = scaledObjects[1][i];
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
          if(mainRoom.canvas[0].includes(id)){
            const x = mainRoom.canvas[0].indexOf(id);
            mainRoom.canvas[0].splice(x,1);
            mainRoom.canvas[1].splice(x,1);
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
           
        mainRoom.canvas[1] = [];
        mainRoom.canvas[0] = [];
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      // Type: "Loading" Contents: [empty]
      case "Loading":{
        console.log("got here");
        msg.msg = JSON.stringify(mainRoom.canvas[1]);
        socket.send(JSON.stringify(msg));
        msg.msgType = "Selection";
        msg.msg = JSON.stringify(mainRoom.lockedObjects[1]);
        socket.send(JSON.stringify(msg));
        break;
      }
      // Type: "localLoad" Contents: [Object IDs] [Serialized Objects]
      case "localLoad":{
        const loadedObjects = JSON.parse(msg.msg);
        mainRoom.canvas[0]  = loadedObjects[0];
        mainRoom.canvas[1] = loadedObjects[1];
        msg.msg = JSON.stringify(mainRoom.canvas[1]);
        msg.msgType = "Loading";
        activeConnections.forEach(function(sockets){
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
         break;

      }
      // Type: "newRoom" Contents: String : Name
      case "newRoom":{
        const tempPass = "1";
        rooms.push(<Room> {name: msg.msg, canvas:[[],[]], users: new Set([socket]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: tempPass  });
        
        break;
      }
      case "Password":{
        const passData : string[]= JSON.parse(msg.msg);
        let check = false;
        rooms.forEach((element: Room ) => {
          if(element.id == passData[0] && element.pass == passData[1]){
            check = true;
            return;
          }
          
        });
        if (check){
          const checkMsg : updateMsg = {msgType:"Verification", msg:  JSON.stringify(true)};
          socket.send(JSON.stringify(checkMsg));
        }
        else{
          const checkMsg : updateMsg = {msgType:"Verification", msg:  JSON.stringify(false)};
          socket.send(JSON.stringify(checkMsg));
        }

        break;
      }
      
      default: {
        console.log("Recieved Unknown update");
      }

    }
    

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
