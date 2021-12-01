/* eslint-disable no-param-reassign */
import { App } from 'vue';
import { GlobalWSSocketSymbol } from '@/plugins/websocket/useGlobalWebSocket';

export default {
  install(
    app: App,
    connectionUrl: string,
    protocol?: string | string[],
  ): void {
    // No incoming connection, throw an exception
    if (!connectionUrl) {
      throw new Error('[GlobalWebSocket] Cannot create connection: connection string is null or undefined');
    }

    const socket = new WebSocket(connectionUrl, protocol);
    app.config.globalProperties.$socket = socket;
    app.provide(GlobalWSSocketSymbol, socket);
  },
};
