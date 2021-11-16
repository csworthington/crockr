import errorHandler from "errorhandler";
import { IncomingMessage } from "http";
import { Socket } from "net";
import { WebSocket } from "ws";
// import app from "./app";
import app from "./simpleapp";
import wsServer from "./websockets";


/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}


/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

/**
 * Set up websockets server
 */
server.on("upgrade", (request: IncomingMessage, socket: Socket, head: Buffer) => {
  wsServer.handleUpgrade(request, socket, head, (socket: WebSocket) => {
    wsServer.emit("connection", socket, request);
  });
});

export default server;
