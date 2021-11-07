<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas" height="480"></canvas>
  </div>
  <div>
    <span>
      <ColourPicker />
    </span>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
    <span><button @click="rectangle"> Rectangle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="lineTool"> Line Tool </button></span>
  </div>
  <span>
    state colour = {{ primaryColour }}
  </span>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, onMounted, reactive, Ref, ref, watch, WritableComputedRef,
} from 'vue';
import { useStore } from 'vuex';
import { fabric } from 'fabric';

import ColourPicker from '@/components/ToolPalette/ColourPicker.vue';

export default defineComponent({
  name: 'CanvasWrapper',
  components: {
    ColourPicker,
  },
  setup(props) {
    const store = useStore();

    let canvasData: fabric.Canvas = reactive((<fabric.Canvas> {}));
    let lineStatus = false;
    let firstCoord = false;
    let line : fabric.Line;
    const color = 'black';
    let lineFirstCoord:number[];
    let rect: fabric.Object;
    let circ: fabric.Object;
    let isDown: boolean;
    let origX: number;
    let origY: number;
    let tool: string;
    let radius: any;
    let strokeWidth: any;

    // Primary tool colour. Stored in Vuex Store
    const primaryColour: WritableComputedRef<string> = computed({
      get(): string {
        return store.state.primaryToolColour;
      },
      set(newValue: string): void {
        store.commit('updatePrimaryToolColour', newValue);
      },
    });

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
          fill: store.state.primaryToolColour,
          transparentCorners: false,
        });
        canvasData.add(rect);
      }
      if (tool === 'circle') {
        circ = new fabric.Circle({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          radius: pointer.x - origX,
          angle: 0,
          fill: 'blue',
          stroke: 'red',
          strokeWidth: 3,
        });
        canvasData.add(circ);
      }
    }

    function onMouseMove(o: { e: Event; }) {
      if (!isDown) return;
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
      }
      /*
      if (tool === 'circle') {

      } */
      canvasData.renderAll();
    }

    function onMouseUp(o: { e: Event; }) {
      isDown = false;
    }

    // Watch for changes to primaryColour, and change brush colour when primaryColour changes
    watch(primaryColour, (currentValue: string) => {
      canvasData.freeDrawingBrush.color = currentValue;
    });

    const penStatus: Ref<boolean> = ref(false);
    const lineTool = async () => {
      if (lineStatus === false) {
        lineStatus = true;
      } else {
        lineStatus = false;
      }
    };
    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      canvasData.freeDrawingBrush.color = primaryColour.value;
      console.log(`pen tool is now ${penStatus.value}`);
    };

    const rectangle = async () => {
      tool = 'rectangle';
      canvasData.on('mouse:down', onMouseDown);
      canvasData.on('mouse:move', onMouseMove);
      canvasData.on('mouse:up', onMouseUp);
    };
    const circle = async () => {
      tool = 'circle';
      canvasData.on('mouse:down', onMouseDown);
      canvasData.on('mouse:move', onMouseMove);
      canvasData.on('mouse:up', onMouseUp);
    };
    const deleteSelected = async () => {
      canvasData.remove(canvasData.getActiveObject());
    };
    const select = async () => {
      tool = 'select';
      canvasData.off('mouse:down', onMouseDown);
      canvasData.off('mouse:move', onMouseMove);
      canvasData.off('mouse:up', onMouseUp);
      canvasData.isDrawingMode = false;
    };
    const erase = async () => {
      canvasData.clear();
    };

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
        height: canvasDiv.clientHeight,
      });
      // Set Drawing mode
      canvasData.isDrawingMode = false;
      // Canvas events
      canvasData.on('mouse:down', async (event) => {
        const mouseX = canvasData.getPointer(event.e).x;
        const mouseY = canvasData.getPointer(event.e).y;
        if (lineStatus === true) {
          console.log('test');
          if (firstCoord === false) {
            lineFirstCoord = [mouseX, mouseY];
            firstCoord = true;
            line = new fabric.Line([lineFirstCoord[0], lineFirstCoord[1], mouseX, mouseY], {
              stroke: color,
              strokeWidth: 10,
              opacity: 0.5,
            });
            canvasData.add(line);
          } else {
            line.set({ x2: mouseX, y2: mouseY, opacity: 1 });
            line.setCoords();
            canvasData.renderAll();
            firstCoord = false;
          }
        }
      });
      canvasData.on('selection:created', async () => {
        console.log('selection created');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'delete selected element';
        deleteBtn.id = 'deleteBtn';
        deleteBtn.onclick = deleteSelected;
        document.body.appendChild(deleteBtn);
      });
      canvasData.on('selection:cleared', async () => {
        console.log('selection cleared');
        const elem = document.getElementById('deleteBtn');
        if (elem != null) {
          elem.remove();
        }
      });
      canvasData.on('mouse:move', async (event) => {
        console.log('mouse moved');
        if (firstCoord === true) {
          const mouseX = canvasData.getPointer(event.e).x;
          const mouseY = canvasData.getPointer(event.e).y;
          line.set({ x2: mouseX, y2: mouseY });
          canvasData.renderAll();
        }
      });
    };
    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);
    return {
      primaryColour,
      penStatus,
      canvasData,
      togglePenTool,
      rectangle,
      clearBoard,
      circle,
      select,
      erase,
      initFabricCanvas,
      lineTool,
    };
  },
});

</script>

<style>
.canvas-border {
  border: 1px solid black;
}
</style>
