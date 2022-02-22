import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";
import e from "express";

const activeConnections = new  Set<connectedClients>();
const rooms: (Room)[] = [];
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
  roomID: string;
  msg : string;
}
const mainRoom = <Room>{name: "Sysc4005", canvas:[[],[]], users: new Set([]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: "tempPass"  };
const secondaryRoom = <Room>{name: "Comp2804", canvas:[[],[]], users: new Set([]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: "tempPass"  };
rooms.push(mainRoom);
rooms.push(secondaryRoom);
let  x = 1;
const roomData : string[][]  = [[],[]];
const wsServer = new ws.Server({ noServer: true });
rooms.forEach((element : Room) => {
  roomData[0].push(element.name);
  roomData[1].push(element.id);
  });
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
  const roomUpdate : updateMsg = {msgType: "roomUpdate", roomID:"",  msg: JSON.stringify(roomData)};
  socket.send(JSON.stringify(roomUpdate));

  // Handle incoming messages
  socket.on("message", (message: Buffer) => {
    // Create a message showing who sent what information
    
    const msg = JSON.parse(message.toString());
    console.log("test msg:");
    console.log(msg);
    console.log("ID array:");
    const filter = rooms.filter(obj => {
      return obj.id === msg.roomID;
    }
    );
    const roomMsg = filter[0];
    switch(msg.msgType){

      case "Selection":{
        const selectedIds = JSON.parse(msg.msg);
        console.log("recieved Selection update ");
        selectedIds.forEach( (id: string) => {
          if(roomMsg.lockedObjects[1].includes(id) === false){
            roomMsg.lockedObjects[0].push(socket.id);
            roomMsg.lockedObjects[1].push(id);
  
          }
          
        });
        roomMsg.users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        console.log(roomMsg.lockedObjects);
        break;
      }
      case "Deselection":{
        console.log("recieved Deselection update ");
        const deselectedIds = JSON.parse(msg.msg);
        deselectedIds.forEach( (id: string) => {
          if(roomMsg.lockedObjects[1].includes(id)){
            const x = roomMsg.lockedObjects[1].indexOf(id);
            roomMsg.lockedObjects[0].splice(x,1);
            roomMsg.lockedObjects[1].splice(x,1);
  
          }
          roomMsg.users.forEach((sockets: connectedClients) =>{
            if(socket.id !== sockets.id){
              sockets.send(JSON.stringify(msg));
            }
          });
          
        });
        console.log(roomMsg.lockedObjects);
        break;
      }
      case "Addition":{
        const  parsedMsg : string = JSON.parse(msg.msg);
        roomMsg.canvas[0].push(parsedMsg[0]);
        roomMsg.canvas[1].push(parsedMsg[1]);
        console.log(roomMsg.canvas);
        roomMsg.users.forEach((sockets: connectedClients) =>{
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
          if(roomMsg.canvas[0].includes(scaledObjects[0][i])){
            const x = roomMsg.canvas[0].indexOf(scaledObjects[0][i]);
            roomMsg.canvas[1][x] = scaledObjects[1][i];
          }
          else{
            console.log("Object does not exist");
          }
        }
        roomMsg.users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Deletion":{
        
        const deletionIDs = JSON.parse(msg.msg);
        deletionIDs.forEach( (id: string) => {
          if(roomMsg.canvas[0].includes(id)){
            const x = roomMsg.canvas[0].indexOf(id);
            roomMsg.canvas[0].splice(x,1);
            roomMsg.canvas[1].splice(x,1);
          }
          
        });
        roomMsg.users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Clearing":{    
           
        roomMsg.canvas[1] = [];
        roomMsg.canvas[0] = [];
        roomMsg.users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      // Type: "Loading" Contents: [empty]
      case "Loading":{
        console.log("got here");
        console.log(roomMsg);
        if(roomMsg != undefined){
          msg.msg = JSON.stringify(roomMsg.canvas[1]);
          socket.send(JSON.stringify(msg));
          msg.msgType = "Selection";
          msg.msg = JSON.stringify(roomMsg.lockedObjects[1]);
          socket.send(JSON.stringify(msg));
          roomMsg.users.add(socket);
        }
        break;
      }
      // Type: "localLoad" Contents: [Object IDs] [Serialized Objects]
      case "localLoad":{
        const loadedObjects = JSON.parse(msg.msg);
        roomMsg.canvas[0]  = loadedObjects[0];
        roomMsg.canvas[1] = loadedObjects[1];
        msg.msg = JSON.stringify(roomMsg.canvas[1]);
        msg.msgType = "Loading";
        roomMsg.users.forEach((sockets: connectedClients) =>{
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
export const getRooms = () => {
  return roomData;
};
export  const tryPass = (roomCode:string, roomID:string) => {
  console.log("got here");
  let check = false;
  rooms.forEach((element: Room ) => {
    if(element.id == roomID && element.pass == roomCode){
      check = true;
      return;
    }
  });
  return check;
};
export  const roomIDExists = (cookieID:string) => {
  const filter = rooms.filter(obj => {
     return obj.id === cookieID;
  }
  );

  if (filter.length === 0){
    console.log(filter);
    return false;
  }
  else{
    console.log(filter);
    return true;
  }
};
export  const createRoom = (roomName:string) => {
  const newRoom = <Room>{name: roomName, canvas:[[],[]], users: new Set([]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: "tempPass"  };
  rooms.push(newRoom);
  roomData[0].push(newRoom.name);
  roomData[1].push(newRoom.id);
  return newRoom.id;
};
export default wsServer;
