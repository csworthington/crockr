import { roomState } from './modules/roomID';
import { SocketState } from './modules/socket';
import { userState } from './modules/userID';

export interface State {
  roomID: roomState
  userID: userState
  chat: ChatMessagesState
  colourPalette: ColourPaletteState
  socket: SocketState
}
