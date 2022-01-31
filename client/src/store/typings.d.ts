import { roomState } from './modules/roomID';
import { SocketState } from './modules/socket';

export interface State {
  roomID: roomState;
  chat: ChatMessagesState
  colourPalette: ColourPaletteState
  socket: SocketState
}
