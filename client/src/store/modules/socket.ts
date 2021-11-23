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
   * @param {SocketState} state The current state of the socket
   * @param {Event} event The onopen event emitted by the socket
   */
  SOCKET_ONOPEN(state: SocketState, event: Event): void {
    const socket = event.currentTarget;
    state.isConnected = true;
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
  // Connection closed
  SOCKET_ONCLOSE(state: SocketState, event: Event): void {
    state.isConnected = false;
    // Stop the heartbeat message when the connection is closed
    clearInterval(state.heartBeatTimer);
    state.heartBeatTimer = 0;
    console.log(`Websocket closed at: ${new Date()}`);
    console.log(event);
  },
  // An error occurred
  SOCKET_ONERROR(state: SocketState, event: Event): void {
    console.error(state, event);
  },
  // Receive the message sent by the server
  SOCKET_ONMESSAGE(state: SocketState, message: string): void {
    state.message = message;
  },
  // Auto reconnect
  SOCKET_RECONNECT(state: SocketState, count: number): void {
    console.info('Reconnecting...', state, count);
  },
  // Reconnect error
  SOCKET_RECONNECT_ERROR(state: SocketState): void {
    state.reconnectError = true;
  },
};

export const socket = {
  namespaced: false,
  state,
  mutations,
};
