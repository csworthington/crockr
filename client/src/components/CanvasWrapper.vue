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
    <span><button @click="circle"> Circle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="lineTool"> Line Tool </button></span>
  </div>
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
    const lineStatus = false;
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

    function onMouseDown(o: fabric.IEvent) {
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
          strokeWidth: 2,
          stroke: 'blue',
          transparentCorners: false,
        });
        canvasData.add(rect);
      } else if (tool === 'circle') {
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
      } else if (tool === 'line') {
        console.log('entered other if');
        if (firstCoord === false) {
          lineFirstCoord = [origX, origY];
          firstCoord = true;
          line = new fabric.Line([lineFirstCoord[0], lineFirstCoord[1], origX, origY], {
            stroke: store.state.primaryToolColour,
            strokeWidth: 10,
            opacity: 0.5,
          });
          canvasData.add(line);
        } else {
          line.set({ x2: origX, y2: origY, opacity: 1 });
          line.setCoords();
          canvasData.renderAll();
          firstCoord = false;
          tool = 'select';
        }
      }
    }

    function onMouseMove(o: fabric.IEvent) {
      if (!isDown && tool !== 'line') return;
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
        // line tool
      } else if (tool === 'line') {
        console.log('mouse moved');
        if (firstCoord === true) {
          console.log('true');
          line.set({ x2: pointer.x, y2: pointer.y });
          canvasData.renderAll();
        }
      }
    }

    function onMouseUp(o: fabric.IEvent) {
      isDown = false;
      if (tool !== 'line') {
        canvasData.off('mouse:down', onMouseDown);
        canvasData.off('mouse:move', onMouseMove);
        canvasData.off('mouse:up', onMouseUp);
      }
    }

    // Watch for changes to primaryColour, and change brush colour when primaryColour changes
    watch(primaryColour, (currentValue: string) => {
      canvasData.freeDrawingBrush.color = currentValue;
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

    const penStatus: Ref<boolean> = ref(false);

    const lineTool = async () => {
      console.log('test');
      tool = 'line';
      mouseEventsOn();
    };
    const togglePenTool = async () => {
      penStatus.value = !penStatus.value;
      canvasData.isDrawingMode = penStatus.value;
      canvasData.freeDrawingBrush.color = primaryColour.value;
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
    const deleteSelected = async () => {
      canvasData.remove(canvasData.getActiveObject());
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
      /* canvasData.on('mouse:down', async (event) => {
        const mouseX = canvasData.getPointer(event.e).x;
        const mouseY = canvasData.getPointer(event.e).y;
        if (tool === 'line') {
          console.log('test');
          if (firstCoord === false) {
            lineFirstCoord = [mouseX, mouseY];
            firstCoord = true;
            line = new fabric.Line([lineFirstCoord[0], lineFirstCoord[1], mouseX, mouseY], {
              stroke: store.state.primaryToolColour,
              strokeWidth: 10,
              opacity: 0.5,
            });
            canvasData.add(line);
          } else {
            line.set({ x2: mouseX, y2: mouseY, opacity: 1 });
            line.setCoords();
            canvasData.renderAll();
            firstCoord = false;
            tool = 'select';
          }
        }
      }); */
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

      /* canvasData.on('mouse:move', async (event) => {
        console.log('mouse moved');
        if (firstCoord === true) {
          const mouseX = canvasData.getPointer(event.e).x;
          const mouseY = canvasData.getPointer(event.e).y;
          line.set({ x2: mouseX, y2: mouseY });
          canvasData.renderAll();
        }
      }); */
    };
    // When component is mounted, run initFabricCanvas
    onMounted(initFabricCanvas);
    return {
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
