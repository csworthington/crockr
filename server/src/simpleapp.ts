import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import flash from "express-flash";
import lusca from "lusca";
import path from "path";

import * as uuidController from "./controllers/uuid";

// Create the Express server
const app = express();

// Set up configuration for Express
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

/**
 * Set up Primary App Routes
 */
app.get("/api/uuid", uuidController.getUUID);

export default app;