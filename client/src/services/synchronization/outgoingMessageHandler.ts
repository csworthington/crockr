import { fabric } from 'fabric';
import { store } from '@/store/index';
import { UpdateMessage } from './typings.d';

/**
 * Send an outgoing synchronization message to the server
 * @param msg Message to be sent to the server
 */
export function updateServer(msg : UpdateMessage): void {
  const socket = store.state.socket.socketInstance;
  socket.send(JSON.stringify(msg));
}

/**
 * Send a selection message to the server
 * @param canvas Fabric Canvas instance
 * @param selectedObjects Array of UUID's of selected objects
 */
export function sendObjectSelected(
  canvas: fabric.Canvas,
  selectedObjects: Array<string>,
): void {
  const selectedIds:(string)[] = [];
  console.log('send selection update');

  canvas.getActiveObjects().forEach((active: any) => {
    if (selectedObjects.indexOf(active.get('id')) === -1) {
      selectedObjects.push(active.get('id'));
    }
  });

  canvas.getActiveObjects().forEach((element : fabric.ObjectWithID) => {
    selectedIds.push(<string>element.get('id'));
  });

  updateServer({
    msgType: 'Selection',
    msg: JSON.stringify(selectedIds),
  });

  console.log(selectedObjects.length);
}

/**
 * Send an object selection update message to the server
 * @param {fabric.Canvas} canvas Fabric Canvas Instance
 * @param {string[]} selectedObjects Array of UUID's of selected objects
 */
export function sendObjectSelectionUpdated(
  canvas: fabric.Canvas,
  selectedObjects: Array<string>,
): void {
  const selectedIds:(string)[] = [];
  // Send selection updated synchronization message to the server
  console.log('updated');
  canvas.getActiveObjects().forEach((active: any) => {
    if (selectedObjects.indexOf(active.get('id')) === -1) {
      selectedObjects.push(active.get('id'));
    }
  });

  canvas.getActiveObjects().forEach((element : fabric.ObjectWithID) => {
    selectedObjects.push(<string>element.get('id'));
  });
  const selectionUpdate : UpdateMessage = { msgType: 'Selection', msg: JSON.stringify(selectedIds) };
  updateServer(selectionUpdate);
  const activeObjectIDS : string[] = [];
  canvas.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
    activeObjectIDS.push(active.get('id')!);
  });

  // Send selection cleared message
  const deselectedId = selectedObjects.filter((x) => !activeObjectIDS.includes(x));
  console.log('send selection cleared update');
  const deselectMsg :UpdateMessage = { msgType: 'Deselection', msg: JSON.stringify(deselectedId) };
  console.log(canvas.getActiveObjects());
  console.log(deselectMsg);
  updateServer(deselectMsg);
}

/**
 * Send an object selection cleared message to the server
 * @param {fabric.Canvas} canvas Fabric Canvas Instance
 * @param {string[]} selectedObjects Array of UUID's of selected objects
 */
export function sendObjectSelectionCleared(
  canvas: fabric.Canvas,
  selectedObjects: Array<string>,
): void {
  const activeObjectIDS : string[] = [];
  // Send selection cleared message
  console.log('selectedCheck');
  console.dir(selectedObjects);

  canvas.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
    activeObjectIDS.push(active.get('id')!);
  });

  const deselectedId = selectedObjects.filter((x) => !activeObjectIDS.includes(x));
  console.log('send selection cleared update');

  const deselectMsg :UpdateMessage = { msgType: 'Deselection', msg: JSON.stringify(deselectedId) };
  console.log(canvas.getActiveObjects());
  console.log(deselectMsg);
  updateServer(deselectMsg);
}
