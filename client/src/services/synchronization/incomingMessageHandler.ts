import { fabric } from 'fabric';
import { ShapesWithID } from '@/utils/addCustomFabricObjects';
import { UpdateMessage } from './typings.d';

/**
 * Handle an incoming object addition message
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {Array<string>} objectToAdd String array, where parsedMessage[0] is the object UUID,
 * and parsedMessage[1] is the serialized object
 */
function handleAddition(
  canvas: fabric.Canvas,
  objectToAdd: Array<string>,
): void {
  const parsedObject = new fabric.ObjectWithID(JSON.parse(objectToAdd[1]));
  let objToAdd: fabric.Object = parsedObject;

  switch (parsedObject.get('type')) {
    case ShapesWithID.rect: {
      objToAdd = new fabric.RectWithID(JSON.parse(objectToAdd[1]));
      break;
    }
    case ShapesWithID.circle: {
      objToAdd = new fabric.CircleWithID(JSON.parse(objectToAdd[1]));
      break;
    }
    case ShapesWithID.line: {
      const tempObject = JSON.parse(objectToAdd[1]);
      const points = [tempObject.x1, tempObject.y1, tempObject.x2, tempObject.y2];
      objToAdd = new fabric.LineWithID(points, JSON.parse(objectToAdd[1]));
      break;
    }
    case ShapesWithID.path: {
      const tempObject = JSON.parse(objectToAdd[1]);
      objToAdd = new fabric.PathWithID(tempObject.path, tempObject);
      break;
    }
    case ShapesWithID.image: {
      const tempObject: fabric.IImageWithIDOptions = JSON.parse(objectToAdd[1]);
      if (tempObject !== undefined && tempObject.src !== undefined) {
        const imgStr = tempObject.src;
        if (imgStr) {
          fabric.ImageWithID.fromURL(
            imgStr,
            (image) => {
              canvas.add(image);
              image.setCoords();
              canvas.renderAll();
            },
            tempObject,
          );
        }
      } else {
        throw new Error(`Image object or src string is undefined, object = ${tempObject}`);
      }
      break;
    }
    default: {
      objToAdd = new fabric.ObjectWithID(JSON.parse(objectToAdd[1]));
    }
  }
  if (parsedObject.get('type') !== ShapesWithID.image) {
    canvas.add(objToAdd);
    objToAdd.setCoords();
  }
  canvas.renderAll();
}

/**
 * Handle an incoming object deletion message
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {Array<string>} deletionUUIDs Array of object UUID's to be deleted
 */
function handleDeletion(canvas: fabric.Canvas, deletionUUIDs: Array<string>): void {
  deletionUUIDs.forEach((ID : string) => {
    canvas.getObjects().forEach((object : fabric.ObjectWithID) => {
      if (object.get('id') === ID) {
        canvas.remove(object);
      }
    });
  });
}

/**
 * Handle an incoming object modified message
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {Array<Array<string>>} objectsToModify An array of objects, where each value is an array
 * where [0] is the object UUID, and [1] is the serialized object
 */
function handleModified(
  canvas: fabric.Canvas,
  objectsToModify: Array<Array<string>>,
): void {
  objectsToModify[1].forEach((element : string) => {
    const scaledCanvasObject = new fabric.ObjectWithID(JSON.parse(element));

    canvas.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
      if (canvasObject.get('id') === scaledCanvasObject.get('id')) {
        canvasObject.set({
          scaleX: scaledCanvasObject.get('scaleX'),
          scaleY: scaledCanvasObject.get('scaleY'),
          top: scaledCanvasObject.get('top'),
          left: scaledCanvasObject.get('left'),
          angle: scaledCanvasObject.get('angle'),
          skewX: scaledCanvasObject.get('skewX'),
          skewY: scaledCanvasObject.get('skewY'),
        });
        canvasObject.setCoords();
      }
    });
  });
  canvas.renderAll();
}

/**
 * Handle an incoming object selection message
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {Array<string} selectedObjectUUIDs Array of UUID's of selected objects
 */
