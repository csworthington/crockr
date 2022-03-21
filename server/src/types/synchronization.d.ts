import * as ws from "ws";

export interface Room {
  name: string;
  canvas: string[][];
  users: Set<ConnectedClients>;
  lockedObjects: string[][];
  id: string;
  pass: string;
  taID: string;
  edit:boolean;
}
export interface ConnectedClients extends ws.WebSocket {
  name: string;
  id: string;
  roomID: string;
  userID: string;
}
export interface UpdateMessage {
  msgType: string;
  userID: string;
  msg: string;
}

