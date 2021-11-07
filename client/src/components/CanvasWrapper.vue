<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
    <span><button @click="rectangle"> Rectangle </button></span>
    <span><button @click="circle"> Circle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="erase"> Erase </button></span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onBeforeMount, onMounted, reactive, Ref, ref,
} from 'vue';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'CanvasWrapper',

  setup(props) {
    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    let rect: fabric.Object;
    let circ: fabric.Object;
    let isDown: boolean;
    let origX: number;
    let origY: number;
    let tool: string;
    let radius: any;
    let strokeWidth: any;

    function onMouseDown(o: { e: Event; }) {
      isDown = true;
      const pointer = canvasData.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;

      if (tool === 'rectangle') {
        rect = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          angle: 0,
          strokeWidth: 2,
          stroke: 'blue',
          fill: 'rgba(255,0,0,0.5)',
          transparentCorners: false,
        });
        canvasData.add(rect);
      } else if (tool === 'circle') {
        circ = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          strokeWidth: 2,
          stroke: 'red',
          fill: 'White',
          originX: 'center',
          originY: 'center',
        });
        strokeWidth = circ.strokeWidth;
        canvasData.add(circ);
      }
    }

    function onMouseMove(o: { e: Event; }) {
      if (!isDown) {
        return;
      }
      const pointer = canvasData.getPointer(o.e);
      radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;
      if (tool === 'rectangle') {
        if (origX > pointer.x) {
          rect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          rect.set({ top: Math.abs(pointer.y) });
        }

        rect.set({ width: Math.abs(origX - pointer.x) });
        rect.set({ height: Math.abs(origY - pointer.y) });
        canvasData.renderAll();
      } else if (tool === 'circle') {
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
        canvasData.renderAll();
      }
    }

    function onMouseUp(o: { e: Event; }) {
      isDown = false;
      /* canvasData.off('mouse:down', onMouseDown);
      canvasData.off('mouse:move', onMouseMove);
      canvasData.off('mouse:up', onMouseUp);
      */
    }

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

    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      console.log(`pen tool is now ${penStatus.value}`);
      mouseEventsOff();
    };

    const rectangle = async () => {
      tool = 'rectangle';
      mouseEventsOff();
      mouseEventsOn();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };
    const circle = async () => {
      tool = 'circle';
      mouseEventsOff();
      mouseEventsOn();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };

    const select = async () => {
      tool = 'select';
      mouseEventsOff();
      penStatus.value = false;
      canvasData.isDrawingMode = false;
    };
    const erase = async () => {
      canvasData.clear();
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
        height: canvasDiv.clientHeight,
      });

      // Set Drawing mode
      canvasData.isDrawingMode = false;
    };

    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);

    return {
      penStatus,
      canvasData,
      togglePenTool,
      rectangle,
      circle,
      select,
      erase,
      initFabricCanvas,
    };
  },
});
</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
