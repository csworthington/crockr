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
    <span><button @click="saveBoard"> Save </button></span>
    <span><button onclick="document.getElementById('file-input').click();">Load</button></span>
    <span>
    <input @click="loadBoard" id="file-input" type="file" name="name" style="display:none;"/>
    </span>
    <span><button @click="handleToolChange('LINE')"> Line Tool </button></span>
    <span><button @click="printCanvasToConsole"> Print Canvas </button></span>
    <span><button @click="sendCanvasToServer">Send Canvas</button></span>
    <span><button @click="getDogFromServer">Get Dog🐶</button></span>
    <span><button @click="getLineFromServer">Get Line</button></span>
    <span><button @click="getPenFromServer">Get Pen</button></span>
    <span><button @click="getRectFromServer">Get Rect</button></span>
    <span><button @click="getCircleFromServer">Get circle</button></span>
    <span><button @click="exportCanvasToSVG">ExportCanvasToSVG</button></span>
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
    <span><button @click="addText()">Add Custom Text</button></span>
<!---<input type="file" onchange="openFile();" id="imageFile" accept="image/png, image/jpeg" > --->
    <span><button @click="openFile()">
      <input type="file" onchange="openFile()" id="imageFile" accept="image/png, image/jpeg">
       </button></span>
  </div>
  <div>
    <span>current tool = {{ tool }}</span>
  </div>
  <div>
    <WebSocketStatusIndicator />
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
import { StoreKey } from '@/symbols';
import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';
import getUUID from '@/utils/id-generator';
import { useAxios } from '@/utils/useAxios';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import WebSocketStatusIndicator from '@/components/websockets/WebSocketStatusIndicator.vue';
import router from '@/router';

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
    WebSocketStatusIndicator,
  },
  setup(props) {
    const store = useStore(StoreKey);
    const axios = useAxios();
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    canvasData.perPixelTargetFind = true;
    canvasData.targetFindTolerance = 8;
    // line object that is modified after first coord is placed.
    let line : fabric.LineWithID;
    // stores the first coord when line tool is active
    let lineToollTFirstCoordPlaced:number[];
    let rect: fabric.RectWithID;
    let circ: fabric.CircleWithID;
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
    if (store.state.roomID.ID === '-1') {
      router.push('/roomSelector');
    }
    interface updateMsg{
      msgType : string;
      roomID: string;
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

    function addText() {
      isObjectBeingAdded = true;
      const oText = new fabric.ITextWithID('Text');/* , {
        left: 100,
        top: 100,
        fill: store.state.colourPalette.primaryToolColour,
        editable: true,
      }); */
      oText.left = 100;
      oText.top = 100;
      oText.editable = true;
      oText.fill = store.state.colourPalette.primaryToolColour;

      canvasData.add(oText);
      oText.bringToFront();
      canvasData.setActiveObject(oText);
      isObjectBeingAdded = false;
      console.log('send real add  event');
      console.log(JSON.stringify(oText));
      // eslint-disable-next-line max-len
      const addedObject: fabric.ObjectWithID = canvasData.getObjects()[canvasData.getObjects().length - 1];
      const addedId = addedObject.get('id');
      console.log(addedObject);
      const addMsg :updateMsg = { roomID: store.state.roomID.ID, msgType: 'Addition', msg: JSON.stringify([addedId, JSON.stringify(addedObject)]) };
      updateServer(addMsg);
    }

    // adds image to the canvas
    function openFile() {
      let movingMsg :updateMsg;
      isObjectBeingAdded = true;
      const img = document.getElementById('imageFile');
      img!.onchange = function handle(e) {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const imgObj = new Image();

          imgObj.src = reader.result as string;
          imgObj.onload = function handleImage() {
            // const image = new fabric.ImageWithID(imgObj, {});
            fabric.ImageWithID.fromURL(imgObj.src, (image) => {
              image.set({
                left: 100,
                top: 60,
              });
              image.scaleToWidth(200);
              canvasData.add(image); // .renderAll();
              canvasData.setActiveObject(image);

              // Send image to server
              isObjectBeingAdded = false;
              const addedObject: fabric.ObjectWithID = canvasData.getObjects()[
                canvasData.getObjects().length - 1
              ];
              const addedId = addedObject.get('id');
              const addMsg :updateMsg = {
                roomID: store.state.roomID.ID,
                msgType: 'Addition',
                msg: JSON.stringify([addedId, JSON.stringify(addedObject)]),
              };
              updateServer(addMsg);
            });
            // canvasData.add(image); // .renderAll();
            // canvasData.setActiveObject(image);
            // const image = new fabric.ImageWithID(imgObj);
            // image.set({
            //   left: 100,
            //   top: 60,
            // });
            // image.scaleToWidth(200);
            // canvasData.add(image); // .renderAll();

            // console.dir(image);

            // canvasData.setActiveObject(image);
            // isObjectBeingAdded = false;

            // eslint-disable-next-line max-len
            // const addedObject: fabric.ObjectWithID = canvasData.getObjects()[canvasData.getObjects().length - 1];
            // const addedId = addedObject.get('id');
            // const addMsg :updateMsg = {
            //   msgType: 'Addition',
            //   msg: JSON.stringify([addedId, JSON.stringify(addedObject)]),
            // };
            // updateServer(addMsg);
          };
        };
      };
    }
    /**
     * Start drawing a line on the canvas when the line tool is selected and the
     * mouse:down event has been fired by the canvas
     */
    function lineMouseDown() {
      lineToollTFirstCoordPlaced = [origX, origY];
      const width = lineThickness.value;

      line = new fabric.LineWithID(
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
      circ = new fabric.CircleWithID({
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
        movingMsg = { msgType: 'Modified', roomID: store.state.roomID.ID, msg: JSON.stringify(scaledObjects) };
        updateServer(movingMsg);
      } else if (isPenDown) {
        isPenDown = false;
        // eslint-disable-next-line max-len
        const addedObject: fabric.ObjectWithID = canvasData.getObjects()[canvasData.getObjects().length - 1];
        const addedId = addedObject.get('id');
        const addMsg :updateMsg = { msgType: 'Addition', roomID: store.state.roomID.ID, msg: JSON.stringify([addedId, JSON.stringify(addedObject)]) };
        updateServer(addMsg);
        console.log('send pen event');
      } else if (isObjectBeingAdded) {
        isObjectBeingAdded = false;
        console.log('send real add  event');
        // eslint-disable-next-line max-len
        const addedObject: fabric.ObjectWithID = canvasData.getObjects()[canvasData.getObjects().length - 1];
        const addedId = addedObject.get('id');
        const addMsg :updateMsg = { msgType: 'Addition', roomID: store.state.roomID.ID, msg: JSON.stringify([addedId, JSON.stringify(addedObject)]) };
        updateServer(addMsg);
      }
    }

    /* zoom control */
    // eslint-disable-next-line max-len
    function handleMouseWheelEvent(opt: { e: { deltaY: any; preventDefault: () => void; stopPropagation: () => void; }; }) {
      const delta = opt.e.deltaY;
      let zoom = canvasData.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvasData.setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
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
      canvasData.on('mouse:wheel', handleMouseWheelEvent);
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
      const objectList = canvasData.getActiveObjects();
      objectList.forEach((object : fabric.ObjectWithID) => {
        deletionIDs.push(<string>object.get('id'));
        canvasData.remove(object);
      });
      const elem = document.getElementById('deleteBtn');
      if (elem != null) {
        elem.remove();
      }
      const deleteMsg :updateMsg = { msgType: 'Deletion', roomID: store.state.roomID.ID, msg: JSON.stringify(deletionIDs) };
      updateServer(deleteMsg);
      console.log('send delete update');
    };

    /**
     * Clear the canvas of all objects when the user selects the clear button
     */
    /* const loadCanvas = () => {
      const loadMsg :updateMsg = { msgType: 'Loading', msg: '' };
      updateServer(loadMsg);
    }; */
    const saveBoard = () => {
      // eslint-disable-next-line prefer-template
      const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(canvasData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', data);
      // eslint-disable-next-line no-useless-concat
      downloadAnchorNode.setAttribute('download', 'Canvas' + '.json');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
    function loadBoard() {
      const canvasFile = document.getElementById('file-input');
      canvasFile!.onchange = function handle(e) {
        const reader = new FileReader();
        reader.addEventListener('load', (loadEvent) => {
          try {
            const json = JSON.parse(<string> reader.result);
            // eslint-disable-next-line prefer-arrow-callback
            canvasData.loadFromJSON(reader.result, function () {
              canvasData.renderAll();
            });
            const loadedObjects: string[]|any[] = [[], []];
            canvasData.getObjects().forEach((element: fabric.ObjectWithID) => {
              loadedObjects[0].push(element.get('id'));
              loadedObjects[1].push(JSON.stringify(element));
            });
            const loadMsg : updateMsg = { msgType: 'localLoad', roomID: store.state.roomID.ID, msg: JSON.stringify(loadedObjects) };
            updateServer(loadMsg);
          } catch (error) {
            console.error(error);
          }
        });
        const target = e.target as HTMLInputElement;
        const file : File = (target.files as FileList)[0];
        console.log(reader.readAsText(file));
      };
    }
    const clearBoard = () => {
      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvasData.clear();
        const clearMsg :updateMsg = { msgType: 'Clearing', roomID: store.state.roomID.ID, msg: JSON.stringify('') };
        updateServer(clearMsg);
        console.log('send  clear update.');
      }
    };

    /**
     * Send a load message to the server to get the current state of the canvas
     */
    const loadCanvas = () => {
      if (store.state.roomID.ID !== '-1') {
        const loadMsg :updateMsg = { msgType: 'Loading', roomID: store.state.roomID.ID, msg: '' };
        updateServer(loadMsg);
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

      // Set the brush to be the brush with the ID attached
      canvasData.freeDrawingBrush = new fabric.PencilBrushWithID(canvasData);

      canvasData.on('selection:created', () => {
        console.log('send selection update');

        canvasData.getActiveObjects().forEach((active: any) => {
          if (selectedCheck.indexOf(active.get('id')) === -1) {
            selectedCheck.push(active.get('id'));
          }
        });

        const selectedIds:(string)[] = [];
        canvasData.getActiveObjects().forEach((element : fabric.ObjectWithID) => {
          selectedIds.push(<string>element.get('id'));
        });
        const selectionUpdate : updateMsg = { msgType: 'Selection', roomID: store.state.roomID.ID, msg: JSON.stringify(selectedIds) };
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
        canvasData.getActiveObjects().forEach((element : fabric.ObjectWithID) => {
          selectedIds.push(<string>element.get('id'));
        });
        const selectionUpdate : updateMsg = { msgType: 'Selection', roomID: store.state.roomID.ID, msg: JSON.stringify(selectedIds) };
        updateServer(selectionUpdate);
        const activeObjectIDS : string[] = [];
        canvasData.getActiveObjects().forEach((active : fabric.ObjectWithID) => {
          activeObjectIDS.push(active.get('id')!);
        });
        const deselectedId = selectedCheck.filter((x) => !activeObjectIDS.includes(x));
        console.log('send selection cleared update');
        const deselectMsg :updateMsg = { msgType: 'Deselection', roomID: store.state.roomID.ID, msg: JSON.stringify(deselectedId) };
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
        const deselectMsg :updateMsg = { msgType: 'Deselection', roomID: store.state.roomID.ID, msg: JSON.stringify(deselectedId) };
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

      if (store.state.socket.isConnected) {
        console.log(store.state.roomID.ID);
        loadCanvas();
      }
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
    // Event Handler for every type of message recieved
    socket.addEventListener('message', (message) => {
      // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      // console.log(msg.msgType);
      let objct : any;
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
              const tempObject = JSON.parse(parsedMsg[1]);
              const points = [tempObject.x1, tempObject.y1, tempObject.x2, tempObject.y2];
              objct = new fabric.LineWithID(points, JSON.parse(parsedMsg[1]));
              break;
            }
            case 'pathWithID': {
              const tempObject = JSON.parse(parsedMsg[1]);
              objct = new fabric.PathWithID(tempObject.path, tempObject);
              break;
            } case 'textWithID': {
              console.log('Object');
              objct = new fabric.ITextWithID(JSON.parse(parsedMsg[1]));
              console.log(objct);
              break;
            }/*
            case 'imageWithID': {
              // objct = new fabric.ImageWithID(JSON.parse(parsedMsg[1]));
              debugger;
              const tempObject: fabric.IImageWithIDOptions = JSON.parse(parsedMsg[1]);
              console.dir(tempObject);
              if (tempObject.src) {
                objct = new fabric.ImageWithID(tempObject.src, tempObject);
              } else {
                throw new Error(`No URL source in imageWithID, image=${tempObject}`);
              }
              // eslint-disable-next-line no-underscore-dangle
              // objct = new fabric.ObjectWithID(tempObject);
              break;
            } */
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
          canvasData.clear();
          parsedMsg.forEach((element : string) => {
            const object = new fabric.ObjectWithID(JSON.parse(element));
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
                const tempObject = JSON.parse(element);
                const points = [tempObject.x1, tempObject.y1, tempObject.x2, tempObject.y2];
                canvasData.add(new fabric.LineWithID(points, tempObject));
                break;
              }
              case 'pathWithID': {
                const tempObject = JSON.parse(element);
                canvasData.add(new fabric.PathWithID(tempObject.path, tempObject));
                break;
              } case 'textWithID': {
                canvasData.add(new fabric.ITextWithID(JSON.parse(element)));
                break;
              }/*
              case 'imageWithID': {
                const tempObject = JSON.parse(element);
                console.dir(tempObject);
                // canvasData.add(new fabric.ImageWithID(tempObject.element, tempObject));
                break;
              } */
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

    const sendCanvasToServer = () => {
      axios.post('./api/canvas/addobj', canvasData.toObject());
    };

    const getDogFromServer = () => {
      axios.get('./api/canvas/getdog').then((value) => {
        console.log('got dog');
        canvasData.loadFromJSON(JSON.stringify(value.data), canvasData.renderAll.bind(canvasData));
      });
    };

    const getLineFromServer = () => {
      axios.get('./api/canvas/getline').then((value) => {
        canvasData.loadFromJSON(JSON.stringify(value.data), canvasData.renderAll.bind(canvasData));
      });
    };

    const getRectFromServer = () => {
      axios.get('./api/canvas/getrect').then((value) => {
        canvasData.loadFromJSON(JSON.stringify(value.data), canvasData.renderAll.bind(canvasData));
      });
    };

    const getCircleFromServer = () => {
      axios.get('./api/canvas/getcircle').then((value) => {
        canvasData.loadFromJSON(JSON.stringify(value.data), canvasData.renderAll.bind(canvasData));
      });
    };

    const getPenFromServer = () => {
      axios.get('./api/canvas/getpen').then((value) => {
        canvasData.loadFromJSON(JSON.stringify(value.data), canvasData.renderAll.bind(canvasData));
      });
    };

    /**
     * Export the canvas as an svg file to the new window
     */
    const exportCanvasToSVG = () => {
      const svgAsBlob = new Blob([canvasData.toSVG()], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgAsBlob);
      const link = document.createElement('a');
      link.href = svgUrl;
      link.id = 'whiteboard-download-link';
      link.download = 'whiteboard.svg';
      link.innerHTML = 'Click here to download file';

      document.body.appendChild(link);
      const queriedLink : HTMLLinkElement | null = document.querySelector('#whiteboard-download-link');
      if (queriedLink) {
        queriedLink.click();
        queriedLink.remove();
      }
      // Garbage collect the blob after window open
      URL.revokeObjectURL(svgUrl);
    };

    onMounted(initFabricCanvas);
    onMounted(() => {
      handleToolChange(ToolType.Select);
    });
    return {
      resizeCanvas,
      tool,
      canvasData,
      clearBoard,
      saveBoard,
      loadBoard,
      initFabricCanvas,
      handleToolChange,
      lineThickness,
      thicknessOptions,
      printCanvasToConsole,
      sendCanvasToServer,
      getDogFromServer,
      getLineFromServer,
      getRectFromServer,
      getCircleFromServer,
      getPenFromServer,
      loadCanvas,
      updateServer,
      addText,
      openFile,
      exportCanvasToSVG,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
