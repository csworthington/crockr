"use strict";

import e, { Response, Request } from "express";
import { readFile } from "fs";


/**
 * Add an object to the global canvas object
 * @route GET /api/canvas/addobj
 */
export const addObject = (req: Request, res: Response) => {
  const newCanvas = req.body;
  req.app.locals.canvas = newCanvas;
  console.log(req.app.locals.canvas);
};

const serveFile = (req: Request, res: Response, path: string) => {
  const jsonFile = readFile(path, (err, data) => {
    if (!err) {
      res.json(JSON.parse(data.toString()));
    } else {
      const errMsg = `Error in loading ${path}`;
      console.error(errMsg);
      res.status(500);
    }
  });
};

export const getLine = (req: Request, res: Response) => {
  console.log("sending line");
  return serveFile(req, res, "../client/line.json");
};

export const getRect = (req: Request, res: Response) => {
  console.log("sending rect");
  return serveFile(req, res, "../client/rectangle.json");
};

export const getCircle = (req: Request, res: Response) => {
  console.log("sending circle");
  return serveFile(req, res, "../client/circle.json");
};

export const getPen = (req: Request, res: Response) => {
  console.log("sending pen");
  return serveFile(req, res, "../client/pen.json");
};

export const getDog = (req: Request, res: Response) => {
  const dogCanvas = readFile("../client/dog.json", (err, data) => {
    if (!err) {
      console.log("sending dog");
      res.json(JSON.parse(data.toString()));
    } else {
      const errMsg = "Error in loading dog.json";
      console.error(errMsg);
      res.status(500);
    }
  });
};


