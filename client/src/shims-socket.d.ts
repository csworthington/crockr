/* eslint-disable no-shadow */
import { websocketOpts } from 'vue-native-websocket-vue3/dist/lib/type/pluginsType.d';

/**
 * To ensure typescript recognizes the global properties added by the websocket plugin, add
 * these values to the ComponentCustomProperties interface
 */
declare module '@vue/runtime-core' {
  import { ComponentCustomProperties } from 'vue';

  export interface ComponentCustomProperties {
    $connect: (url: string, opts?: websocketOpts) => void;
    $disconnect: () => void;
    $socket: WebSocket;
  }
}
