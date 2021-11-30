import { Client, Server } from 'mock-socket';
import ConnectableSocket from '@/plugins/websocket/WrappedSocket';

describe('WrappedSocket', () => {
  const socketUrl = process.env.VUE_APP_WEB_SOCKET_URL;

  describe('Test constructor', () => {
    let mockServer: Server;
    let clientSocket: ConnectableSocket;

    beforeEach(() => {
      mockServer = new Server(socketUrl);
    });

    afterEach(() => {
      if (clientSocket) {
        clientSocket.close();
      }
      mockServer.stop();
    });

    test('Opens a websocket connection with the server when instantiated', () => {
      clientSocket = new ConnectableSocket(socketUrl);
      expect(clientSocket.readyState === WebSocket.OPEN);
    });

    test('Opens a socket with the specified protocol when requested', () => {
      clientSocket = new ConnectableSocket(socketUrl, 'protocol');
      expect(clientSocket.protocol === 'protocol');
    });

    test('Can create a connectable socket from an existing socket', () => {
      const existingSocket = new WebSocket(socketUrl);
      clientSocket = ConnectableSocket.fromSocket(existingSocket);
      expect(clientSocket.getSocket()).toEqual(existingSocket);
    });

    test('Can open a socket later once initial socket is created', () => {
      clientSocket = new ConnectableSocket();
      expect(mockServer.clients.length).toEqual(0);

      debugger;

      mockServer.addEventListener('connection', () => {
        console.debug('new connection');
      });

      // When connection is opened, send msg
      clientSocket.addEventListener('open', () => {
        expect(mockServer.clients.length).toEqual(1);
      });

      // Open connection
      clientSocket.connect(socketUrl);
    });
  });

  describe('Test Message Senders', () => {
    let clientSocket: ConnectableSocket;
    let mockServer: Server;

    const stringMessage = 'asdf';
    const objMessage = {
      someProp: 'value',
      someOtherProp: 123,
    };

    beforeEach(() => {
      mockServer = new Server(process.env.VUE_APP_WEB_SOCKET_URL);
      clientSocket = new ConnectableSocket(process.env.VUE_APP_WEB_SOCKET_URL);
    });

    afterEach(() => {
      clientSocket.close();
      mockServer.stop();
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
