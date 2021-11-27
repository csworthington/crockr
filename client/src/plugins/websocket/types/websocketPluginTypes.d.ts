// Unified definition of the types used in the plugin

// Type definition of processing function when transferring data
export type storeHandler<T = any> = (
  eventName: string,
  event: {
    data: string;
    mutation: string;
    namespace: string;
    action: string;
  },
  opts?: T
) => void;

// The parameter type definition that the plug-in caller can pass
export type websocketOpts<T = any> = {
  format: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  connectManually?: boolean;
  passToStoreHandler?: storeHandler;
  store?: T;
  mutations?: T;
  protocol?: string;
  WebSocket?: WebSocket;
  $setInstance?: (event: EventTarget) => void;
};
