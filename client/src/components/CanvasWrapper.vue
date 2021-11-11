<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span>
      <ColourPicker />
    </span>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
    <span><button @click="rectangle"> Rectangle </button></span>
    <span><button @click="circle"> Circle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="lineTool(event)"> Line Tool </button></span>
    <span><select name = 'thick' @click="getDropDown">
      <option value = '2'> 2px </option>
      <option value = '5'> 5px </option>
      <option value = '8'> 8px </option>
      <option value = '20'> 20px </option>
    </select></span>
  </div>
  <div>
    <span>current tool = {{ tool }}</span>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-shadow */
import { fabric } from 'fabric';
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
import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';

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
    let circ: fabric.Object;
    let isDown: boolean;
    let origX: number;
    let origY: number;
    const tool = ref(ToolType.None);
    let radius: any;
    let strokeWidth: any;
    // determines how thick line tool and pen tool are
    let lineThickness = 2;

    const canvasRatio = (16 / 6); // Aspect ratio of the canvas. Currently 16:9

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

    // event handler when mouse is pressed
    function onMouseDown(o: fabric.IEvent) {
      isDown = true;
      const pointer = canvasData.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;

      if (tool.value === ToolType.Rectangle) {
        rect = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          angle: 0,
          fill: store.state.primaryToolColour,
          strokeWidth: 2,
          stroke: 'blue',
          transparentCorners: false,
        });
        canvasData.add(rect);
      } else if (tool.value === ToolType.Circle) {
        circ = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          strokeWidth: 2,
          stroke: store.state.primaryToolColour,
          fill: 'White',
          originX: 'center',
          originY: 'center',

        });
        strokeWidth = circ.strokeWidth;
        canvasData.add(circ);
        // case line tool is selected
      } else if (tool.value === ToolType.Line) {
        // if first coord not placed, set it and start drawing line to mouse
        if (lTfirstCoordPlaced === false) {
          lineToollTFirstCoordPlaced = [origX, origY];
          lTfirstCoordPlaced = true;
          const width = lineThickness;

          line = new fabric.Line(
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
      }
    }
    // Mouse movemement handler
    function onMouseMove(o: fabric.IEvent) {
      if (!isDown && tool.value !== ToolType.Line) return;
      const pointer = canvasData.getPointer(o.e);
      radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;
      if (tool.value === ToolType.Rectangle) {
        if (origX > pointer.x) {
          rect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          rect.set({ top: Math.abs(pointer.y) });
        }

        rect.set({ width: Math.abs(origX - pointer.x) });
        rect.set({ height: Math.abs(origY - pointer.y) });
        rect.setCoords();
        canvasData.renderAll();
      } else if (tool.value === ToolType.Circle) {
        if (radius > strokeWidth) {
          radius -= strokeWidth / 2;
        }
        circ.set({ strokeWidth: radius });
        if (origX > pointer.x) {
          circ.set({ originX: 'right' });
        } else {
          circ.set({ originX: 'left' });
        }
        if (origY > pointer.y) {
          circ.set({ originY: 'bottom' });
        } else {
          circ.set({ originY: 'top' });
        }
        circ.setCoords();
        canvasData.renderAll();
        // line tool handler, makes line follow mouse
      } else if (tool.value === ToolType.Line) {
        if (lTfirstCoordPlaced === true) {
          line.set({ x2: pointer.x, y2: pointer.y });
          canvasData.renderAll();
        }
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
    // watch(lineThickness, (currentValue: any) => {
    // canvasData.freeDrawingBrush.width = currentValue;
    // });
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

    const penStatus: Ref<boolean> = ref(false);
    // handles the swapping to line tool
    const lineTool = async () => {
      if (tool.value === ToolType.Line) {
        tool.value = ToolType.None;
      } else {
        tool.value = ToolType.Line;
      }
      mouseEventsOn();
    };
    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      canvasData.freeDrawingBrush.color = primaryColour.value;
      canvasData.freeDrawingBrush.width = lineThickness;
      if (tool.value === ToolType.Pen) {
        tool.value = ToolType.None;
      } else {
        tool.value = ToolType.Pen;
      }
      mouseEventsOff();
    };

    const rectangle = async () => {
      if (tool.value === ToolType.Rectangle) {
        console.log('test');
        tool.value = ToolType.None;
      } else {
        tool.value = ToolType.Rectangle;
      }
      mouseEventsOff();
      mouseEventsOn();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };
    const circle = async () => {
      if (tool.value === ToolType.Circle) {
        console.log('test');
        tool.value = ToolType.None;
      } else {
        tool.value = ToolType.Circle;
      }
      mouseEventsOff();
      mouseEventsOn();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };
    // deletes selected object
    const deleteSelected = async () => {
      const objectList = canvasData.getActiveObjects();
      objectList.forEach((object) => { canvasData.remove(object); });
      const elem = document.getElementById('deleteBtn');
      if (elem != null) {
        elem.remove();
      }
    };
    const select = async () => {
      if (tool.value === ToolType.Select) {
        console.log('test');
        tool.value = ToolType.None;
      } else {
        tool.value = ToolType.Select;
      }
      mouseEventsOff();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };
    // clears board
    const clearBoard = async () => {
      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvasData.clear();
      }
    };
    // handles when line thickness is changed
    const getDropDown = async (event: any) => {
      if (event.target.value === undefined) { return; }
      lineThickness = parseInt(event.target.value, 10);
      canvasData.freeDrawingBrush.width = lineThickness;
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
      penStatus,
      canvasData,
      togglePenTool,
      rectangle,
      clearBoard,
      circle,
      select,
      initFabricCanvas,
      lineTool,
      getDropDown,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
