import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import flash from "express-flash";
import lusca from "lusca";
<<<<<<< HEAD
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import MongoStore from "connect-mongo";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
=======
import * as mongoController from "./UserSchema";
>>>>>>> origin/dev

import * as uuidController from "./controllers/uuid";
import * as canvasController from "./controllers/canvas/canvas";
<<<<<<< HEAD
import session from "express-session";

// Create the Express server
const app = express();
// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
=======
import * as roomsController from "./controllers/rooms/rooms";
import * as webSocketController from "./websockets";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import mongoose, { mongo } from "mongoose";
import bluebird from "bluebird";

// Create the Express server
const app = express();
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;
<<<<<<< HEAD
mongoose.connect(mongoUrl).then(
    () => { 
        const testSchema = new mongoose.Schema({name: "string"});
        const Twist = mongoose.model("twist", testSchema);   
        console.log( `Connected to the following mongo url${mongoUrl}`);
        Twist.create({ name: "small" }, function (err, twist) {
            // saved!
          });
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ 
    },
>>>>>>> origin/add-equations-to-canvas
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});
<<<<<<< HEAD


=======
>>>>>>> origin/add-equations-to-canvas
=======

>>>>>>> origin/dev
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
    cookie: { maxAge: 60000, secure:true }
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
