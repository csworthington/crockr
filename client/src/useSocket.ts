import { inject } from 'vue';
import { SocketKey } from './symbols';

// eslint-disable-next-line import/prefer-default-export
export function useSocket(): WebSocket {
  const SocketObj = inject(SocketKey);
  if (!SocketObj) {
    throw new Error('No Socket Object provided!');
  }
  return SocketObj;
}
