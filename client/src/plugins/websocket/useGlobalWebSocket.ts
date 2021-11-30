import { inject, InjectionKey } from 'vue';
import WrappedSocket from './WrappedSocket';

export const GlobalWSSocketSymbol: InjectionKey<WrappedSocket> = Symbol('Global Web Socket Plugin Symbol');

export function useGlobalWebSocket() {
  const GlobalWebSocket = inject(GlobalWSSocketSymbol);
  if (!GlobalWebSocket) {
    throw new Error('No GlobalWebSocket provided!');
  }
  return GlobalWebSocket;
}
