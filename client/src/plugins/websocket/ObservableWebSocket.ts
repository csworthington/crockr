// eslint-disable-next-line import/no-named-as-default
import Emitter from './Emitter';
import WrappedSocket from './WrappedSocket';
import { websocketOpts } from './types/websocketPluginTypes.d';

export default class ObservableWebSocket {
  private readonly format: string; // Data transmission format

  private readonly connectionUrl: string; // Connection url

  private readonly opts: websocketOpts; // Custom parameters that the caller can pass in

  public reconnection: boolean; // Whether to enable reconnection

  private readonly reconnectionAttempts: number; // Maximum number of reconnections

  private readonly reconnectionDelay: number; // Reconnection interval

  private reconnectTimeoutId = 0; // Reconnect timeout id

  private reconnectionCount = 0; // Reconnected times

  private readonly passToStoreHandler: any; // Processing function when transferring data

  private readonly store: any; // Pass in vuex store when vuex is enabled

  private readonly mutations: any; // Pass in the mutations in vuex when vuex is enabled

  public socket: WrappedSocket;

  constructor(url: string, opts: websocketOpts = { format: '' }) {
    // Get the format from the options paramater and convert it to lower case
    this.format = opts.format && opts.format.toLowerCase();

    let formattedUrl = url;

    // If the URL starts with // to process it, add the correct websocket protocol prefix
    if (url.startsWith('//')) {
      // If the current website is an https request, add the wss prefix, otherwise add the ws prefix
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      formattedUrl = `${scheme}:${url}`;
    }

    // Assign the processed url and opts to the internal variables of the current class
    this.connectionUrl = formattedUrl;
    this.opts = opts;
    this.reconnection = this.opts.reconnection || false;
    this.reconnectionAttempts = this.opts.reconnectionAttempts || Infinity;
    this.reconnectionDelay = this.opts.reconnectionDelay || 1000;
    this.passToStoreHandler = this.opts.passToStoreHandler;

    if (this.opts.connectManually === false) {
      this.socket = ObservableWebSocket.establishConnection(formattedUrl, opts);
    }
  }

  static establishConnection(formattedUrl: string, opts: websocketOpts): WrappedSocket {
    // Get the protocol passed in the configuration parameter
    const protocol = opts.protocol || '';
    let sock: WrappedSocket;

    if (opts.WebSocket) {
      sock = WrappedSocket.fromSocket(opts.WebSocket);
    } else {
      // If no protocol is passed, establish a normal websocket connection, otherwise,
      // create a websocket connection with protocol
      sock = new WrappedSocket(formattedUrl, protocol);
    }

    return sock;

    // // Enable json sending
    // if (this.format === 'json') {
    //   // If there is no send Obj in websocket, add this method object
    //   if (!('sendObj' in (this.socket as WebSocket))) {
    //     // Convert the sent message into a json string
    //     // eslint-disable-next-line max-len
    //     (this.socket as WebSocket).sendObj = (obj: JSON) => (this.socket as WebSocket).send(JSON.stringify(obj));
    //   }
    // }

    // if (this.socket === undefined) {
    //   throw new Error('WebSocket object is undefined, cannot connect');
    // } else {
    //   return this.socket;
    // }
  }

  /**
   * Attempt to reestablish the socket connection if lost
   */
  reconnect(): void {
    // Reconnect when the number of reconnections is less than or equal to the set connection times
    if (this.reconnectionCount <= this.reconnectionAttempts) {
      this.reconnectionCount += 1;
      // Clear the timer of the last reconnection
      clearTimeout(this.reconnectTimeoutId);
      // Start to reconnect
      this.reconnectTimeoutId = setTimeout(() => {
        // If vuex is enabled, the reconnection method in vuex is triggered
        if (this.store) {
          this.passToStore('SOCKET_RECONNECT', this.reconnectionCount);
        }
        // reconnect
        this.socket = ObservableWebSocket.establishConnection(this.connectionUrl, this.opts);
        // Trigger Web Socket events
        this.onEvent();
      }, this.reconnectionDelay);
    } else if (this.store) {
      // If vuex is enabled, the reconnection failure method is triggered
      this.passToStore('SOCKET_RECONNECT_ERROR', true);
    }
  }

  /**
   * Event distribution for the socket
   */
  onEvent(): void {
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach(
      (eventType: string) => {
        this.socket.addEventListener(eventType, (event: Event) => {
          Emitter.emit(eventType, event);

          // Call the corresponding method in vuex
          if (this.store) {
            this.passToStore(`SOCKET_${eventType}`, event);
          }

          // Execute when the event is onopen in the reconnect state
          if (this.reconnection && eventType === 'onopen') {
            // Setting example
            // eslint-disable-next-line no-unused-expressions
            this.opts.$setInstance
              && this.opts.$setInstance(event.currentTarget as EventTarget);
            // Empty reconnection times
            this.reconnectionCount = 0;
          }

          // If in the reconnect state and the event is onclose, call the reconnect method
          if (this.reconnection && eventType === 'onclose') {
            this.reconnect();
          }
        });
      },
    );
  }

  /**
   * Trigger a method in vuex
   * @param eventName The name ov the event to trigger
   * @param event The event itself
   */
  passToStore(eventName: string, event: any): void {
    if (this.passToStoreHandler) {
      this.passToStoreHandler(
        eventName, event, this.defaultPassToStore.bind(this),
      );
    } else {
      this.defaultPassToStore(eventName, event);
    }
  }

  defaultPassToStore(eventName: string, event: {
    data: string;
    mutation: string;
    namespace: string;
    action: string;
  }): void {
    // If the beginning of the event name is not SOCKET_ then terminate the function
    if (!eventName.startsWith('SOCKET_')) {
      return;
    }

    let method = 'commit';
    let target = eventName.toUpperCase(); // Turn the letter of the event name to uppercase
    let msg = event; // Message content

    // Test if data exists and the data is in json format
    if (this.format === 'json' && event.data) {
      // Convert data from json string to json object
      msg = JSON.parse(event.data);
      // Determine whether msg is synchronous or asynchronous
      if (msg.mutation) {
        target = [msg.namespace || '', msg.mutation]
          .filter((e: string) => !!e)
          .join('/');
      } else if (msg.action) {
        method = 'dispatch';
        target = [msg.namespace || '', msg.action]
          .filter((e: string) => !!e)
          .join('/');
      }
    }
    if (this.mutations) {
      target = this.mutations[target] || target;
    }
    // Trigger the method in the store
    this.store[method](target, msg);
  }
}
