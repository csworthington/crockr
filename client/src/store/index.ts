import { InjectionKey } from 'vue';
import { createStore, Store } from 'vuex';

import { chat, ChatMessagesState } from '@/store/modules/chat';
import { colourPalette, ColourPaletteState } from '@/store/modules/colourPalette';

export interface State {
  chat: ChatMessagesState
  colourPalette: ColourPaletteState
}

export const key: InjectionKey<Store<State>> = Symbol('state key');

export const store = createStore<State>({
  modules: {
    chat,
    colourPalette,
  },
});
