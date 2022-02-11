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

export function sendObjectModified(
  canvas: fabric.Canvas,
): void {
  const scaledObjects: string[]| any[] = [[], []];
  const scaledIds : string[] = [];
  const objectArray : fabric.ObjectWithID[] = [];

  canvas.getActiveObjects().forEach((element: fabric.ObjectWithID) => {
    scaledIds.push(element.get('id')!);
  });

  canvas.discardActiveObject().renderAll();
  scaledIds.forEach((id : string) => {
    canvas.getObjects().forEach((element: fabric.ObjectWithID) => {
      if (element.get('id') === id) {
        scaledObjects[0].push(id);
        scaledObjects[1].push(JSON.stringify(element));
        objectArray.push(element);
      }
    });
  });

  // eslint-disable-next-line max-len
  const selectionGroup : fabric.ActiveSelection = new fabric.ActiveSelection(objectArray, { canvas });
  canvas.setActiveObject(selectionGroup);
  canvas.renderAll();

  const movingMessage : UpdateMessage = {
    msgType: 'Modified',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(scaledObjects),
  };
  updateServer(movingMessage);
}

export function sendObjectAdded(canvas: fabric.Canvas): void {
  const addedObject: fabric.ObjectWithID = canvas.getObjects()[canvas.getObjects().length - 1];
  const addedId = addedObject.get('id');
  const addMsg : UpdateMessage = {
    msgType: 'Addition',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify([addedId, JSON.stringify(addedObject)]),
  };
  updateServer(addMsg);
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
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(selectedIds),
  });
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
  canvas.getActiveObjects().forEach((active: any) => {
    if (selectedObjects.indexOf(active.get('id')) === -1) {
      selectedObjects.push(active.get('id'));
    }
  });

  canvas.getActiveObjects().forEach((element : fabric.ObjectWithID) => {
    selectedObjects.push(<string>element.get('id'));
  });
  const selectionUpdate : UpdateMessage = {
    msgType: 'Selection',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(selectedIds),
  };
  updateServer(selectionUpdate);
  const activeObjectIDS : string[] = [];
  canvas.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
    activeObjectIDS.push(active.get('id')!);
  });

  // Send selection cleared message
  const deselectedId = selectedObjects.filter((x) => !activeObjectIDS.includes(x));
  const deselectMsg : UpdateMessage = {
    msgType: 'Deselection',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(deselectedId),
  };
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
  canvas.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
    activeObjectIDS.push(active.get('id')!);
  });

  const deselectedId = selectedObjects.filter((x) => !activeObjectIDS.includes(x));

  const deselectMsg : UpdateMessage = {
    msgType: 'Deselection',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(deselectedId),
  };
  updateServer(deselectMsg);
}

export function sendObjectDeleted(
  canvas: fabric.Canvas,
): void {
  const deletionIDs :string[] = [];
  const objectList = canvas.getActiveObjects();
  objectList.forEach((object : fabric.ObjectWithID) => {
    deletionIDs.push(<string>object.get('id'));
    canvas.remove(object);
  });
  const deleteMsg : UpdateMessage = {
    msgType: 'Deletion',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(deletionIDs),
  };
  updateServer(deleteMsg);
}

export function sendClearBoardMessage(canvas: fabric.Canvas): void {
  canvas.clear();
  // Send clear message to the server
  const clearMsg : UpdateMessage = {
    msgType: 'Clearing',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(''),
  };
  updateServer(clearMsg);
}

export function sendLoadCanvasMessage(): void {
  // Send load message to the server
  const loadMsg : UpdateMessage = {
    msgType: 'Loading',
    roomID: store.state.roomID.ID,
    msg: '',
  };
  updateServer(loadMsg);
}

export function sendLocalLoadMessage(canvas: fabric.Canvas): void {
  const loadedObjects: string[]|any[] = [[], []];
  canvas.getObjects().forEach((element: fabric.ObjectWithID) => {
    loadedObjects[0].push(element.get('id'));
    loadedObjects[1].push(JSON.stringify(element));
  });
  const loadMsg : UpdateMessage = {
    msgType: 'LocalLoad',
    roomID: store.state.roomID.ID,
    msg: JSON.stringify(loadedObjects),
  };
  updateServer(loadMsg);
}
