/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
export interface SocketState {
  isConnected: boolean;
  message: string;
  reconnectError: boolean;
  heartBeatInterval: number;
  heartBeatTimer: number;
}

const state = {
  // Connection Status
  isConnected: false,
  // Message content
  message: '',
  // Reconnect error
  reconnectError: false,
  // Heartbeat message sending time
  heartBeatInterval: 50000,
  // Heartbeat timer
  heartBeatTimer: 0,
};

const mutations = {
  /**
   * Handle the onopen event emitted by the socket
   * @param {SocketState} socketState The current state of the socket
   * @param {Event} event The onopen event emitted by the socket
   */
  SOCKET_ONOPEN(socketState: SocketState, event: Event): void {
    socketState.isConnected = true;
    console.log('connected to socket');
    console.dir(event.currentTarget);
    // When the connection is successful, start sending heartbeat messages regularly to avoid
    // being disconnected by the server
    // state.socket.heartBeatTimer = setInterval(() => {
    //   const message = 'Heartbeat message';
    //   // eslint-disable-next-line no-unused-expressions
    //   state.socket.isConnected && app.config.globalProperties.$socket.sendObj({
    //     code: 200,
    //     msg: message,
    //   });
    // }, state.socket.heartBeatInterval);
  },

  /**
   * Handle the WebSocket onclose event emitted by the socket
   * @param {SocketState} socketState The current state of the socket
   * @param {CloseEvent} event The WebSocket CloseEvent
   */
  SOCKET_ONCLOSE(socketState: SocketState, event: CloseEvent): void {
    socketState.isConnected = false;
    // Stop the heartbeat message when the connection is closed
    clearInterval(state.heartBeatTimer);
    // socketState.heartBeatTimer = 0;
    console.log(`Websocket closed at: ${new Date()}`);
    console.log(event);
  },

  /**
   * Handle an error event emitted by the WebSocket
   * @param {SocketState} socketState The current state of the socket
   * @param {Error} event The Error event emitted by the WebSocket
   */
  SOCKET_ONERROR(socketState: SocketState, event: Event): void {
    console.error(socketState, event);
  },

  /**
   * Handle a message event emitted by the websocket
   * @param {SocketState} socketState The current state of the socket
   * @param {MessageEvent} message The MessageEvent emitted by the websocket
   */
  SOCKET_ONMESSAGE(socketState: SocketState, event: MessageEvent): void {
    socketState.message = event.data;
  },

  // Auto reconnect
  SOCKET_RECONNECT(socketState: SocketState, count: number): void {
    console.info('Reconnecting...', socketState, count);
  },
  // Reconnect error
  SOCKET_RECONNECT_ERROR(socketState: SocketState): void {
    socketState.reconnectError = true;
  },
};

export const socket = {
  namespaced: true,
  state,
  mutations,
};
