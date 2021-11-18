"use strict";

import { Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";


/**
 * Get an RFC4122 v4 UUID 
 * @route GET /api/uuid
 */
export const getUUID = (req: Request, res: Response) => {
    res.json({ id: uuidv4() });
};
