export interface UpdateMessage {
  msgType : 'Selection' | 'Deselection' | 'Addition' | 'Deletion' | 'Clearing' | 'Modified' | 'Loading' | 'LocalLoad' | 'roomUpdate' | 'Leaving';
  roomID: string;
  msg : string;
}
