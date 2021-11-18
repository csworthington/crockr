<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span>
      <ColourPicker />
    </span>
    <span><button @click="handleToolChange(0)">Pen tool toggle</button></span>
    <span><button @click="handleToolChange(1)"> Rectangle </button></span>
    <span><button @click="handleToolChange(2)"> Circle </button></span>
    <span><button @click="handleToolChange(3)"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="handleToolChange(4)"> Line Tool </button></span>
    <span>
      <!-- <select name='thick' @click="getDropDown"> -->
      <select name="thick" v-model="lineThickness">
        <option v-for="option in thicknessOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
        <!-- <option value = '2'> 2px </option>
        <option value = '5'> 5px </option>
        <option value = '8'> 8px </option>
        <option value = '20'> 20px </option> -->
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
    let radius: any;
    let strokeWidth: any;
    // determines how thick line tool and pen tool are
    // let lineThickness = 2;

    const canvasRatio = (16 / 6); // Aspect ratio of the canvas. Currently 16:6

    const lineThickness: Ref<number> = ref(2);

    const thicknessOptions = [
      { text: '2px', value: 2 },
      { text: '5px', value: 5 },
      { text: '8px', value: 8 },
      { text: '20px', value: 20 },
    ];

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

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
        // tool.value = ToolType.Select;
      }
      console.log('system.test');
    }
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
        stroke: 'blue',
        transparentCorners: false,
      });
      canvasData.add(rect);
    }
    function circleDown(x : number, y : number) {
      circ = new CircleWithID({
        left: x,
        top: y,
        radius: 1,
        strokeWidth: 2,
        stroke: store.state.primaryToolColour,
        fill: 'store.state.primaryToolColour',
        originX: 'center',
        originY: 'center',
      });
      strokeWidth = circ.strokeWidth;
      canvasData.add(circ);
    }

    // event handler when mouse is pressed
    function onMouseDown(o: fabric.IEvent) {
      isDown = true;
      const pointer = canvasData.getPointer(o.e);
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
    function lineMove(x : number, y : number) {
      if (lTfirstCoordPlaced === true) {
        line.set({ x2: x, y2: y });
        canvasData.renderAll();
      }
    }
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
    // Mouse movemement handler
    function onMouseMove(o: fabric.IEvent) {
      if (!isDown && tool.value !== ToolType.Line) return;
      const pointer = canvasData.getPointer(o.e);
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

    function onMouseUp(o: fabric.IEvent) {
      isDown = false;
    }

    // Watch for changes to primaryColour, and change brush colour when primaryColour changes
    watch(primaryColour, (currentValue: string) => {
      canvasData.freeDrawingBrush.color = currentValue;
    });
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
     * Change the freeDrawingBrush width whenever lineThickness is changed.
     * Needed for changing the thickness of the brush when the pen tool is
     * active
     */
    watch(() => lineThickness.value, (currentValue: number) => {
      canvasData.freeDrawingBrush.width = currentValue;
    });

    function mouseEventsOff() {
      canvasData.off('mouse:down', onMouseDown);
      canvasData.off('mouse:move', onMouseMove);
      canvasData.off('mouse:up', onMouseUp);
    }
    function mouseEventsOn() {
      canvasData.on('mouse:down', onMouseDown);
      canvasData.on('mouse:move', onMouseMove);
      canvasData.on('mouse:up', onMouseUp);
    }

    // handles the swapping to line tool

    function handleToolChange(clickedTool : number) {
      mouseEventsOff();
      mouseEventsOn();
      canvasData.isDrawingMode = false;
      switch (clickedTool) {
        case 0: {
          tool.value = ToolType.Pen;
          canvasData.isDrawingMode = true;
          canvasData.freeDrawingBrush.color = primaryColour.value;
          canvasData.freeDrawingBrush.width = lineThickness.value;
          break;
        }
        case 1: {
          tool.value = ToolType.Rectangle;
          break;
        }
        case 2: {
          tool.value = ToolType.Circle;
          break;
        }
        case 3: {
          tool.value = ToolType.Select;
          break;
        }
        case 4: {
          tool.value = ToolType.Line;
          break;
        }
        default: {
          tool.value = ToolType.None;
          break;
        }
      }
    }

    // deletes selected object
    const deleteSelected = async () => {
      const objectList = canvasData.getActiveObjects();
      objectList.forEach((object) => { canvasData.remove(object); });
      const elem = document.getElementById('deleteBtn');
      if (elem != null) {
        elem.remove();
      }
    };

    // clears board
    const clearBoard = async () => {
      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvasData.clear();
      }
    };

    /**
     * Handle event when line thickness is changed
     */
    const getDropDown = async (event: any) => {
      if (event.target.value === undefined) { return; }
      lineThickness.value = parseInt(event.target.value, 10);
      canvasData.freeDrawingBrush.width = lineThickness.value;
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

    // Make canvas responsive when window is resized
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

    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);
    return {
      resizeCanvas,
      tool,
      canvasData,
      clearBoard,
      initFabricCanvas,
      getDropDown,
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
