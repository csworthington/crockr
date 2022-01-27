export interface UpdateMessage {
  msgType : 'Selection' | 'Deselection' | 'Addition' | 'Deletion' | 'Clearing' | 'Modified' | 'Loading' | 'LocalLoad';
  msg : string;
}
