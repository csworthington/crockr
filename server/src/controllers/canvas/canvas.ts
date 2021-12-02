"use strict";

import { Response, Request } from "express";


/**
 * Add an object to the global canvas object
 * @route GET /api/canvas/addobj
 */
export const addObject = (req: Request, res: Response) => {
  console.log(req.body);
  const newCanvas = req.body;
  console.log(newCanvas);
};


