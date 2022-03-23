"use strict";

import e, { Response, Request } from "express";
import * as roomModel from "../../websockets";
import { v4 as uuidv4 } from "uuid";
import * as mongoController from "../../UserSchema";

export const getRooms = (req: Request, res: Response) => {
  console.log("sending rooms");
  let rooms = roomModel.getRooms();
  console.log(rooms);
  res.json(roomModel.getRooms());
  rooms = null;
  return {req,res};
};
export const tryPass = async (req: Request, res: Response) => {
  const check = roomModel.tryPass(<string>req.query.pass, <string>req.query.roomID);
  if (check){
    await mongoController.addUser(<string> req.query.userID,<string>req.query.roomID,<string> req.query.userName);
  }
  res.json(check);
  return {req,res};
};
export const handleCookie = (req: Request, res: Response) => {
  res.json(roomModel.roomIDExists(<string>req.query.roomID));
  return {req,res};
};
export const createRoom = async (req: Request, res: Response) => {
  console.log("got to create room");
  res.json(await roomModel.createRoom(<string>req.query.name, <string> req.query.userID));
  return {req,res};
};
export const getUUID = (req: Request, res: Response) => {
  res.json(uuidv4());
  return {req,res};
};
export const getRoomID = async (req: Request, res: Response) => {
  res.json(await mongoController.getRoomID(<string>req.query.userID));
  return {req,res};
  
};
export const getCanEdit = async (req: Request, res: Response) => {
  res.json(await mongoController.getCanEdit(<string>req.query.userID));
  return {req,res};
  
};
export const getUserPerm = async (req: Request, res: Response) => {
  res.json(await mongoController.getAllUsers(<string>req.query.roomID));
  return {req,res};
};



