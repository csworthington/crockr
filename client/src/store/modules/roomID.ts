/* eslint-disable no-param-reassign */
export interface roomState {
    ID:string;
  }
const state: roomState = {
  ID: '-1',
};
const mutations = {
  updateID(currentRoomState : roomState, newRoomID : string): void {
    state.ID = newRoomID;
  },
};
export const roomID = {
  namespaced: true,
  state,
  mutations,
};
