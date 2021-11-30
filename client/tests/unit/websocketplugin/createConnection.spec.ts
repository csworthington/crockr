// import Vue from 'vue';
// import { mount } from '@vue/test-utils';
// import { Client, Server } from 'mock-socket';
// import HelloWorld from '@/components/HelloWorld.vue';
// import App from '@/main';
// import GlobalWebSocket from '@/plugins/websocket/GlobalWebSocket';

// describe('WebSocketPlugin', () => {
//   const mockServer = new Server(process.env.VUE_APP_WEB_SOCKET_URL);

//   mockServer.on('connection', (socket: Client) => {
//     socket.on('message', (data) => {
//       expect(data).toEqual('test');
//     });
//   });

//   beforeAll(() => {
//     const wrapper = mount(App, {
//       global: {
//         plugins: [GlobalWebSocket],
//       },
//     });
//   });

//   test('Opens connection to mockServer on load', () => {
//     console.log('in here');
//   });
// });
