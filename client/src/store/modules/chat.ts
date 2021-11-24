/* eslint-disable no-param-reassign */
import { Commit } from 'vuex';

export enum ChatStoreActions {
  AddMessage = 'ADD_MESSAGE',
  DeleteMessage = 'DELETE_MESSAGE',
  SetConnection = 'SET_CONNECTION',
  SetError = 'SET_ERROR',
}

export interface ChatMessage {
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
  displayMessages: (chatState: ChatMessagesState): ChatMessage[] => chatState.chatMessages,
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
  ADD_MESSAGE(chatstate: ChatMessagesState, message: ChatMessage): void {
    while (chatstate.chatMessages.length >= chatstate.limit) {
      chatstate.chatMessages.shift();
    }
    chatstate.chatMessages.push(message);
  },
  DELETE_MESSAGE(chatState: ChatMessagesState, message: ChatMessage): void {
    chatState.chatMessages = chatState.chatMessages.filter((m) => m.id !== message.id);
  },
  SET_CONNECTION(chatState: ChatMessagesState, message: boolean): void {
    chatState.connected = message;
  },
  SET_ERROR(chatState: ChatMessagesState, error: null | string): void {
    chatState.error = error;
  },
};

export const chat = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
