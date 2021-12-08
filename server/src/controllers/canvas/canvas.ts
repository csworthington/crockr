"use strict";

import { Response, Request } from "express";
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

export const getDog = (req: Request, res: Response) => {
  const dogCanvas = readFile("../client/rectangle.json", (err, data) => {
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


