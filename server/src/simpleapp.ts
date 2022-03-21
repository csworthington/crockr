import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import flash from "express-flash";
import lusca from "lusca";
import * as mongoController from "./UserSchema";

import * as uuidController from "./controllers/uuid";
import * as canvasController from "./controllers/canvas/canvas";
import * as roomsController from "./controllers/rooms/rooms";
import * as webSocketController from "./websockets";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import mongoose, { mongo } from "mongoose";
import bluebird from "bluebird";

// Create the Express server
const app = express();
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

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
mongoController.resetDatabase();
app.get("/api/uuid", uuidController.getUUID);
app.post("/api/canvas/addobj", canvasController.addObject);
app.post("/api/web",  function (req, res) {
    res.send("apple");
    console.log( "got", ); });


app.get("/api/canvas/getdog", canvasController.getDog);
app.get("/api/canvas/getline", canvasController.getLine);
app.get("/api/canvas/getrect", canvasController.getRect);
app.get("/api/canvas/getcircle", canvasController.getCircle);
app.get("/api/canvas/getpen", canvasController.getPen);
app.get("/api/rooms/getrooms", roomsController.getRooms);
app.get("/api/rooms/trypass", roomsController.tryPass);
app.get("/api/rooms/createroom", roomsController.createRoom);
app.get("/api/rooms/handleCookie", roomsController.handleCookie);
app.get("/api/rooms/getuuid", roomsController.getUUID);
app.get("/api/rooms/getroomID", roomsController.getRoomID);
app.get("/api/rooms/userperm", roomsController.getUserPerm);

export default app;
