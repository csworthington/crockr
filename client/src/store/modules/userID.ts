/* eslint-disable no-param-reassign */
export interface userState {
    ID:string;
  }
const state: userState = {
  ID: '-1',
};
const mutations = {
  updateID(currentUserState : userState, newUserID : string): void {
    state.ID = newUserID;
  },
};
export const userID = {
  namespaced: true,
  state,
  mutations,
};
