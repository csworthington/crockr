import { Socket } from "dgram";
import { Connection } from "mongoose";
import * as ws from "ws";
import { getUUID} from "./controllers/uuid";
import { v4 as uuidv4 } from "uuid";
import e from "express";

const activeConnections = new  Set<connectedClients>();
const rooms: (any)[][] = [[],[]];
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
rooms[0].push(mainRoom.id);
rooms[1].push(mainRoom);
rooms[0].push(secondaryRoom.id);
rooms[1].push(secondaryRoom);
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
  rooms[1].forEach((element : Room) => {
    roomData[0].push(element.name);
    roomData[1].push(element.id);
    });
  const loadMsg : updateMsg = {msgType: "Loading", roomID:"", msg: JSON.stringify(rooms[1][0].canvas[1])};
  const roomUpdate : updateMsg = {msgType: "roomUpdate", roomID:"",  msg: JSON.stringify(roomData)};
  socket.send(JSON.stringify(loadMsg));
  loadMsg.msgType = "Selection";
  loadMsg.msg = JSON.stringify(rooms[1][0].lockedObjects[1]);
  socket.send(JSON.stringify(loadMsg));
  socket.send(JSON.stringify(roomUpdate));

  // Handle incoming messages
  socket.on("message", (message: Buffer) => {
    // Create a message showing who sent what information
    
    const msg = JSON.parse(message.toString());
    console.log("test msg:");
    console.log(msg);
    console.log("ID array:");
    const index = rooms[0].indexOf(msg.roomID);
    switch(msg.msgType){

      case "Selection":{
        const selectedIds = JSON.parse(msg.msg);
        console.log("recieved Selection update ");
        selectedIds.forEach( (id: string) => {
          if(rooms[1][index].lockedObjects[1].includes(id) === false){
            rooms[1][index].lockedObjects[0].push(socket.id);
            rooms[1][index].lockedObjects[1].push(id);
  
          }
          
        });
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        console.log(rooms[1][index].lockedObjects);
        break;
      }
      case "Deselection":{
        console.log("recieved Deselection update ");
        const deselectedIds = JSON.parse(msg.msg);
        deselectedIds.forEach( (id: string) => {
          if(rooms[1][index].lockedObjects[1].includes(id)){
            const x = rooms[1][index].lockedObjects[1].indexOf(id);
            rooms[1][index].lockedObjects[0].splice(x,1);
            rooms[1][index].lockedObjects[1].splice(x,1);
  
          }
          rooms[1][index].users.forEach((sockets: connectedClients) =>{
            if(socket.id !== sockets.id){
              sockets.send(JSON.stringify(msg));
            }
          });
          
        });
        console.log(rooms[1][index].lockedObjects);
        break;
      }
      case "Addition":{
        
        const  parsedMsg : string = JSON.parse(msg.msg);
        rooms[1][index].canvas[0].push(parsedMsg[0]);
        rooms[1][index].canvas[1].push(parsedMsg[1]);
        console.log(rooms[1][index].canvas);
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
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
          if(rooms[1][index].canvas[0].includes(scaledObjects[0][i])){
            const x = rooms[1][index].canvas[0].indexOf(scaledObjects[0][i]);
            rooms[1][index].canvas[1][x] = scaledObjects[1][i];
          }
          else{
            console.log("Object does not exist");
          }
        }
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Deletion":{
        
        const deletionIDs = JSON.parse(msg.msg);
        deletionIDs.forEach( (id: string) => {
          if(rooms[1][index].canvas[0].includes(id)){
            const x = rooms[1][index].canvas[0].indexOf(id);
            rooms[1][index].canvas[0].splice(x,1);
            rooms[1][index].canvas[1].splice(x,1);
          }
          
        });
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      case "Clearing":{    
           
        rooms[1][index].canvas[1] = [];
        rooms[1][index].canvas[0] = [];
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
        break;
      }
      // Type: "Loading" Contents: [empty]
      case "Loading":{
        console.log("got here");
        console.log(index);
        msg.msg = JSON.stringify(rooms[1][index].canvas[1]);
        socket.send(JSON.stringify(msg));
        msg.msgType = "Selection";
        msg.msg = JSON.stringify(rooms[1][index].lockedObjects[1]);
        socket.send(JSON.stringify(msg));
        break;
      }
      // Type: "localLoad" Contents: [Object IDs] [Serialized Objects]
      case "localLoad":{
        const loadedObjects = JSON.parse(msg.msg);
        rooms[1][index].canvas[0]  = loadedObjects[0];
        rooms[1][index].canvas[1] = loadedObjects[1];
        msg.msg = JSON.stringify(rooms[1][index].canvas[1]);
        msg.msgType = "Loading";
        rooms[1][index].users.forEach((sockets: connectedClients) =>{
          if(socket.id !== sockets.id){
            sockets.send(JSON.stringify(msg));
          }
        });
         break;

      }
      // Type: "newRoom" Contents: String : Name
      case "newRoom":{
        const tempPass = "1";
        // rooms.push(<Room> {name: msg.msg, canvas:[[],[]], users: new Set([socket]), lockedObjects: [[],[]], id: <string>uuidv4(), pass: tempPass  });
        
        break;
      }
      case "Password":{
        const passData : string[]= JSON.parse(msg.msg);
        let check = false;
        let roomIDCheck = "";
        rooms[1].forEach((element: Room ) => {
          if(element.id == passData[0] && element.pass == passData[1]){
            check = true;
            roomIDCheck = passData[0];
            element.users.add(socket);
            return;
          }
          
        });
        if (check){
          const checkMsg : updateMsg = {msgType:"Verification", roomID:"", msg:  JSON.stringify([true,roomIDCheck])};
          socket.send(JSON.stringify(checkMsg));

        }
        else{
          const checkMsg : updateMsg = {msgType:"Verification", roomID:"",  msg:  JSON.stringify([false,roomIDCheck])};
          socket.send(JSON.stringify(checkMsg));
        }

        break;
      }
      case "roomUpdate" :{
        socket.send(JSON.stringify(roomUpdate));
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
