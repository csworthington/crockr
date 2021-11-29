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

import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';
// import Rectangle from '@/components/ToolPalette/Rectangle.vue';
import {
  RectWithID,
  CircleWithID,
  LineWithID,
} from '@/utils/fabric-object-extender';
import getUUID from '@/utils/id-generator';

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
    const store = useStore();

    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    canvasData.perPixelTargetFind = true;
    canvasData.targetFindTolerance = 8;
    // When line tool is active it determines if first click has occured
    let lTfirstCoordPlaced = false;
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
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

    /**
     * Start drawing a line on the canvas when the line tool is selected and the
     * mouse:down event has been fired by the canvas
     */
    function lineMouseDown() {
      if (lTfirstCoordPlaced === false) {
        lineToollTFirstCoordPlaced = [origX, origY];
        lTfirstCoordPlaced = true;
        const width = lineThickness.value;

        line = new LineWithID(
          [
            lineToollTFirstCoordPlaced[0],
            lineToollTFirstCoordPlaced[1],
            origX,
            origY,
          ],
          {
            stroke: store.state.primaryToolColour,
            strokeWidth: width,
            opacity: 0.5,
            strokeUniform: true,
            padding: 5,
          },
        );
        canvasData.add(line);
        // first coord already place so finalize line
      } else {
        line.set({ x2: origX, y2: origY, opacity: 1 });
        line.setCoords();
        canvasData.renderAll();
        lTfirstCoordPlaced = false;
      }
    }

    /**
     * Place a rectangle on the canvas when the rectangle tool is selected and
     * the mouse:down event has been fired by the canvas
     */
    function rectangleDown(x : number, y : number) {
      rect = new RectWithID({
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: x - origX,
        height: y - origY,
        angle: 0,
        fill: store.state.primaryToolColour,
        strokeWidth: 2,
        stroke: store.state.primaryToolColour,
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
        stroke: store.state.primaryToolColour,
        fill: store.state.primaryToolColour,
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
      if (lTfirstCoordPlaced === true) {
        line.set({ x2: x, y2: y });
        canvasData.renderAll();
      }
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
        rectangleDown(pointer.x, pointer.y);
      } else if (tool.value === ToolType.Circle) {
        circleDown(pointer.x, pointer.y);
        // case line tool is selected
      } else if (tool.value === ToolType.Line) {
        // if first coord not placed, set it and start drawing line to mouse
        lineMouseDown();
      }
    }

    /**
     * Primary event handler for fabric.js canvas mouse:move event
     * @param {fabric.IEvent<MouseEvent>} evt: Event fired by canvas
     */
    function handleMouseMoveEvent(evt: fabric.IEvent<Event>) {
      if (!isDown && tool.value !== ToolType.Line) return;

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
    const deleteSelected = async () => {
      const objectList = canvasData.getActiveObjects();
      objectList.forEach((object) => { canvasData.remove(object); });
      const elem = document.getElementById('deleteBtn');
      if (elem != null) {
        elem.remove();
      }
    };

    /**
     * Clear the canvas of all objects when the user selects the clear button
     */
    const clearBoard = async () => {
      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvasData.clear();
      }
    };

    /**
     * Initialize the Fabric.js canvas
     */
    const initFabricCanvas = async () => {
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
      canvasData.on('selection:created', async () => {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'delete selected element';
        deleteBtn.id = 'deleteBtn';
        deleteBtn.onclick = deleteSelected;
        document.body.appendChild(deleteBtn);
      });
      canvasData.on('selection:cleared', async () => {
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

    // Hook resize callback into creation and destruction of this element
    onBeforeMount(() => window.addEventListener('resize', resizeCanvas));
    onBeforeUnmount(() => window.removeEventListener('resize', resizeCanvas));

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
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
