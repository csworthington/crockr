import { inject, InjectionKey } from 'vue';
import ConnectableSocket from './WrappedSocket';

export const GlobalWSSocketSymbol: InjectionKey<ConnectableSocket> = Symbol('Global Web Socket Plugin Symbol');

export function useGlobalWebSocket() {
  const GlobalWebSocket = inject(GlobalWSSocketSymbol);
  if (!GlobalWebSocket) {
    throw new Error('No GlobalWebSocket provided!');
  }
  return GlobalWebSocket;
}
