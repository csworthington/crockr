<template>
  <div id="canvas-wrapper-div" class="canvas-border">
    <canvas id="main-canvas"></canvas>
  </div>
  <div>
    <span><button @click="togglePenTool">Pen tool toggle</button></span><span>{{ penStatus }}</span>
    <span><button @click="rectangle"> Rectangle </button></span>
    <span><button @click="select"> select </button></span>
    <span><button @click="clearBoard"> Clear </button></span>
    <span><button @click="lineTool"> Line Tool </button></span>
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
    let lineStatus = false;
    let firstCoord = false;
    let line : fabric.Line;
    const color = 'black';
    let lineFirstCoord:number[];
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
      console.log(`pen tool is now ${penStatus.value}`);
    };

    const rectangle = async () => {
      canvasData.clear();
    };
    const deleteSelected = async () => {
      canvasData.remove(canvasData.getActiveObject());
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
      penStatus,
      canvasData,
      togglePenTool,
      rectangle,
      clearBoard,
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
