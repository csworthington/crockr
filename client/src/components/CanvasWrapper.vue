<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span>
      <ColourPicker />
    </span>
    <span><button @click="handleToolChange('PEN')">Pen tool toggle</button></span>
    <span><button @click="handleToolChange('RECTANGLE')"> Rectangle </button></span>
    <span><button @click="handleToolChange('CIRCLE')"> Circle </button></span>
    <span><button @click="handleToolChange('SELECT')"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="handleToolChange('LINE')"> Line Tool </button></span>
    <span><button @click="printCanvasToConsole"> Print Canvas </button></span>
    <span><button @click="sendCanvasToServer">Send Canvas</button></span>
    <span><button @click="getDogFromServer">Get Dog🐶</button></span>
    <span><button @click="getLineFromServer">Get Line</button></span>
    <span><button @click="getRectFromServer">Get Rect</button></span>
    <span><button @click="getCircleFromServer">Get circle</button></span>
    <span>
      <select name="thick" v-model="lineThickness">
        <option v-for="option in thicknessOptions"
                :key="option.value"
                :value="option.value">
          {{ option.text }}
        </option>
      </select>
    </span>
  </div>
  <div>
    <span>current tool = {{ tool }}</span>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-shadow */
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
  watch,
  WritableComputedRef,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue';
import { useStore } from 'vuex';
import { fabric } from 'fabric';

// import { Object } from 'fabric/fabric-impl';
import { StoreKey } from '@/symbols';
import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';
import {
  // RectWithID,
  CircleWithID,
  LineWithID,
  ObjectWithID,
} from '@/utils/fabric-object-extender';
import getUUID from '@/utils/id-generator';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
// import { Group } from 'fabric/fabric-impl';

enum ToolType {
  None = 'NONE',
  Select = 'SELECT',
  Rectangle = 'RECTANGLE',
  Line = 'LINE',
  Circle = 'CIRCLE',
  Pen = 'PEN',
}

