"use strict";

import e, { Response, Request } from "express";
import * as roomModel from "../../websockets";


export const getRooms = (req: Request, res: Response) => {
  console.log("sending rooms");
  let rooms = roomModel.getRooms();
  console.log(rooms);
  res.json(roomModel.getRooms());
  rooms = null;
  return {req,res};
};
export const tryPass = (req: Request, res: Response) => {
  res.json(roomModel.tryPass(<string>req.query.pass, <string>req.query.roomID));
  return {req,res};
};
export const createRoom = (req: Request, res: Response) => {
  res.json(roomModel.createRoom(<string>req.query.name));
  return {req,res};
};



