import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";

const path = __dirname + "/vue";
const app = express();

app.use(express.static(path));

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

export default app;