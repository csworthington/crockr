<template>
  <div>
    <h3>Room is "{{ roomName }}"</h3>
  </div>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div id ="canvasButtons" class="container">
    <!-- Drawing Modifiers -->
    <div class="d-inline-flex p-2">
      <div class="p-2">
        <ColourPicker />
      </div>
      <div class="p-2">
        <select name="thick" v-model="lineThickness">
          <option v-for="option in thicknessOptions"
                  :key="option.value"
                  :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <ul class="nav nav-tabs" >
      <li class="nav-item" role="presentation">
        <button class="nav-link active"
                id="drawing-tools-tab"
                data-bs-toggle="tab"
                data-bs-target="#drawing-tools-panel"
                type="button"
                role="tab"
                aria-controls="drawing-tools-panel"
                aria-selected="true">
            Drawing Tools
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link"
                id="advanced-tools-tab"
                data-bs-toggle="tab"
                data-bs-target="#advanced-tools-panel"
                type="button"
                role="tab"
                aria-controls="advanced-tools-panel"
                aria-selected="false">
            Advanced Tools
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link"
                id="room-tools-tab"
                data-bs-toggle="tab"
                data-bs-target="#room-tools-panel"
                type="button"
                role="tab"
                aria-controls="room-tools-panel"
                aria-selected="false">
            Room Tools
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <!-- Drawing Tools -->
      <div class="tab-pane fade show active"
           id="drawing-tools-panel"
           role="tabpanel"
           aria-labelledby="drawing-tools-tab">
        <div class="d-inline-flex p-2">
        <div class="btn-group">
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('SELECT')">
            Select
          </button>
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('PEN')">
            Pen
          </button>
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('RECTANGLE')">
            Rectangle
          </button>
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('CIRCLE')">
            Circle
          </button>
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('LINE')">
            Line
          </button>
          <button type="button"
                  class="btn btn-outline-primary"
                  :disabled="deleteButtonDisabled"
                  @click="deleteSelected()">
            Delete
          </button>
        </div>
          <button type="button"
                  class="btn btn-outline-primary"
                  @click="handleToolChange('PAN')">
            Pan
          </button>
        </div>
      </div>

      <!-- Advanced Shapes -->
      <div class="tab-pane fade"
           id="advanced-tools-panel"
           role="tabpanel"
           aria-labelledby="advanced-tools-tab">
        <div class="d-inline-flex p-2">
          <div class="row g-3">
            <div class="col-auto">
              <button type="button"
                      class="btn btn-secondary"
                      @click="addText()">
                Text
              </button>
            </div>

            <div class="col-auto">
              <button type="button"
                      class="btn btn-secondary"
                      @click="handleEquationButton">
                {{ equationButtonText }}
              </button>
            </div>

            <div class="col-auto">
              <input class="form-control"
                      type="file"

                      id="imageFile"
                      accept="image/png, image/jpeg"
                      @change="openFile()">
            </div>
          </div>
        </div>

      </div>

      <!-- Room Tools -->
      <div class="tab-pane fade"
           id="room-tools-panel"
           role="tabpanel"
           aria-labelledby="room-tools-tab">
        <div class="d-inline-flex p-2">
          <span class="m-1">
            <button type="button"
                    class="btn btn-secondary"
                    @click="saveBoard">
                Save
            </button>
          </span>
          <span class="m-1">
            <button type="button"
                    class="btn btn-secondary"
                    onclick="document.getElementById('file-input').click();">
              Load
            </button>
            <input @click="loadBoard"
                  id="file-input"
                  type="file"
                  name="name"
                  style="display:none;" />
          </span>

          <span class="m-1">
            <button type="button"
                    class="btn btn-secondary"
                    @click="clearBoard">
              Clear Canvas
            </button>
          </span>
          <span class="m-1">
            <button @click="printCanvasToConsole"
                    type="button"
                    class="btn btn-secondary">
              Print Canvas
            </button>
          </span>
          <span class="m-1">
            <button type="button"
                    class="btn btn-secondary"
                    @click="exportCanvasToSVG">
              Export To SVG
            </button>
          </span>
          <span class="m-1">
            <button type="button"
                    class="btn btn-secondary"
                    @click="leaveRoom">
              Leave
            </button>
          </span>
        </div>
      </div>

    </div>

    </div>
  <div>
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
  <UserConfig modalID="userconfig" />
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
  onUnmounted,
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
import UserConfig, { updateUserList } from '@/components/UserConfig.vue';

