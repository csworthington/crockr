import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import flash from "express-flash";
import lusca from "lusca";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import MongoStore from "connect-mongo";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

import * as uuidController from "./controllers/uuid";
import * as canvasController from "./controllers/canvas/canvas";
import session from "express-session";

// Create the Express server
const app = express();
// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});


// Set up configuration for Express
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        mongoUrl,
        mongoOptions: {
            autoReconnect: true
        }
    }),
    cookie: { maxAge: 60000 }
}));

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
app.get("/api/canvas/getpen", canvasController.getPen);

export default app;
