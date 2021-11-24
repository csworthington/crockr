import errorHandler from "errorhandler";
import { IncomingMessage } from "http";
import { Socket } from "net";
import { WebSocket } from "ws";
// import app from "./app";
import app from "./simpleapp";
import wsServer from "./websockets";



 
//creation of socket

 const server = new WebSocket.Server({ port: 3000 });
 //hadnleing when a connection is made
 server.on("connection", function connection(socket) {

   //handling waht to do when msg recieved 
   socket.on("message", function incoming(message) {
     console.log("received: %s", message);
     socket.send("Got the following msg: " + message);
   });

   socket.send("Connected");
 });

//export default wsServer;
