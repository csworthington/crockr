import { InjectionKey } from 'vue';
import { Axios } from 'axios';
import { Store } from 'vuex';
import { State } from '@/store/typings.d';

const STORE_KEY_TEXT = 'STORE_KEY';
const SOCKET_KEY_TEXT = 'SOCKET_KEY';

export const StoreKey: InjectionKey<Store<State>> = Symbol(STORE_KEY_TEXT);
export const SocketKey: InjectionKey<WebSocket> = Symbol(SOCKET_KEY_TEXT);


// eslint-disable-next-line import/prefer-default-export
export const axiosInjectionKey: InjectionKey<Axios> = Symbol('');
