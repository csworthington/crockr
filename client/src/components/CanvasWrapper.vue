<template>
  <div>
    <h3>Room is "{{ roomName }}"</h3>
  </div>
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
    <div class="dropdown">
      <button class="dropbtn">Tools</button>
        <div class="dropdown-content">
          <button @click="handleToolChange('PEN')">Pen tool toggle</button>
          <button @click="handleToolChange('RECTANGLE')"> Rectangle </button>
          <button @click="handleToolChange('CIRCLE')"> Circle </button>
          <button @click="handleToolChange('SELECT')"> select </button>
          <button @click="handleToolChange('PAN')"> Pan </button>
        </div>
    </div>
  </div>
  <div>
      <span><button @click="printCanvasToConsole"> Print Canvas </button></span>
      <span><button @click="sendCanvasToServer">Send Canvas</button></span>
      <span><button @click="exportCanvasToSVG">ExportCanvasToSVG</button></span>
  </div>
  <div>
    <span><button @click="addText()">Add Custom Text</button></span>
<!---<input type="file" onchange="openFile();" id="imageFile" accept="image/png, image/jpeg" > --->
    <span><button @click="openFile()">
      <input type="file" onchange="openFile()" id="imageFile" accept="image/png, image/jpeg">
       </button></span>
       <span><button @click="handleToolChange('PAN')"> Pan </button></span>
    <span>
      <button type="button"
              class="btn btn-primary"
              @click="handleEquationButton">
      {{ equationButtonText }}
    </button>
    </span>
  </div>
  <div>
    <span>current tool = {{ tool }}</span>
  </div>
  <div>
    <WebSocketStatusIndicator />
  </div>
  <EquationEditor :modalID="MODAL_ID"
                  :equation="equationLatex"
                  :equationID="equationID"
                  @update:equation="getEquationUpdate"
  ></EquationEditor>
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
import { Modal } from 'bootstrap';
import { StoreKey } from '@/symbols';
import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';
import getUUID from '@/utils/id-generator';
import { useAxios } from '@/utils/useAxios';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import WebSocketStatusIndicator from '@/components/websockets/WebSocketStatusIndicator.vue';
import EquationEditor, { EquationEditorUpdate } from '@/components/EquationEditor.vue';

import { UpdateMessage } from '@/services/synchronization/typings.d';
import { updateServer } from '@/services/synchronization/outgoingMessageHandler';
import * as outgoingMessageHandler from '@/services/synchronization/outgoingMessageHandler';
import * as handleIncomingMessage from '@/services/synchronization/incomingMessageHandler';
import { ShapesWithID } from '@/utils/addCustomFabricObjects';

enum ToolType {
  None = 'NONE',
  Select = 'SELECT',
  Rectangle = 'RECTANGLE',
  Line = 'LINE',
  Circle = 'CIRCLE',
  Pen = 'PEN',
  Pan = 'PAN',
}