function handleSelection(
  canvas: fabric.Canvas,
  selectedObjectUUIDs: Array<string>,
): void {
  selectedObjectUUIDs.forEach((id : string) => {
    canvas.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
      if (canvasObject.get('id') === id) {
        canvasObject.set({
          selectable: false,
          evented: false,
          opacity: 0.5,
        });
      }
    });
  });
  canvas.renderAll();
}

/**
 * Handle an incoming object selection message
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {Array<string} deselectedObjectUUIDs Array of UUID's of deselected objects
 */
function handleDeselection(
  canvas: fabric.Canvas,
  deselectedObjectUUIDs: Array<string>,
): void {
  deselectedObjectUUIDs.forEach((id : string) => {
    canvas.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
      if (canvasObject.get('id') === id) {
        canvasObject.set({
          selectable: true,
          evented: true,
          opacity: 1,

        });
      }
    });
  });
  canvas.renderAll();
}

/**
 * Handle an incoming loading message from the server
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {fabric.Canvas} serializedObjects Array of serialized fabric objects
 */
function handleLoading(
  canvas: fabric.Canvas,
  serializedObjects: Array<string>,
): void {
  canvas.clear();
  serializedObjects.forEach((element : string) => {
    // const object = new fabric.ObjectWithID(JSON.parse(element));
    const parsedObject: fabric.IObjectWithIDOptions = JSON.parse(element);
    // switch (object.get('type')) {
    switch (parsedObject.type) {
      case ShapesWithID.rect: {
        canvas.add(new fabric.RectWithID(JSON.parse(element)));
        break;
      }
      case ShapesWithID.circle: {
        canvas.add(new fabric.CircleWithID(JSON.parse(element)));
        break;
      }
      case ShapesWithID.line: {
        const tempObject = JSON.parse(element);
        const points = [tempObject.x1, tempObject.y1, tempObject.x2, tempObject.y2];
        canvas.add(new fabric.LineWithID(points, tempObject));
        break;
      }
      case ShapesWithID.path: {
        const tempObject = JSON.parse(element);
        canvas.add(new fabric.PathWithID(tempObject.path, tempObject));
        break;
      }
      case ShapesWithID.image: {
        const tempObject: fabric.IImageWithIDOptions = parsedObject;
        if (tempObject && tempObject.src !== undefined) {
          const imgStr = tempObject.src;
          if (imgStr) {
            const newImg = fabric.ImageWithID.fromURL(
              imgStr,
              (image) => {
                canvas.add(image);
                image.setCoords();
              },
              tempObject,
            );
          }
        }
        break;
      }
      default: {
        console.error(`Parsed object type is unknown, type = ${parsedObject.type}`);
      }
    }
  });
}

/**
 * Handle an incoming synchronization message from the server
 * @param {fabric.Canvas} canvas Fabric canvas instance
 * @param {MessageEvent} message Incoming websocket message from the server
 */
export default function receiveMessage(
  canvas: fabric.Canvas,
  message: MessageEvent,
): void {
  const messageData : UpdateMessage = JSON.parse(message.data);

  switch (messageData.msgType) {
    case 'Addition': {
      const addedObject: Array<string> = JSON.parse(messageData.msg);
      handleAddition(canvas, addedObject);
      break;
    }
    case 'Deletion': {
      const deletedObjectUUIDs: Array<string> = JSON.parse(messageData.msg);
      handleDeletion(canvas, deletedObjectUUIDs);
      break;
    }
    case 'Clearing': {
      canvas.clear();
      break;
    }
    case 'Modified': {
      const modifiedObjects: Array<Array<string>> = JSON.parse(messageData.msg);
      handleModified(canvas, modifiedObjects);
      break;
    }
    case 'Selection': {
      const selectedObjectUUIDs: Array<string> = JSON.parse(messageData.msg);
      handleSelection(canvas, selectedObjectUUIDs);
      break;
    }
    case 'Deselection': {
      const deselctedObjectUUIDs: Array<string> = JSON.parse(messageData.msg);
      handleDeselection(canvas, deselctedObjectUUIDs);
      break;
    }
    case 'Loading': {
      const serializedObjects: Array<string> = JSON.parse(messageData.msg);
      handleLoading(canvas, serializedObjects);
      break;
    }
    default: {
      console.warn(`Unknown message type for incoming message, type = "${messageData.msgType}"`);
    }
  }
}
