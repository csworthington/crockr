/* eslint-disable no-param-reassign */
import { App, inject, provide } from 'vue';
import Observer from '@/plugins/websocket/Observer';
// eslint-disable-next-line import/no-named-as-default
import Emitter from '@/plugins/websocket/Emitter';
import { websocketOpts } from '@/plugins/websocket/types/websocketPluginTypes.d';
import { GlobalWSSocketSymbol } from '@/plugins/websocket/useGlobalWebSocket';
import ObservableWebSocket from './ObservableWebSocket';

export const GlobalWSDisconnectSymbol = Symbol('Global WebSocket plugin $disconnect function symbol');
export const GlobalWSConnectSymbol = Symbol('Global WebSocket plugin $connect function symbol');

export default {
  install(
    app: App,
    connection: string,
    opts: websocketOpts = { format: '' },
  ): void {
    // No incoming connection, throw an exception
    if (!connection) {
      throw new Error('[GlobalWebSocket] Cannot create connection: connection string is null or undefined');
    }

    // let observer: Observer;
    let observer: ObservableWebSocket;

    opts.$setInstance = (wsInstance: EventTarget) => {
      // Add $socket to global properties
      app.config.globalProperties.$socket = wsInstance;
      app.provide(GlobalWSSocketSymbol, wsInstance);
    };

    // Enable manual connection in configuration options
    if (opts.connectManually) {
      // Create function for globally connecting socket
      const connectSocket = (connectionUrl: string, connectionOpts: websocketOpts) => {
        // Add a set instance to the parameters passed by the caller
        connectionOpts.$setInstance = opts.$setInstance;
        // Create Observer to establish websocket connection
        // observer = new Observer(connectionUrl, connectionOpts);
        observer = new ObservableWebSocket(connectionUrl, connectionOpts);
        // Add $socket globally
        // app.config.globalProperties.$socket = observer.WebSocket;
        // app.provide(GlobalWSSocketSymbol, observer.WebSocket);
        app.config.globalProperties.$socket = observer.socket;
        app.provide(GlobalWSSocketSymbol, observer.socket);
      };

      // Add connectSocket globally
      app.config.globalProperties.$connect = connectSocket;
      app.provide(GlobalWSConnectSymbol, connectSocket);

      // Globally add disconnection processing functions
      const disconnectSocket = () => {
        if (observer && observer.reconnection) {
          // Change the reconnection status to false
          observer.reconnection = false;
        }
        // If the global attribute socket exists, remove it from the global attribute
        if (app.config.globalProperties.$socket) {
          // Close the connection
          app.config.globalProperties.$socket.close();
          delete app.config.globalProperties.$socket;
        }
      };
      app.config.globalProperties.$disconnect = disconnectSocket;
      app.provide(GlobalWSDisconnectSymbol, disconnectSocket);
    } else {
      // Manual connection is not enabled
      observer = new Observer(connection, opts);
      // Add the $socket attribute globally to connect to the websocket server
      app.config.globalProperties.$socket = observer.WebSocket;
      app.provide(GlobalWSSocketSymbol, observer.WebSocket);
    }
    const hasProxy = typeof Proxy !== 'undefined'
      && typeof Proxy === 'function'
      && /native code/.test(Proxy.toString());

    app.mixin({
      created() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const vm = this;
        const { sockets } = this.$options;

        if (hasProxy) {
          this.$options.sockets = new Proxy(
            {},
            {
              set(target: any, key: any, value: any): boolean {
                // 添加监听 | Add monitor
                Emitter.addListener(key, value, vm);
                target[key] = value;
                return true;
              },
              deleteProperty(target: { key: any }, key: any): boolean {
                // 移除监听 | Remove monitor
                Emitter.removeListener(key, vm.$options.sockets[key], vm);
                delete target.key;
                return true;
              },
            },
          );
          app.config.globalProperties.sockets = new Proxy(
            {},
            {
              set(target: any, key: any, value: any): boolean {
                // Add monitor
                Emitter.addListener(key, value, vm);
                target[key] = value;
                return true;
              },
              deleteProperty(target: { key: any }, key: any): boolean {
                // Remove monitor
                Emitter.removeListener(key, vm.$options.sockets[key], vm);
                delete target.key;
                return true;
              },
            },
          );
          if (sockets) {
            Object.keys(sockets).forEach((key: string) => {
              // Add the key in sockets to $options
              this.$options.sockets[key] = sockets[key];
              app.config.globalProperties.sockets[key] = sockets[key];
            });
          }
        } else {
          // Seal the object so that it cannot be changed
          Object.seal(this.$options.sockets);
          Object.seal(app.config.globalProperties.sockets);
          if (sockets) {
            Object.keys(sockets).forEach((key: string) => {
              // Add monitor
              Emitter.addListener(key, sockets[key], vm);
            });
          }
        }
      },
      beforeUnmount() {
        if (hasProxy) {
          const { sockets } = this.$options;

          if (sockets) {
            Object.keys(sockets).forEach((key: string) => {
              // If the proxy has sockets before destruction, remove the keys added
              // to sockets in $options
              delete this.$options.sockets[key];
              delete app.config.globalProperties.sockets;
            });
          }
        }
      },
    });
  },
};