import { UpdateMessage } from '@/services/synchronization/typings.d';
import { updateServer } from '@/services/synchronization/outgoingMessageHandler';
import * as outgoingMessageHandler from '@/services/synchronization/outgoingMessageHandler';
import * as handleIncomingMessage from '@/services/synchronization/incomingMessageHandler';
import { ShapesWithID } from '@/utils/addCustomFabricObjects';
import router from '@/router';

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
    UserConfig,
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

    // eslint-disable-next-line prefer-destructuring
    const roomName = ref('unchanged');

    onMounted(() => {
      axios.get('./api/rooms/getRoomName', {
        params: {
          roomID: store.state.userID.roomID,
        },
      }).then((value) => {
        roomName.value = value.data;
      });
    });

    watch(() => store.state.userID.roomName, (newName: string) => {
      alert('new value');
      roomName.value = newName;
    });

    const deleteButtonDisabled = ref(true);

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
      const filteredObjArray = canvas.getObjects().filter((obj: fabric.ObjectWithID) => obj.get('id') === id);

      if (filteredObjArray.length === 1) {
        return filteredObjArray[0];
      } if (filteredObjArray.length === 0) {
        return null;
      }
      console.error(`Multiple objects found with ID = ${id}, objects = ${filteredObjArray}`);
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
      console.log(img);
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
      // eslint-disable-next-line max-len
      console.log(`permissions are room:${store.state.userID.roomEdit} and user: ${store.state.userID.canEdit}`);
      // eslint-disable-next-line max-len
      if ((store.state.userID.canEdit === true && store.state.userID.roomEdit === true) || (store.state.userID.Ta === true)) {
        console.log(store.state.userID.canEdit);
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
      } else {
        tool.value = ToolType.None;
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

    const editEquationOnCanvas = (
      oldEquation: fabric.EquationWithID,
      newEquation: EquationEditorUpdate,
    ) => {
      // Change latex and src data url
      oldEquation.set('latex', newEquation.texEquation);
      oldEquation.setSrc(newEquation.dataURL);

      // New Equation
      fabric.EquationWithID.fromURL(newEquation.dataURL, (eqnImg) => {
        canvasData.renderAll();
      }, oldEquation.toObject());
    };

    const getEquationUpdate = (equation: EquationEditorUpdate) => {
      console.log('in eqn update');
      debugger;
      // Find if id already exists on canvas
      const filteredObj = getObjectByID(canvasData, equation.id);

      if (filteredObj && filteredObj.isType(ShapesWithID.equation)) {
        console.log('equation with this id already exists');
        const eqnObj = filteredObj as fabric.EquationWithID;

        editEquationOnCanvas(eqnObj, equation);

        // Send outgoing update message
        outgoingMessageHandler.sendObjectModified(canvasData);
      } else {
        addEquationToCanvas(equation);
      }
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
      // Disable delete button
      deleteButtonDisabled.value = true;
      outgoingMessageHandler.sendObjectDeleted(canvasData);
    };

    const endRoom = () => {
      document.getElementById('endRoomBtn')!.remove();
      outgoingMessageHandler.endRoom();
      store.commit('userID/updateRoomID', '-1');
      document.cookie = 'RoomID =';
      router.push('/roomSelector');
    };

    const userPermissions = () => {
      updateUserList();
      const usermodalDiv = document.getElementById('userconfig');
      if (usermodalDiv) {
        Modal.getOrCreateInstance(usermodalDiv).show();
      }
    };

    const editPermissions = () => {
      outgoingMessageHandler.toggleEdit();
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

      // Reset Equation Modal Values
      equationButtonText.value = 'New Equation';
      equationLatex.value = '';
      equationID.value = '';
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

        // Enable delete button
        deleteButtonDisabled.value = false;

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

        // Disable delete button when object is deselected
        deleteButtonDisabled.value = true;

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
    function handleIncomingWebSocketMessage(message : MessageEvent) {
      // TODO: Import needs to be changed? Don't like calling default
      console.dir(message);
      console.log('right before the dir');
      handleIncomingMessage.default(canvasData, message, document);
      // eslint-disable-next-line max-len
      if ((store.state.userID.canEdit === false && tool.value !== ToolType.None && !store.state.userID.Ta) || (store.state.userID.roomEdit === false && tool.value !== ToolType.None && !store.state.userID.Ta)) {
        handleToolChange(ToolType.None);
      }
      if (document.getElementById('endRoomBtn') !== null) {
        document.getElementById('endRoomBtn')!.onclick = endRoom;
        document.getElementById('usereditt')!.onclick = userPermissions;
      }
      if (document.getElementById('edit') !== null) {
        document.getElementById('edit')!.onclick = editPermissions;
      }
      canvasData.renderAll();
    }
    onMounted(() => socket.addEventListener('message', handleIncomingWebSocketMessage));
    onUnmounted(() => socket.removeEventListener('message', handleIncomingWebSocketMessage));

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
    const leaveRoom = () => {
      outgoingMessageHandler.leaveRoom();
      store.commit('userID/updateRoomID', '-1');
      store.commit('userID/canEdit', 'true');
      router.push('/roomSelector');
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
      leaveRoom,
      roomName,
      getEquationUpdate,
      MODAL_ID,
      equationButtonText,
      equationLatex,
      equationID,
      handleEquationButton,
      deleteButtonDisabled,
      deleteSelected,
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
</style>
