/* eslint-disable no-param-reassign */
export interface userState {
    ID:string;
    roomID:string;
    canEdit:boolean;
    roomEdit:boolean;
    Ta:boolean;
    roomName: string,
  }
const state: userState = {
  ID: '-1',
  roomID: '-1',
  canEdit: true,
  roomEdit: true,
  Ta: false,
  roomName: 'Unset',
};
const mutations = {
  updateID(currentUserState : userState, newUserID : string): void {
    state.ID = newUserID;
  },
  updateRoomID(currentUserState : userState, newUserID : string): void {
    state.roomID = newUserID;
  },
  updateCanEdit(currentUserState : userState, newUserID : boolean): void {
    state.canEdit = newUserID;
  },
  updateTa(currentUserState : userState, newUserID : boolean): void {
    state.Ta = newUserID;
  },
  updateRoomEdit(currentUserState : userState, newUserID : boolean): void {
    state.roomEdit = newUserID;
  },
  updateRoomName(currentUserState : userState, newUserID : string): void {
    state.roomName = newUserID;
  },
};
export const userID = {
  namespaced: true,
  state,
  mutations,
};
