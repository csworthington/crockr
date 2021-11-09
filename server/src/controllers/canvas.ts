import { Request, Response } from "express";

/**
 * Canvas page
 * @route GET /
 */
export const getCanvas = (req: Request, res: Response) => {
    res.sendFile("./views/vue/dist/index.html");
};
