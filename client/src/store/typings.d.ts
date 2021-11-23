import { SocketState } from './modules/socket';

export interface State {
  chat: ChatMessagesState
  colourPalette: ColourPaletteState
  socket: SocketState
}
