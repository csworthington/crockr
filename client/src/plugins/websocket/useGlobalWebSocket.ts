import { inject, InjectionKey } from 'vue';

export const GlobalWSSocketSymbol: InjectionKey<WebSocket> = Symbol('Global Web Socket Plugin Symbol');

export function useGlobalWebSocket() {
  const GlobalWebSocket = inject(GlobalWSSocketSymbol);
  if (!GlobalWebSocket) {
    throw new Error('No GlobalWebSocket provided!');
  }
  return GlobalWebSocket;
}
