/* eslint-disable no-param-reassign */
export interface userState {
    ID:string;
    roomID:string;
    canEdit:boolean;
  }
const state: userState = {
  ID: '-1',
  roomID: '-1',
  canEdit: false,
};
const mutations = {
  updateID(currentUserState : userState, newUserID : string): void {
    state.ID = newUserID;
  },
  updateRoomID(currentUserState : userState, newUserID : string): void {
    state.roomID = newUserID;
  },
};
export const userID = {
  namespaced: true,
  state,
  mutations,
};
