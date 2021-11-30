import { InjectionKey } from 'vue';
import { Axios } from 'axios';

// eslint-disable-next-line import/prefer-default-export
export const axiosInjectionKey: InjectionKey<Axios> = Symbol('');
