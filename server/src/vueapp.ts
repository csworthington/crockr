import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import path from "path";

import * as testApiController from "./controllers/testapi";

const app = express();

app.use(express.static(path.join(__dirname, "public/vue"), { maxAge: 31557600000 }));

/**
 * Express configuration
 */
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.get("/", (request, response) => {
  console.log(`Path is ${path}`);
  response.sendFile(path + "index.html");
});

app.get("/api/uuid", testApiController.getUUID);

export default app;