export default defineComponent({
  name: 'CanvasWrapper',
  components: {
    ColourPicker,
    EquationEditor,
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

    const roomName = store.state.roomID.ID;

    let enableSelectionMessageSending = true;

    // determines how thick line tool and pen tool are
    const lineThickness: Ref<number> = ref(2);
    const thicknessOptions = [
      { text: '2px', value: 2 },
      { text: '5px', value: 5 },
      { text: '8px', value: 8 },
      { text: '20px', value: 20 },
    ];
    const canvasRatio = (16 / 6); // Aspect ratio of the canvas. Currently 16:6

    const MODAL_ID = 'canvas-equation-editor';

    const equationButtonText: Ref<string> = ref('New Equation');
    const equationLatex: Ref<string> = ref('');
    const equationID: Ref<string> = ref('');

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.colourPalette.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('colourPalette/updatePrimaryToolColour', newValue);
      },
    });

    const getObjectByID = (canvas: fabric.Canvas, id: string): fabric.ObjectWithID | null => {
      canvas.getObjects().forEach((
        obj: fabric.ObjectWithID,
        index: number,
      // eslint-disable-next-line consistent-return
      ): fabric.ObjectWithID | undefined => {
        if (obj.get('id') === id) {
          return obj;
        }
        if (index === canvas.getObjects().length - 1) {
          return undefined;
        }
      });
      return null;
    };

    function addText() {
      isObjectBeingAdded = true;
      const oText = new fabric.ITextWithID('Text', {
        left: 100,
        top: 100,
        fill: store.state.colourPalette.primaryToolColour,
        editable: true,
      });
      canvasData.add(oText);
      oText.bringToFront();
      canvasData.setActiveObject(oText);
      isObjectBeingAdded = false;
      outgoingMessageHandler.sendObjectAdded(canvasData);
    }

    function addImageToCanvasFromURL(url: string) {
      fabric.ImageWithID.fromURL(url, (image) => {
        image.set({
          left: 100,
          top: 60,
        });
        image.scaleToWidth(200);
        canvasData.add(image);
        canvasData.setActiveObject(image);
        // Set image src
        image.set('src', image.getSrc());
        // Send image to server
        outgoingMessageHandler.sendObjectAdded(canvasData);
        isObjectBeingAdded = false;
        // Once image has been added, reenable sending of selection messages
        enableSelectionMessageSending = true;
      });
    }
    // adds image to the canvas
    function openFile() {
      let movingMsg: UpdateMessage;
      isObjectBeingAdded = true;
      const img = document.getElementById('imageFile');
      img!.onchange = function handle(e) {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // Before loading image, disable the sending of selection messages until image loads
        enableSelectionMessageSending = false;
        reader.onload = () => {
          const imgObj = new Image();
          imgObj.src = reader.result as string;
          imgObj.onload = () => {
            addImageToCanvasFromURL(imgObj.src);
          };
          // imgObj.onload = function handleImage() {
          //   fabric.ImageWithID.fromURL(imgObj.src, (image) => {
          //     image.set({
          //       left: 100,
          //       top: 60,
          //     });
          //     image.scaleToWidth(200);
          //     canvasData.add(image);
          //     canvasData.setActiveObject(image);
          //     // Set image src
          //     image.set('src', image.getSrc());
          //     // Send image to server
          //     outgoingMessageHandler.sendObjectAdded(canvasData);
          //     isObjectBeingAdded = false;
          //     // Once image has been added, reenable sending of selection messages
          //     enableSelectionMessageSending = true;
          //   });
          // };
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
     * Pans the canvas relative to the original points upon mouse click down
     * and the current position of the mouse
     */
    function PanMove(x : number, y : number) {
      const deltaX = x - origX;
      const deltaY = y - origY;
      const delta = new fabric.Point(deltaX, deltaY);
      // const delta = new fabric.Point(x, y);
      canvasData.relativePan(delta);
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
      } else if (tool.value === ToolType.Pan) {
        PanMove(pointer.x, pointer.y);
      }
    }

    /**
     * Primary event handler for fabric.js canvas mouse:up event
     * @param {fabric.IEvent<MouseEvent>} evt: Event fired by canvas
     */
    function handleMouseUpEvent(evt: fabric.IEvent<Event>) {
      isDown = false;
      if (isObjectModified) {
        isObjectModified = false;
        outgoingMessageHandler.sendObjectModified(canvasData);
      } else if (isObjectBeingAdded) {
        isObjectBeingAdded = false;
        outgoingMessageHandler.sendObjectAdded(canvasData);
      } else if (isPenDown) {
        isPenDown = false;
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
        case ToolType.Pan: {
          tool.value = ToolType.Pan;
          break;
        }
        default: {
          tool.value = ToolType.None;
          break;
        }
      }
    }

    const addEquationToCanvas = (eqnUpdate: EquationEditorUpdate) => {
      fabric.EquationWithID.fromURL(eqnUpdate.dataURL, (eqnImg) => {
        eqnImg.set({
          left: 100,
          top: 60,
        });
        eqnImg.scaleToWidth(200);
        canvasData.add(eqnImg);
        canvasData.setActiveObject(eqnImg);

        // Set image src
        eqnImg.set('src', eqnImg.getSrc());
        eqnImg.set('latex', eqnUpdate.texEquation);

        // Send image to server
        outgoingMessageHandler.sendObjectAdded(canvasData);
        isObjectBeingAdded = false;

        // Once image has been added, reenable sending of selection messages
        enableSelectionMessageSending = true;
      });
    };

    const getEquationUpdate = (equation: EquationEditorUpdate) => {
      console.log('in eqn update');
      debugger;
      // Find if id already exists on canvas
      const equationObj = getObjectByID(canvasData, equation.id);
      if (equationObj) {
        console.log('equation with this id already exists');
        equationObj.set('latex');
      }
      addEquationToCanvas(equation);
    };

    const handleEquationSelection = () => {
      // See if an equation is selected
      const activeObjects = canvasData.getActiveObjects();
      let equationSelectedFlag = false;

      activeObjects.forEach((element) => {
        if (element.get('type') === ShapesWithID.equation) {
          equationSelectedFlag = true;
          equationButtonText.value = 'Edit Equation';
          equationLatex.value = (element as fabric.EquationWithID).get('latex');
          equationID.value = (element as fabric.EquationWithID).get('id') || 'NO ID!';
        }
      });

      if (!equationSelectedFlag) {
        equationButtonText.value = 'New Equation';
      }
    };

    const handleEquationButton = () => {
      // Toggle modal
      const modalDiv = document.getElementById(MODAL_ID);
      if (modalDiv) {
        Modal.getOrCreateInstance(modalDiv).show();
      }
    };

    /**
     * Delete a specific object when the user presses the delete button
     */
    const deleteSelected = () => {
      const elem = document.getElementById('deleteBtn');
      if (elem !== null) {
        elem.remove();
      }
      outgoingMessageHandler.sendObjectDeleted(canvasData);
    };

    /**
     * Clear the canvas of all objects when the user selects the clear button
     */
    /* const loadCanvas = () => {
      const loadMsg :UpdateMessage = { msgType: 'Loading', msg: '' };
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
      // Send load board message to the server
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
            outgoingMessageHandler.sendLocalLoadMessage(canvasData);
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
        outgoingMessageHandler.sendClearBoardMessage(canvasData);
      }
    };

    /**
     * Send a load message to the server to get the current state of the canvas
     */
    const loadCanvas = () => {
      outgoingMessageHandler.sendLoadCanvasMessage();
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

      canvasData.on('selection:created', (evt) => {
        if (enableSelectionMessageSending) {
          // Send selection update to the server
          outgoingMessageHandler.sendObjectSelected(canvasData, selectedCheck);
        }

        // Create a delete button on object selection
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'delete selected element';
        deleteBtn.id = 'deleteBtn';
        deleteBtn.onclick = deleteSelected;
        document.body.appendChild(deleteBtn);

        // Check if equation is selected
        handleEquationSelection();
      });

      canvasData.on('selection:updated', () => {
        if (enableSelectionMessageSending) {
          outgoingMessageHandler.sendObjectSelectionUpdated(
            canvasData,
            selectedCheck,
          );
        }

        // Check if equation is selected
        handleEquationSelection();
      });

      canvasData.on('selection:cleared', () => {
        if (enableSelectionMessageSending) {
          outgoingMessageHandler.sendObjectSelectionCleared(
            canvasData,
            selectedCheck,
          );
        }

        // Remove delete button when object is deselected
        const elem = document.getElementById('deleteBtn');
        if (elem != null) {
          elem.remove();
        }

        // Check if equation is selected
        handleEquationSelection();
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

      // Send a modification synchronization event to the server when any text is changed
      canvasData.on('text:editing:exited', (evt: fabric.IEvent) => {
        console.log('in canvas text:editing:exited');
        console.dir(evt);
        outgoingMessageHandler.sendObjectModified(canvasData);
      });

      if (store.state.socket.isConnected) {
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
      // TODO: Import needs to be changed? Don't like calling default
      handleIncomingMessage.default(canvasData, message);
      canvasData.renderAll();
    });

    // Hook resize callback into creation and destruction of this element
    onBeforeMount(() => window.addEventListener('resize', resizeCanvas));
    onBeforeUnmount(() => window.removeEventListener('resize', resizeCanvas));

    const printCanvasToConsole = () => {
      console.dir(canvasData.toObject());
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
      roomName,
      getEquationUpdate,
      MODAL_ID,
      equationButtonText,
      equationLatex,
      equationID,
      handleEquationButton,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
body {
  background: rgb(169, 204, 212);
}
#nav{
  background: rgb(202, 209, 134);
}
#main-canvas{
  background: white;
}
.dropbtn {
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content button {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content button:hover {background-color: #f1f1f1}

.dropdown:hover .dropdown-content {
  bottom: 100%;
  display: block;
}

.dropdown:hover .dropbtn {
  background-color: #3e8e41;
}
</style>
