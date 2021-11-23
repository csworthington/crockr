/* eslint-disable no-shadow */
import { Commit } from 'vuex';

enum ChatStoreActions {
  AddMessage = 'ADD_MESSAGE',
  DeleteMessage = 'DELETE_MESSAGE',
  SetConnection = 'SET_CONNECTION',
  SetError = 'SET_ERROR',
}

interface ChatMessage {
  id: string;
  timestamp: string;
  message: string;
}

export interface ChatMessagesState {
  connected: boolean;
  error: null | string;
  chatMessages: ChatMessage[];
  limit: number;
}

const state: ChatMessagesState = {
  connected: false,
  error: null,
  chatMessages: [],
  limit: 5,
};

const getters = {
  displayMessages: (state: ChatMessagesState): ChatMessage[] => state.chatMessages,
};

const actions = {
  addMessage({ commit }: {commit: Commit}, message: ChatMessage): void {
    commit(ChatStoreActions.AddMessage, message);
  },
  deleteMessage({ commit }: {commit: Commit}, message: ChatMessage): void {
    commit(ChatStoreActions.DeleteMessage, message);
  },
  connectionOpened({ commit }: {commit: Commit}): void {
    commit(ChatStoreActions.SetConnection, true);
  },
  connectionClosed({ commit }: {commit: Commit}): void {
    commit(ChatStoreActions.SetConnection, false);
  },
  connectionError({ commit }: {commit: Commit}, error: null | string): void {
    commit(ChatStoreActions.SetError, error);
  },
};

const mutations = {
  ADD_MESSAGE(state: ChatMessagesState, message: ChatMessage): void {
    while (state.chatMessages.length >= state.limit) {
      state.chatMessages.shift();
    }
    state.chatMessages.push(message);
  },
  DELETE_MESSAGE(state: ChatMessagesState, message: ChatMessage): void {
    state.chatMessages = state.chatMessages.filter((m) => m.id !== message.id);
  },
  SET_CONNECTION(state: ChatMessagesState, message: boolean): void {
    state.connected = message;
  },
  SET_ERROR(state: ChatMessagesState, error: null | string): void {
    state.error = error;
  },
};

export const chat = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
