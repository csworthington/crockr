import { inject } from 'vue';
import { Axios } from 'axios';
import { axiosInjectionKey } from '@/symbols';

// eslint-disable-next-line import/prefer-default-export
export const useAxios = (): Axios => {
  const axios = inject(axiosInjectionKey);
  if (axios) {
    return axios;
  }
  throw new Error('No global Axios object provided!');
};
