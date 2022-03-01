import * as ws from "ws";

export interface Room {
  name: string;
  canvas: string[][];
  users: Set<ConnectedClients>;
  lockedObjects: string[][];
  id: string;
  pass: string;
}
export interface ConnectedClients extends ws.WebSocket {
  name: string;
  id: string;
  roomID: string;
  userID: string;
}
export interface UpdateMessage {
  msgType: string;
  roomID: string;
  msg: string;
}

