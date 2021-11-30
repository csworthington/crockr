import { Client, Server } from 'mock-socket';
import WrappedSocket from '@/plugins/websocket/WrappedSocket';

describe('WrappedSocket', () => {
  describe('Test constructor', () => {
    let mockServer: Server;

    beforeEach(() => {
      mockServer = new Server(process.env.VUE_APP_WEB_SOCKET_URL);
    });

    afterEach(() => {
      mockServer.stop();
    });

    test('Opens a websocket connection with the server when instantiated', () => {
      const clientSocket = new WrappedSocket(process.env.VUE_APP_WEB_SOCKET_URL);
      expect(clientSocket.readyState === WebSocket.OPEN);
      clientSocket.close();
    });

    test('Opens a socket with the specified protocol when requested', () => {
      const clientSocket = new WrappedSocket(process.env.VUE_APP_WEB_SOCKET_URL, 'protocol');
      expect(clientSocket.protocol === 'protocol');
      clientSocket.close();
    });
  });

  describe('Test Message Senders', () => {
    let clientSocket: WrappedSocket;
    let mockServer: Server;

    const stringMessage = 'asdf';
    const objMessage = {
      someProp: 'value',
      someOtherProp: 123,
    };

    beforeEach(() => {
      mockServer = new Server(process.env.VUE_APP_WEB_SOCKET_URL);
      clientSocket = new WrappedSocket(process.env.VUE_APP_WEB_SOCKET_URL);
    });

    test('Can send a message string to the mock server', () => {
      mockServer.clients()[0].on('message', (msg) => {
        expect(msg).toEqual(stringMessage);
        console.log(msg);
      });
      clientSocket.send(stringMessage);
    });

    test('Can send an object to the mock server', () => {
      mockServer.clients()[0].on('message', (msg) => {
        console.log();
        expect(msg).toEqual(JSON.stringify(objMessage));
      });
      clientSocket.sendObj(objMessage);
    });

    afterEach(() => {
      clientSocket.close();
    });
  });

  // beforeAll(() => {
  //   const clientSocket = new WrappedSocket(process.env.w)
  // })

  // test('Opens connection to mockServer on load', () => {
  //   expect(clientSocket.readyState === WebSocket.OPEN);
  // });

  // test('getSocket returns the underlying socket when type is instantiated', () => {
  //   expect(clientSocket.getSocket()).toBeInstanceOf(WebSocket);
  // });
});
