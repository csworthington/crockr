/* eslint-disable no-shadow */
import { Commit } from 'vuex';

enum ChatStoreActions {
  AddMessage = 'ADD_MESSAGE',
  DeleteMessage = 'DELETE_MESSAGE'
}

interface ChatMessage {
  id: string;
  timestamp: string;
  message: string;
}

export interface ChatMessagesState {
  chatMessages: ChatMessage[];
  limit: number;
}

const state: ChatMessagesState = {
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
};

export const chat = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
