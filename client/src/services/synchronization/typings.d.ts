export interface UpdateMessage {
  msgType : 'Selection' | 'Deselection' | 'Addition' | 'Deletion' | 'Clearing' | 'Modified' | 'Loading' | 'LocalLoad' | 'roomUpdate' | 'Leaving' | 'TA' | 'EndRoom';
  userID: string;
  roomID: string;
  msg : string;
}
