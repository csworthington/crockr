export interface UpdateMessage {
  msgType : 'Selection' | 'Deselection' | 'Addition' | 'Deletion' | 'Clearing' | 'Modified' | 'Loading' | 'LocalLoad' | 'roomUpdate' | 'Leaving' | 'TA' | 'EndRoom' | 'toggleEdit' | 'Kicked'|'Editing';
  userID: string;
  roomID: string;
  msg : string;
}
