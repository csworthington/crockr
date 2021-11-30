export default class WrappedSocket {
  private socket: WebSocket | null;

  public readyState: number | null;

  public protocol: string | null;

  constructor(url: string, protocols?: string | string[]) {
    if (protocols && protocols !== '') {
      this.socket = new WebSocket(url, protocols);
    } else {
      this.socket = new WebSocket(url);
    }
    this.readyState = this.socket.readyState;
    this.protocol = this.socket.protocol;
  }

  /**
   * Create a new WrappedSocket object from an existing vanilla WebSocket
   * @param socket The socket to create the wrapper from
   * @returns The instantiated websocket object
   */
  static fromSocket(socket: WebSocket): WrappedSocket {
    return new WrappedSocket(socket.url, socket.protocol);
  }

  addEventListener(
    type: keyof WebSocketEventMap,
    listener: (evt: CloseEvent | Event | MessageEvent<any>) => any,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (this.socket) {
      this.socket.addEventListener(type, listener, options);
    } else {
      throw new Error('[Global-WebSocket-Plugin] Event Listener not added!: WebSocket not Instantiated!');
    }
  }

  /**
   * Remove an event listener from the socket
   * @param type Type of the event to be removed
   * @param listener The event listener to be removed
   * @param {EventListenerOptions} options
   */
  removeEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (evt: WebSocketEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void {
    if (this.socket) {
      this.socket.removeEventListener(type, listener, options);
    } else {
      throw new Error('[Global-WebSocket-Plugin] Event Listener not removed!: WebSocket not Instantiated!');
    }
  }

  send(data: string | Blob | ArrayBufferView | ArrayBufferLike): void {
    if (this.socket) {
      this.socket.send(data);
    } else {
      throw new Error('[Global-WebSocket-Plugin] Message not sent: WebSocket not Instantiated!');
    }
  }

  /**
   * Helper method for sending an object through the websocket
   * @param obj A valid Javascript object to be sent
   */
  sendObj(obj: Record<string, any>): void {
    if (this.socket) {
      this.socket.send(JSON.stringify(obj));
    } else {
      throw new Error('[Global-WebSocket-Plugin] Message not sent: WebSocket not Instantiated!');
    }
  }

  /**
   * Close the underlying socket, if the socket exists.
   * @param {number} code The Status code for closing the socket. See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code for full list of status codes
   * @param {string} reason A human-readable string explaining why the connection is closing.
   */
  close(code?: number, reason?: string): void {
    if (this.socket) {
      this.socket.close(code, reason);
    }
  }

  getSocket(): WebSocket {
    if (this.socket) {
      return this.socket;
    }
    throw new Error('[Global-WebSocket-Plugin] WebSocket not Instantiated!');
  }
}
