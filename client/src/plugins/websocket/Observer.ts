// eslint-disable-next-line import/no-named-as-default
import Emitter from './Emitter';
import { websocketOpts } from '@/plugins/websocket/types/websocketPluginTypes.d';

export default class {
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

  public WebSocket: WebSocket | undefined; // websocket连接 | websocket connection

  /**
   *  Observer mode, websocket service core function package
   * @param connectionUrl url
   * @param opts Other configuration items
   */
  constructor(connectionUrl: string, opts: websocketOpts = { format: '' }) {
    // Get the format in the parameter and convert it to lowercase
    this.format = opts.format && opts.format.toLowerCase();

    let formattedConnectionUrl = connectionUrl;

    // If the URL starts with // to process it, add the correct websocket protocol prefix
    if (connectionUrl.startsWith('//')) {
      // If the current website is an https request, add the wss prefix, otherwise add the ws prefix
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      formattedConnectionUrl = `${scheme}:${connectionUrl}`;
    }
    // Assign the processed url and opts to the internal variables of the current class
    this.connectionUrl = formattedConnectionUrl;
    this.opts = opts;
    this.reconnection = this.opts.reconnection || false;
    this.reconnectionAttempts = this.opts.reconnectionAttempts || Infinity;
    this.reconnectionDelay = this.opts.reconnectionDelay || 1000;
    this.passToStoreHandler = this.opts.passToStoreHandler;

    // establish connection
    this.connect(formattedConnectionUrl, opts);

    // If store is passed in the configuration parameters, store will be assigned
    if (opts.store) {
      this.store = opts.store;
    }
    // If there is a synchronization processing function that passes vuex in the
    // configuration parameters, assign mutations
    if (opts.mutations) {
      this.mutations = opts.mutations;
    }
    // 事件触发
    this.onEvent();
  }

  // Connect websocket
  connect(
    connectionUrl: string,
    opts: websocketOpts = { format: '' },
  ): WebSocket {
    // Get the protocol passed in the configuration parameter
    const protocol = opts.protocol || '';
    // If no protocol is passed, establish a normal websocket connection, otherwise,
    // create a websocket connection with protocol
    this.WebSocket = opts.WebSocket
      || (protocol === ''
        ? new WebSocket(connectionUrl)
        : new WebSocket(connectionUrl, protocol));
    // Enable json sending
    if (this.format === 'json') {
      // If there is no sen Obj in websocket, add this method object
      if (!('sendObj' in (this.WebSocket as WebSocket))) {
        // Convert the sent message into a json string
        // eslint-disable-next-line max-len
        (this.WebSocket as WebSocket).sendObj = (obj: JSON) => (this.WebSocket as WebSocket).send(JSON.stringify(obj));
      }
    }

    if (this.WebSocket === undefined) {
      throw new Error('WebSocket object is undefined, cannot connect');
    } else {
      return this.WebSocket;
    }
  }

  // reconnect
  reconnect(): void {
    // Reconnect when the number of reconnections is less than or equal to the set connection times
    if (this.reconnectionCount <= this.reconnectionAttempts) {
      this.reconnectionCount += 1;
      // Clear the timer of the last reconnection
      clearTimeout(this.reconnectTimeoutId);
      // 开始重连
      this.reconnectTimeoutId = setTimeout(() => {
        // If vuex is enabled, the reconnection method in vuex is triggered
        if (this.store) {
          this.passToStore('SOCKET_RECONNECT', this.reconnectionCount);
        }
        // reconnect
        this.connect(this.connectionUrl, this.opts);
        // Trigger Web Socket events
        this.onEvent();
      }, this.reconnectionDelay);
    } else if (this.store) {
      // If vuex is enabled, the reconnection failure method is triggered
      this.passToStore('SOCKET_RECONNECT_ERROR', true);
    }
  }

  // Event distribution
  onEvent(): void {
    ['onmessage', 'onclose', 'onerror', 'onopen'].forEach(
      (eventType: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (this.WebSocket as WebSocket)[eventType] = (event: any) => {
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
              && this.opts.$setInstance(event.currentTarget);
            // Empty reconnection times
            this.reconnectionCount = 0;
          }

          // If in the reconnect state and the event is onclose, call the reconnect method
          if (this.reconnection && eventType === 'onclose') {
            this.reconnect();
          }
        };
      },
    );
  }

  /**
   * Trigger methods in vuex
   * @param eventName 事件名称
   * @param event 事件
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  passToStore(eventName: string, event: any): void {
    // If there is an event processing function in the parameter, the custom event processing
    // function is executed, otherwise the default processing function is executed
    if (this.passToStoreHandler) {
      this.passToStoreHandler(
        eventName,
        event,
        this.defaultPassToStore.bind(this),
      );
    } else {
      this.defaultPassToStore(eventName, event);
    }
  }

  /**
   * The default event handler
   * @param eventName 事件名称
   * @param event 事件
   */
  defaultPassToStore(
    eventName: string,
    event: {
      data: string;
      mutation: string;
      namespace: string;
      action: string;
    },
  ): void {
    // If the beginning of the event name is not SOCKET_ then terminate the function
    if (!eventName.startsWith('SOCKET_')) {
      return;
    }
    let method = 'commit';
    // Turn the letter of the event name to uppercase
    let target = eventName.toUpperCase();
    // Message content
    let msg = event;
    // data exists and the data is in json format
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

// Extended global object
declare global {
  // Extend websocket object, add send Obj method
  interface WebSocket {
    sendObj(obj: JSON): void;
  }
}
