"use strict";

import { Response, Request } from "express";

/**
 * Get a UUID from the server
 * @route GET /uuid
 */
export const getUUID = (req: Request, res: Response) => {
  res.json({ id: "abc-def" });
};