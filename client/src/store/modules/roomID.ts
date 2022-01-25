/* eslint-disable no-param-reassign */
export interface roomState {
    ID:string;
  }
const state: roomState = {
  ID: '-1',
};
const mutation = {
  updateID(currentRoomState : roomState, newRoomID : string) {
    state.ID = newRoomID;
  },
};
export const roomID = {
  namespaced: true,
  state,
  mutation,
};
