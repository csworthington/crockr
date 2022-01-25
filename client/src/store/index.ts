import { createStore } from 'vuex';
import { State } from '@/store/typings.d';
import { chat } from '@/store/modules/chat';
import { colourPalette } from '@/store/modules/colourPalette';
import { socket } from '@/store/modules/socket';
import { roomID } from '@/store/modules/roomID';

// eslint-disable-next-line import/prefer-default-export
export const store = createStore<State>({
  modules: {
    chat,
    colourPalette,
    socket,
    roomID,
  },
});
