/* eslint-disable no-param-reassign */
import { App } from 'vue';
import { store } from '@/store/index';
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

    // On creation of socket, commit SOCKET_ONCREATED event
    store.commit('socket/SOCKET_ONCREATED');

    // Add event listeners for socket opening, closing and errors
    socket.addEventListener('open', (ev: Event) => {
      store.commit('socket/SOCKET_ONOPEN', ev);
    });

    socket.addEventListener('error', (ev: Event) => {
      store.commit('socket/SOCKET_ONERROR', ev);
    });

    socket.addEventListener('close', (ev: CloseEvent) => {
      store.commit('socket/SOCKET_ONCLOSE', ev);
    });

    app.config.globalProperties.$socket = socket;
    app.provide(GlobalWSSocketSymbol, socket);
  },
};