export default defineComponent({
  name: 'CanvasWrapper',
  components: {
    ColourPicker,
  },
  setup(props) {
    const store = useStore(StoreKey);

    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    canvasData.perPixelTargetFind = true;
    canvasData.targetFindTolerance = 8;
    // line object that is modified after first coord is placed.
    let line : fabric.Line;
    // stores the first coord when line tool is active
    let lineToollTFirstCoordPlaced:number[];
    let rect: fabric.Object;
    let circ: fabric.Circle;
    let isDown: boolean;
    let origX: number;
    let origY: number;
    const tool = ref(ToolType.None);
    let radius: number;
    let strokeWidth: any;
    let isObjectModified = false;
    let isObjectBeingAdded = false;
    let isPenDown = false;
    // comparison array for comparing when deselected.
    const selectedCheck: (string)[] = [];
    const socket = useGlobalWebSocket();
    interface updateMsg{
      msgType : string;
      msg : string;
    }
    const updateServer = (msg : updateMsg) => {
      socket.send(JSON.stringify(msg));
    };
    // determines how thick line tool and pen tool are
    const lineThickness: Ref<number> = ref(2);
    const thicknessOptions = [
      { text: '2px', value: 2 },
      { text: '5px', value: 5 },
      { text: '8px', value: 8 },
      { text: '20px', value: 20 },
    ];
    const canvasRatio = (16 / 6); // Aspect ratio of the canvas. Currently 16:6

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.colourPalette.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('colourPalette/updatePrimaryToolColour', newValue);
      },
    });

    /**
     * Start drawing a line on the canvas when the line tool is selected and the
     * mouse:down event has been fired by the canvas
     */
    function lineMouseDown() {
      lineToollTFirstCoordPlaced = [origX, origY];
      const width = lineThickness.value;

      line = new LineWithID(
        [
          lineToollTFirstCoordPlaced[0],
          lineToollTFirstCoordPlaced[1],
          origX,
          origY,
        ],
        {
          stroke: store.state.colourPalette.primaryToolColour,
          strokeWidth: width,
          opacity: 0.5,
          strokeUniform: true,
          padding: 5,
        },
      );
      canvasData.add(line);
      // first coord already place so finalize line

      line.set({ x2: origX, y2: origY, opacity: 1 });
      line.setCoords();
      canvasData.renderAll();
    }

    /**
     * Place a rectangle on the canvas when the rectangle tool is selected and
     * the mouse:down event has been fired by the canvas
     */
    function rectangleDown(x : number, y : number) {
      rect = new fabric.RectWithID({
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: x - origX,
        height: y - origY,
        angle: 0,
        fill: store.state.colourPalette.primaryToolColour,
        strokeWidth: 2,
        stroke: store.state.colourPalette.primaryToolColour,
        transparentCorners: false,
      });
      canvasData.add(rect);
    }

    /**
     * Place a circle on the canvas when the circle tool is selected and
     * the mouse:down event has been fired by the canvas
     */
    function circleDown(x : number, y : number) {
      circ = new CircleWithID({
        left: x,
        top: y,
        radius: 1,
        strokeWidth: 2,
        stroke: store.state.colourPalette.primaryToolColour,
        fill: store.state.colourPalette.primaryToolColour,
        originX: 'center',
        originY: 'center',
      });
      strokeWidth = circ.strokeWidth;
      canvasData.add(circ);
    }

    /**
     * Move one end of the line when the first part of the line has been placed down and
     * the mouse:move event has been fired by the canvas
     */
    function lineMove(x : number, y : number) {
      line.set({ x2: x, y2: y });
      canvasData.renderAll();
      line.setCoords();
    }

    /**
     * Redraw the rectangle on the canvas when the mouse is being moved
     */
    function rectangleMove(x : number, y : number) {
      if (origX > x) {
        rect.set({ left: Math.abs(x) });
      }
      if (origY > y) {
        rect.set({ top: Math.abs(y) });
      }

      rect.set({ width: Math.abs(origX - x) });
      rect.set({ height: Math.abs(origY - y) });
      rect.setCoords();
      canvasData.renderAll();
    }

    /**
     * Redraw the circle on the canvas when the mouse is being moved
     */
    function circleMove(x : number, y : number) {
      if (radius > strokeWidth) {
        radius -= strokeWidth / 2;
      }
      circ.setRadius(radius);
      if (origX > x) {
        circ.set({ originX: 'right' });
      } else {
        circ.set({ originX: 'left' });
      }
      if (origY > y) {
        circ.set({ originY: 'bottom' });
      } else {
        circ.set({ originY: 'top' });
      }
      circ.setCoords();
      canvasData.renderAll();
    }

    /**
     * Primary event handler for fabric.js canvas mouse:down event
     * @param {fabric.IEvent<MouseEvent>} evt: Event fired by canvas
     */
    function handleMouseDownEvent(evt: fabric.IEvent<Event>) {
      isDown = true;
      const pointer = canvasData.getPointer(evt.e);
      origX = pointer.x;
      origY = pointer.y;

      if (tool.value === ToolType.Rectangle) {
        isObjectBeingAdded = true;
        rectangleDown(pointer.x, pointer.y);
      } else if (tool.value === ToolType.Circle) {
        isObjectBeingAdded = true;
        circleDown(pointer.x, pointer.y);
        // case line tool is selected
      } else if (tool.value === ToolType.Line) {
        isObjectBeingAdded = true;
        // if first coord not placed, set it and start drawing line to mouse
        lineMouseDown();
      } else if (tool.value === ToolType.Pen) {
        isObjectBeingAdded = true;
        isPenDown = true;
      }
    }

    /**
     * Primary event handler for fabric.js canvas mouse:move event
     * @param {fabric.IEvent<MouseEvent>} evt: Event fired by canvas
     */
    function handleMouseMoveEvent(evt: fabric.IEvent<Event>) {
      if (!isDown) {
        return;
      }

      const pointer = canvasData.getPointer(evt.e);
      radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;

      if (tool.value === ToolType.Rectangle) {
        rectangleMove(pointer.x, pointer.y);
      } else if (tool.value === ToolType.Circle) {
        circleMove(pointer.x, pointer.y);
        // line tool handler, makes line follow mouse
      } else if (tool.value === ToolType.Line) {
        lineMove(pointer.x, pointer.y);
      }
    }

    /**
     * Primary event handler for fabric.js canvas mouse:up event
     * @param {fabric.IEvent<MouseEvent>} evt: Event fired by canvas
     */
    function handleMouseUpEvent(evt: fabric.IEvent<Event>) {
      isDown = false;
      let movingMsg :updateMsg;
      if (isObjectModified) {
        isObjectModified = false;
        const scaledObjects: string[]|any[] = [[], []];
        const scaledIds : string[] = [];
        canvasData.getActiveObjects().forEach((element: fabric.ObjectWithID) => {
          scaledIds.push(element.get('id')!);
        });
        const objectArray : fabric.ObjectWithID[] = [];
        canvasData.discardActiveObject().renderAll();
        scaledIds.forEach((id : string) => {
          canvasData.getObjects().forEach((element: fabric.ObjectWithID) => {
            if (element.get('id') === id) {
              scaledObjects[0].push(id);
              scaledObjects[1].push(JSON.stringify(element));
              objectArray.push(element);
            }
          });
        });
        // eslint-disable-next-line max-len
        const selectionGroup : fabric.ActiveSelection = new fabric.ActiveSelection(objectArray, { canvas: canvasData });
        canvasData.setActiveObject(selectionGroup);
        canvasData.renderAll();
        movingMsg = { msgType: 'Modified', msg: JSON.stringify(scaledObjects) };
        updateServer(movingMsg);
      } else if (isPenDown) {
        isPenDown = false;
        console.log('send pen event');
      } else if (isObjectBeingAdded) {
        isObjectBeingAdded = false;
        console.log('send real add  event');
        // eslint-disable-next-line max-len
        const addedObject: fabric.ObjectWithID = canvasData.getObjects()[canvasData.getObjects().length - 1];
        const addedId = addedObject.get('id');
        const addMsg :updateMsg = { msgType: 'Addition', msg: JSON.stringify([addedId, JSON.stringify(addedObject)]) };
        updateServer(addMsg);
      }
    }

    /**
     * Disable all custom event handlers for the fabric.js canvas
     */
    function mouseEventsOff() {
      canvasData.off('mouse:down', handleMouseDownEvent);
      canvasData.off('mouse:move', handleMouseMoveEvent);
      canvasData.off('mouse:up', handleMouseUpEvent);
    }

    /**
     * Enable all custom event handlers for the fabric.js canvas
     */
    function mouseEventsOn() {
      canvasData.on('mouse:down', handleMouseDownEvent);
      canvasData.on('mouse:move', handleMouseMoveEvent);
      canvasData.on('mouse:up', handleMouseUpEvent);
    }

    /**
     * Change the freeDrawingBrush width whenever lineThickness is changed.
     * Needed for changing the thickness of the brush when the pen tool is
     * active
     */
    watch(() => lineThickness.value, (currentValue: number) => {
      canvasData.freeDrawingBrush.width = currentValue;
    });

    /**
     * Watch for changes to primaryColour, and change brush colour when primaryColour changes
     */
    watch(primaryColour, (currentValue: string) => {
      canvasData.freeDrawingBrush.color = currentValue;
    });

    /**
     * Watch for change in tool type.
     * Enable object selection when select tool is active, disable otherwise
     * Enable drawing mode on canvas when pen tool is active, disable otherwise
     */
    watch(() => tool.value, (currentValue: ToolType) => {
      if (currentValue !== ToolType.Pen) {
        canvasData.isDrawingMode = false;
      }
      if (currentValue === ToolType.Select) {
        canvasData.selection = true;
        canvasData.skipTargetFind = false;
      } else {
        canvasData.selection = false;
        canvasData.skipTargetFind = true;
      }
    });

    /**
     * Handle when a user selects a new tool
     */
    function handleToolChange(clickedTool : ToolType) {
      mouseEventsOff();
      mouseEventsOn();
      canvasData.isDrawingMode = false;
      switch (clickedTool) {
        case ToolType.Pen: {
          tool.value = ToolType.Pen;
          canvasData.isDrawingMode = true;
          canvasData.freeDrawingBrush.color = primaryColour.value;
          canvasData.freeDrawingBrush.width = lineThickness.value;
          break;
        }
        case ToolType.Rectangle: {
          tool.value = ToolType.Rectangle;
          break;
        }
        case ToolType.Circle: {
          tool.value = ToolType.Circle;
          break;
        }
        case ToolType.Select: {
          tool.value = ToolType.Select;
          break;
        }
        case ToolType.Line: {
          tool.value = ToolType.Line;
          break;
        }
        default: {
          tool.value = ToolType.None;
          break;
        }
      }
    }

    /**
     * Delete a specific object when the user presses the delete button
     */
    const deleteSelected = () => {
      const deletionIDs :string[] = [];
      const objectList : typeof ObjectWithID = canvasData.getActiveObjects();
      objectList.forEach((object : typeof ObjectWithID) => {
        deletionIDs.push(object.get('id'));
        canvasData.remove(object);
      });
      const elem = document.getElementById('deleteBtn');
      if (elem != null) {
        elem.remove();
      }
      const deleteMsg :updateMsg = { msgType: 'Deletion', msg: JSON.stringify(deletionIDs) };
      updateServer(deleteMsg);
      console.log('send delete update');
    };

    /**
     * Clear the canvas of all objects when the user selects the clear button
     */
    const clearBoard = () => {
      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvasData.clear();
        const clearMsg :updateMsg = { msgType: 'Clearing', msg: JSON.stringify('') };
        updateServer(clearMsg);
        console.log('send  clear update.');
      }
    };

    /**
     * Initialize the Fabric.js canvas
     */
    const initFabricCanvas = () => {
      // Get width for new canvas from wrapper div and set it when creating new canvas
      // Note: this is not responsive and will not resize canvas element when page is resized
      const canvasDiv: HTMLDivElement = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));

      canvasData = new fabric.Canvas('main-canvas', {
        width: canvasDiv.clientWidth,
        height: canvasDiv.clientWidth / canvasRatio,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
      });
      // Set Drawing mode
      canvasData.isDrawingMode = false;
      canvasData.on('selection:created', () => {
        console.log('send selection update');

        canvasData.getActiveObjects().forEach((active: any) => {
          if (selectedCheck.indexOf(active.get('id')) === -1) {
            selectedCheck.push(active.get('id'));
          }
        });

        const selectedIds:(string)[] = [];
        canvasData.getActiveObjects().forEach((element : typeof ObjectWithID) => {
          selectedIds.push(element.get('id'));
        });
        const selectionUpdate : updateMsg = { msgType: 'Selection', msg: JSON.stringify(selectedIds) };
        updateServer(selectionUpdate);
        console.log(selectedCheck.length);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'delete selected element';
        deleteBtn.id = 'deleteBtn';
        deleteBtn.onclick = deleteSelected;
        document.body.appendChild(deleteBtn);
      });
      canvasData.on('selection:updated', () => {
        console.log('updated');
        canvasData.getActiveObjects().forEach((active: any) => {
          if (selectedCheck.indexOf(active.get('id')) === -1) {
            selectedCheck.push(active.get('id'));
          }
        });

        const selectedIds:(string)[] = [];
        canvasData.getActiveObjects().forEach((element : typeof ObjectWithID) => {
          selectedIds.push(element.get('id'));
        });
        const selectionUpdate : updateMsg = { msgType: 'Selection', msg: JSON.stringify(selectedIds) };
        updateServer(selectionUpdate);
        const activeObjectIDS : string[] = [];
        canvasData.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
          activeObjectIDS.push(active.get('id')!);
        });
        const deselectedId = selectedCheck.filter((x) => !activeObjectIDS.includes(x));
        console.log('send selection cleared update');
        const deselectMsg :updateMsg = { msgType: 'Deselection', msg: JSON.stringify(deselectedId) };
        console.log(canvasData.getActiveObjects());
        console.log(deselectMsg);
        updateServer(deselectMsg);
      });
      canvasData.on('selection:cleared', () => {
        console.log('selectedCheck');
        console.dir(selectedCheck);
        const activeObjectIDS : string[] = [];
        canvasData.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
          activeObjectIDS.push(active.get('id')!);
        });
        const deselectedId = selectedCheck.filter((x) => !activeObjectIDS.includes(x));
        console.log('send selection cleared update');
        const deselectMsg :updateMsg = { msgType: 'Deselection', msg: JSON.stringify(deselectedId) };
        console.log(canvasData.getActiveObjects());
        console.log(deselectMsg);
        updateServer(deselectMsg);
        const elem = document.getElementById('deleteBtn');
        if (elem != null) {
          elem.remove();
        }
      });

      /**
       * Whenever a new object is added to the canvas
       */
      // TODO: Probably shouldn't be casting evt here to any
      canvasData.on('object:added', (evt: any) => {
        if (evt.target !== undefined && 'id' in evt?.target === false) {
          // eslint-disable-next-line no-param-reassign
          evt.target.id = getUUID();
        }
      });
      canvasData.on('object:moving', () => {
        isObjectModified = true;
      });
      canvasData.on('object:rotating', () => {
        isObjectModified = true;
      });

      canvasData.on('object:scaling', () => {
        isObjectModified = true;
      });

      console.dir(canvasData);
      console.log(canvasData.toObject());
      // loadCanvas();
    };

    /**
     * Event handler for resizing the canvas when the size of the webpage changes
     */
    const resizeCanvas = () => {
      const outerCanvasContainer = (<HTMLDivElement> document.getElementById('canvas-wrapper-div'));
      const containerWidth = outerCanvasContainer.clientWidth;
      const scale = containerWidth / canvasData.getWidth();
      const zoom = canvasData.getZoom() * scale;

      canvasData.setDimensions({
        width: containerWidth,
        height: containerWidth / canvasRatio,
      });

      canvasData.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    };
    socket.addEventListener('message', (message) => {
      // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      console.log(msg);
      // console.log(msg.msgType);
      console.dir(msg);
      console.dir(msg.msg[1]);
      let objct : fabric.Object;
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'Addition': {
          const parsedObject = new fabric.ObjectWithID(JSON.parse(parsedMsg[1]));
          console.log(parsedObject.get('type'));
          switch (parsedObject.get('type')) {
            case 'rectWithID': {
              objct = new fabric.RectWithID(JSON.parse(parsedMsg[1]));
              break;
            }
            case 'circleWithID': {
              objct = new fabric.CircleWithID(JSON.parse(parsedMsg[1]));
              break;
            }
            case 'lineWithID': {
              objct = new fabric.LineWithID(JSON.parse(parsedMsg[1]));
              break;
            }
            default: {
              objct = new fabric.ObjectWithID(JSON.parse(parsedMsg[1]));
            }
          }
          canvasData.add(objct);
          console.log(canvasData.getObjects());
          objct.setCoords();
          canvasData.renderAll();
          break;
        }
        case 'Deletion': {
          const deletionIDs = parsedMsg;
          deletionIDs.forEach((ID : string) => {
            canvasData.getObjects().forEach((object : fabric.ObjectWithID) => {
              if (object.get('id') === ID) {
                canvasData.remove(object);
              }
            });
          });
          break;
        }
        case 'Clearing': {
          canvasData.clear();
          break;
        }
        case 'Modified': {
          console.log(parsedMsg);
          parsedMsg[1].forEach((element : any) => {
            const scaledCanvasObject = new fabric.ObjectWithID(JSON.parse(element));
            console.log('Scaled Object:');
            console.log(scaledCanvasObject);
            canvasData.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
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
          canvasData.renderAll();
          break;
        }
        case 'Selection': {
          console.log(parsedMsg);
          parsedMsg.forEach((id : any) => {
            canvasData.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
              if (canvasObject.get('id') === id) {
                canvasObject.set({
                  selectable: false,
                  evented: false,
                  opacity: 0.5,

                });
              }
            });
          });
          canvasData.renderAll();
          break;
        }
        case 'Deselection': {
          console.log('Got Here');
          console.log(parsedMsg);
          parsedMsg.forEach((id : any) => {
            canvasData.getObjects().forEach((canvasObject : fabric.ObjectWithID) => {
              if (canvasObject.get('id') === id) {
                canvasObject.set({
                  selectable: true,
                  evented: true,
                  opacity: 1,

                });
              }
            });
          });
          canvasData.renderAll();
          break;
        }
        case 'Loading': {
          parsedMsg.forEach((element : string) => {
            const object : fabric.ObjectWithID = new ObjectWithID(JSON.parse(element));
            switch (object.get('type')) {
              case 'rectWithID': {
                canvasData.add(new fabric.RectWithID(JSON.parse(element)));
                break;
              }
              case 'circleWithID': {
                canvasData.add(new fabric.CircleWithID(JSON.parse(element)));
                break;
              }
              case 'lineWithID': {
                // canvasData.add(new fabric.LineWithID(object));
                break;
              }
              default: {
                console.log('Unknown type');
              }
            }
          });
          break;
        }
        default: {
          console.log('unknown message');
        }
      }
      canvasData.renderAll();
    });
    // Hook resize callback into creation and destruction of this element
    onBeforeMount(() => window.addEventListener('resize', resizeCanvas));
    onBeforeUnmount(() => window.removeEventListener('resize', resizeCanvas));

    const printCanvasToConsole = () => {
      console.dir(canvasData.toObject());
    };

    onMounted(initFabricCanvas);
    return {
      resizeCanvas,
      tool,
      canvasData,
      clearBoard,
      initFabricCanvas,
      handleToolChange,
      lineThickness,
      thicknessOptions,
      printCanvasToConsole,
      updateServer,
      // loadCanvas,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
