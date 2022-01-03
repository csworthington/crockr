import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import flash from "express-flash";
import lusca from "lusca";

import * as uuidController from "./controllers/uuid";
import * as canvasController from "./controllers/canvas/canvas";

// Create the Express server
const app = express();

// Set up configuration for Express
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

/**
 * Set up canvas
 */
app.locals.canvas = {};
app.locals.replaceCanvas = (newCanvas: Record<string, any>): void => {
  app.locals.canvas = newCanvas;
};

/**
 * Set up Primary App Routes
 */
app.get("/api/uuid", uuidController.getUUID);
app.post("/api/canvas/addobj", canvasController.addObject);
app.post("/api/web",  function (req, res) {
    res.send("apple");
    console.log( "got", ); });


app.get("/api/canvas/getdog", canvasController.getDog);
app.get("/api/canvas/getline", canvasController.getLine);
app.get("/api/canvas/getrect", canvasController.getRect);
app.get("/api/canvas/getcircle", canvasController.getCircle);
export default app;
